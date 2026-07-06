import { NextResponse, type NextRequest } from "next/server";
import { obtenerCategorias } from "@/lib/queries/categorias";
import { buscarNegocios } from "@/lib/queries/negocios";
import { obtenerZonas } from "@/lib/queries/zonas";

export interface SugerenciaBusqueda {
  slug: string;
  nombre: string;
  descripcion_corta: string;
  zona: string;
  categoria: string;
  destacado: boolean;
}

/** Autocompletado del buscador. Respuesta ligera, cacheable unos segundos. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ resultados: [] as SugerenciaBusqueda[] });
  }

  const [resultados, zonas, categorias] = await Promise.all([
    buscarNegocios(q, 8),
    obtenerZonas(),
    obtenerCategorias(),
  ]);

  const nombreZona = new Map(zonas.map((z) => [z.id, z.nombre]));
  const nombreCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));

  const sugerencias: SugerenciaBusqueda[] = resultados.map((r) => ({
    slug: r.slug,
    nombre: r.nombre,
    descripcion_corta: r.descripcion_corta,
    zona: nombreZona.get(r.zona_id) ?? "",
    categoria: nombreCategoria.get(r.categoria_id) ?? "",
    destacado: r.destacado,
  }));

  return NextResponse.json(
    { resultados: sugerencias },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=120" } },
  );
}
