import { imagenOg, TAMANO_OG } from "@/lib/seo/og";
import { obtenerNegocioPorSlug } from "@/lib/queries/negocios";

export const alt = "Ficha del negocio en el Directorio Webconstruye";
export const size = TAMANO_OG;
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ImagenOgNegocio({ params }: Props) {
  const { slug } = await params;
  const negocio = await obtenerNegocioPorSlug(slug);

  return imagenOg({
    titulo: negocio?.nombre ?? "Negocio local",
    subtitulo: negocio
      ? `${negocio.direccion}${negocio.barrio ? ` · ${negocio.barrio}` : ""}`
      : undefined,
    etiqueta: negocio
      ? `${negocio.categoria.nombre} en ${negocio.zona.nombre}`
      : undefined,
  });
}
