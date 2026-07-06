import { cache } from "react";
import { clientePublico } from "@/lib/supabase/publico";
import type {
  Categoria,
  Negocio,
  NegocioConRelaciones,
  Zona,
} from "@/types/database";

/**
 * Campos mínimos para pintar una tarjeta de negocio en listados,
 * carruseles y resultados de búsqueda.
 */
export interface TarjetaNegocio {
  id: string;
  slug: string;
  nombre: string;
  descripcion_corta: string;
  barrio: string | null;
  logo_url: string | null;
  foto_portada_url: string | null;
  destacado: boolean;
  verificado: boolean;
  horarios: Negocio["horarios"];
  categoria: Pick<Categoria, "slug" | "nombre" | "icono">;
  zona: Pick<Zona, "slug" | "nombre">;
}

const CAMPOS_TARJETA = `id, slug, nombre, descripcion_corta, barrio, logo_url,
  foto_portada_url, destacado, verificado, horarios,
  categoria:categorias(slug, nombre, icono), zona:zonas(slug, nombre)`;

/**
 * Ficha completa por slug (solo negocios activos). Envuelto en React cache():
 * generateMetadata y la página comparten la misma consulta por render.
 */
export const obtenerNegocioPorSlug = cache(
  async (slug: string): Promise<NegocioConRelaciones | null> => {
    const supabase = clientePublico();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("negocios")
      .select("*, zona:zonas(*), categoria:categorias(*)")
      .eq("slug", slug)
      .eq("activo", true)
      .maybeSingle();
    if (error) {
      console.error("[negocios] obtenerNegocioPorSlug:", error.message);
      return null;
    }
    return data as unknown as NegocioConRelaciones | null;
  },
);

/** Slugs de todos los negocios activos (para generateStaticParams). */
export async function obtenerSlugsNegocios(): Promise<string[]> {
  const supabase = clientePublico();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("negocios")
    .select("slug")
    .eq("activo", true);
  if (error) {
    console.error("[negocios] obtenerSlugsNegocios:", error.message);
    return [];
  }
  return data.map((n) => n.slug);
}

/** Negocios destacados para el carrusel de la home. */
export async function obtenerDestacados(
  limite = 8,
): Promise<TarjetaNegocio[]> {
  const supabase = clientePublico();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("negocios")
    .select(CAMPOS_TARJETA)
    .eq("activo", true)
    .eq("destacado", true)
    .order("nombre")
    .limit(limite);
  if (error) {
    console.error("[negocios] obtenerDestacados:", error.message);
    return [];
  }
  return data as unknown as TarjetaNegocio[];
}

/**
 * "Negocios similares": misma categoría y zona (sin el actual); si no
 * alcanza, completa con otros negocios de la misma zona.
 */
export async function obtenerSimilares(
  negocio: Pick<Negocio, "id" | "zona_id" | "categoria_id">,
  limite = 4,
): Promise<TarjetaNegocio[]> {
  const supabase = clientePublico();
  if (!supabase) return [];

  const { data: mismos, error } = await supabase
    .from("negocios")
    .select(CAMPOS_TARJETA)
    .eq("activo", true)
    .eq("zona_id", negocio.zona_id)
    .eq("categoria_id", negocio.categoria_id)
    .neq("id", negocio.id)
    .order("destacado", { ascending: false })
    .limit(limite);
  if (error) {
    console.error("[negocios] obtenerSimilares:", error.message);
    return [];
  }

  const similares = (mismos ?? []) as unknown as TarjetaNegocio[];
  if (similares.length >= limite) return similares;

  const { data: vecinos, error: errorVecinos } = await supabase
    .from("negocios")
    .select(CAMPOS_TARJETA)
    .eq("activo", true)
    .eq("zona_id", negocio.zona_id)
    .neq("id", negocio.id)
    .neq("categoria_id", negocio.categoria_id)
    .order("destacado", { ascending: false })
    .limit(limite - similares.length);
  if (errorVecinos) return similares;

  return [...similares, ...((vecinos ?? []) as unknown as TarjetaNegocio[])];
}
