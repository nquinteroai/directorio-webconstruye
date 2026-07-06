import { after } from "next/server";
import { notFound, redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { clienteServicio } from "@/lib/supabase/admin";
import {
  normalizarFuente,
  registrarClick,
  SEGMENTO_A_TIPO,
} from "@/lib/tracking";
import { telefonoHref } from "@/lib/utils/formato";
import { esWhatsappValido, linkWhatsapp } from "@/lib/utils/whatsapp";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tipo: string; slug: string }>;
}

/**
 * Redirección con registro de clic: /ir/whatsapp/mi-negocio?f=ficha
 *
 * 1. Busca el negocio y arma el destino real (wa.me, tel:, sitio, Google Maps).
 * 2. Registra el clic DESPUÉS de responder (after()): la redirección 302 sale
 *    de inmediato y el INSERT no frena al visitante.
 * 3. X-Robots-Tag + robots.txt mantienen estas URLs fuera de Google.
 */
export async function GET(request: NextRequest, { params }: Props) {
  const { tipo: segmento, slug } = await params;
  const tipo = SEGMENTO_A_TIPO[segmento];
  if (!tipo) notFound();

  const supabase = clienteServicio();
  if (!supabase) redirect(`/negocio/${slug}`); // Sin credenciales: al menos navegar.

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, slug, whatsapp, telefono, sitio_web, lat, lng")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  if (!negocio) notFound();

  let destino: string | null = null;
  switch (tipo) {
    case "whatsapp":
      destino =
        negocio.whatsapp && esWhatsappValido(negocio.whatsapp)
          ? linkWhatsapp(negocio.whatsapp, siteConfig.mensajeWhatsappNegocio)
          : null;
      break;
    case "llamada":
      destino = negocio.telefono ? telefonoHref(negocio.telefono) : null;
      break;
    case "sitio_web":
      destino = negocio.sitio_web;
      break;
    case "como_llegar":
      destino = `https://www.google.com/maps/dir/?api=1&destination=${negocio.lat},${negocio.lng}`;
      break;
  }

  // El negocio no tiene este canal: de vuelta a la ficha, sin registrar nada.
  if (!destino) redirect(`/negocio/${negocio.slug}`);

  const fuente = normalizarFuente(request.nextUrl.searchParams.get("f"));
  after(() => registrarClick(negocio.id, tipo, fuente));

  return NextResponse.redirect(destino, {
    status: 302,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
