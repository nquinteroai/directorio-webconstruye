import { after } from "next/server";
import { NextResponse, type NextRequest } from "next/server";
import { clienteServicio } from "@/lib/supabase/admin";
import { normalizarFuente, registrarClick } from "@/lib/tracking";

export const dynamic = "force-dynamic";

/**
 * Beacon de vistas de ficha (navigator.sendBeacon desde el cliente).
 *
 * Las páginas públicas son estáticas (ISR): el servidor NO ve cada visita,
 * así que la vista se reporta desde el navegador. Sin datos personales:
 * solo negocio, tipo y fuente.
 */
export async function POST(request: NextRequest) {
  let cuerpo: { slug?: unknown; fuente?: unknown };
  try {
    // sendBeacon envía text/plain: se parsea a mano.
    cuerpo = JSON.parse(await request.text()) as typeof cuerpo;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const slug = typeof cuerpo.slug === "string" ? cuerpo.slug : "";
  if (!slug || slug.length > 120) {
    return new NextResponse(null, { status: 400 });
  }

  const supabase = clienteServicio();
  if (!supabase) return new NextResponse(null, { status: 204 });

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  if (!negocio) return new NextResponse(null, { status: 204 });

  const fuente = normalizarFuente(
    typeof cuerpo.fuente === "string" ? cuerpo.fuente : null,
  );
  after(() => registrarClick(negocio.id, "vista_ficha", fuente));

  return new NextResponse(null, { status: 204 });
}
