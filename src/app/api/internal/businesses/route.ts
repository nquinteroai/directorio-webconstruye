import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { clienteServicio } from "@/lib/supabase/admin";
import { esquemaSyncVenta } from "@/lib/sync/esquema";
import { publicarVenta } from "@/lib/sync/publicar";
import type { Json, ResultadoSync } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * Webhook interno CRM → Directorio: publica el listado de un negocio cuando
 * webconstruye-ventas confirma una venta (INSERT en visitas, estado='venta').
 *
 * Seguridad: clave compartida SYNC_INTERNAL_KEY (Bearer). Sin la env var el
 * endpoint está APAGADO (503) — así el deploy es inerte hasta la activación.
 *
 * Idempotencia: la fila de sync_eventos con PK evento_id actúa de candado;
 * un webhook reintentado devuelve el resultado ya registrado sin duplicar.
 * El único filtro de calidad antes de publicar es el match contra el demo
 * (ver src/lib/sync/match.ts): sin match confiable NO se publica y el evento
 * queda como 'sin_match' para revisión manual en la tabla.
 */
export async function POST(request: NextRequest) {
  const clave = process.env.SYNC_INTERNAL_KEY;
  if (!clave) {
    return NextResponse.json({ error: "Sync no configurado." }, { status: 503 });
  }
  if (!autorizado(request.headers.get("authorization"), clave)) {
    return new NextResponse(null, { status: 401 });
  }

  let crudo: unknown;
  try {
    crudo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const datos = esquemaSyncVenta.safeParse(crudo);
  if (!datos.success) {
    return NextResponse.json(
      { error: "Payload inválido.", detalle: datos.error.issues },
      { status: 422 },
    );
  }
  const payload = datos.data;

  const supabase = clienteServicio();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 503 });
  }

  // Candado de idempotencia: reclamar el evento_id.
  const { error: errClaim } = await supabase.from("sync_eventos").insert({
    evento_id: payload.evento_id,
    origen: payload.origen,
    resultado: "procesando",
    payload: payload as unknown as Json,
  });
  if (errClaim) {
    if (errClaim.code !== "23505") {
      return NextResponse.json({ error: errClaim.message }, { status: 500 });
    }
    const { data: previo } = await supabase
      .from("sync_eventos")
      .select("resultado, negocio_id, detalle")
      .eq("evento_id", payload.evento_id)
      .maybeSingle();
    if (!previo) {
      return NextResponse.json({ error: "Evento en estado inconsistente." }, { status: 500 });
    }
    if (previo.resultado === "procesando") {
      // Otro reintento lo está procesando en este momento.
      return NextResponse.json({ resultado: "procesando" }, { status: 409 });
    }
    if (previo.resultado === "error") {
      // Los errores son re-procesables: retomar el candado y continuar.
      await supabase
        .from("sync_eventos")
        .update({ resultado: "procesando", payload: payload as unknown as Json })
        .eq("evento_id", payload.evento_id);
    } else {
      return NextResponse.json(
        { resultado: previo.resultado, negocio_id: previo.negocio_id },
        { status: 200 },
      );
    }
  }

  let resultado: Awaited<ReturnType<typeof publicarVenta>>;
  try {
    resultado = await publicarVenta(supabase, payload);
  } catch (e) {
    resultado = {
      resultado: "error",
      detalle: { motivo: e instanceof Error ? e.message : String(e) },
    };
  }

  await supabase
    .from("sync_eventos")
    .update({
      resultado: resultado.resultado as ResultadoSync,
      negocio_id: resultado.negocioId ?? null,
      detalle: resultado.detalle ?? null,
    })
    .eq("evento_id", payload.evento_id);

  if (resultado.resultado === "publicado") {
    // El listado nuevo afecta home, listados, sitemap y footer.
    revalidatePath("/", "layout");
    return NextResponse.json(
      { resultado: "publicado", negocio_id: resultado.negocioId, slug: resultado.slug },
      { status: 201 },
    );
  }
  if (resultado.resultado === "error") {
    return NextResponse.json(
      { resultado: "error", detalle: resultado.detalle },
      { status: 500 },
    );
  }
  // sin_match y duplicado son finales: 200 para que el webhook no reintente.
  return NextResponse.json(
    { resultado: resultado.resultado, negocio_id: resultado.negocioId ?? null },
    { status: 200 },
  );
}

function autorizado(encabezado: string | null, clave: string): boolean {
  if (!encabezado?.startsWith("Bearer ")) return false;
  const recibida = Buffer.from(encabezado.slice(7));
  const esperada = Buffer.from(clave);
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}
