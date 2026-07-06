import { imagenOg, TAMANO_OG } from "@/lib/seo/og";
import { obtenerZonaPorSlug } from "@/lib/queries/zonas";

export const alt = "Negocios de la zona en el Directorio Webconstruye";
export const size = TAMANO_OG;
export const contentType = "image/png";

interface Props {
  params: Promise<{ zona: string }>;
}

export default async function ImagenOgZona({ params }: Props) {
  const { zona: slugZona } = await params;
  const zona = await obtenerZonaPorSlug(slugZona);

  return imagenOg({
    titulo: zona ? `Negocios en ${zona.nombre}` : "Negocios locales",
    subtitulo: zona
      ? `El comercio de ${zona.nombre}, ${zona.ciudad}: contactos directos, horarios y cómo llegar.`
      : undefined,
    etiqueta: zona ? `${zona.ciudad}, ${zona.departamento}` : undefined,
  });
}
