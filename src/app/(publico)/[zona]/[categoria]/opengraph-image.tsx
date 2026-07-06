import { imagenOg, TAMANO_OG } from "@/lib/seo/og";
import { obtenerCategoriaPorSlug } from "@/lib/queries/categorias";
import { obtenerZonaPorSlug } from "@/lib/queries/zonas";

export const alt = "Categoría de negocios por zona en el Directorio Webconstruye";
export const size = TAMANO_OG;
export const contentType = "image/png";

interface Props {
  params: Promise<{ zona: string; categoria: string }>;
}

export default async function ImagenOgZonaCategoria({ params }: Props) {
  const { zona: slugZona, categoria: slugCategoria } = await params;
  const [zona, categoria] = await Promise.all([
    obtenerZonaPorSlug(slugZona),
    obtenerCategoriaPorSlug(slugCategoria),
  ]);

  return imagenOg({
    titulo:
      zona && categoria
        ? `${categoria.nombre} en ${zona.nombre}`
        : "Negocios locales",
    subtitulo: categoria?.descripcion_seo,
    etiqueta: zona ? `${zona.ciudad}, ${zona.departamento}` : undefined,
  });
}
