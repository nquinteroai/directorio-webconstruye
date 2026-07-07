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
  lat: number;
  lng: number;
  logo_url: string | null;
  foto_portada_url: string | null;
  destacado: boolean;
  verificado: boolean;
  horarios: Negocio["horarios"];
  categoria: Pick<Categoria, "slug" | "nombre" | "icono">;
  zona: Pick<Zona, "slug" | "nombre">;
}

const CAMPOS_TARJETA = `id, slug, nombre, descripcion_corta, barrio, lat, lng,
  logo_url, foto_portada_url, destacado, verificado, horarios,
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

/** Tarjetas de todos los negocios activos de una zona. */
export const obtenerPorZona = cache(
  async (zonaId: string): Promise<TarjetaNegocio[]> => {
    const supabase = clientePublico();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("negocios")
      .select(CAMPOS_TARJETA)
      .eq("activo", true)
      .eq("zona_id", zonaId)
      .order("destacado", { ascending: false })
      .order("nombre");
    if (error) {
      console.error("[negocios] obtenerPorZona:", error.message);
      return [];
    }
    return data as unknown as TarjetaNegocio[];
  },
);

/** Tarjetas de una combinación zona × categoría (cache: metadata + página). */
export const obtenerPorZonaYCategoria = cache(
  async (zonaId: string, categoriaId: string): Promise<TarjetaNegocio[]> => {
    const supabase = clientePublico();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("negocios")
      .select(CAMPOS_TARJETA)
      .eq("activo", true)
      .eq("zona_id", zonaId)
      .eq("categoria_id", categoriaId)
      .order("destacado", { ascending: false })
      .order("nombre");
    if (error) {
      console.error("[negocios] obtenerPorZonaYCategoria:", error.message);
      return [];
    }
    return data as unknown as TarjetaNegocio[];
  },
);

export interface CombinacionZonaCategoria {
  zona: Pick<Zona, "slug" | "nombre">;
  categoria: Pick<Categoria, "slug" | "nombre" | "icono">;
  total: number;
}

/**
 * Combinaciones zona × categoría con al menos 1 negocio activo.
 * Alimenta el footer, /categorias y generateStaticParams de las landings.
 */
export const obtenerCombinacionesActivas = cache(
  async (): Promise<CombinacionZonaCategoria[]> => {
    const supabase = clientePublico();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("negocios")
      .select(
        "zona:zonas(slug, nombre), categoria:categorias(slug, nombre, icono, orden)",
      )
      .eq("activo", true);
    if (error) {
      console.error("[negocios] obtenerCombinacionesActivas:", error.message);
      return [];
    }

    const mapa = new Map<
      string,
      CombinacionZonaCategoria & { orden: number }
    >();
    for (const fila of data as unknown as {
      zona: Pick<Zona, "slug" | "nombre"> | null;
      categoria:
        | (Pick<Categoria, "slug" | "nombre" | "icono"> & { orden: number })
        | null;
    }[]) {
      if (!fila.zona || !fila.categoria) continue;
      const clave = `${fila.zona.slug}/${fila.categoria.slug}`;
      const existente = mapa.get(clave);
      if (existente) {
        existente.total += 1;
      } else {
        mapa.set(clave, {
          zona: fila.zona,
          categoria: {
            slug: fila.categoria.slug,
            nombre: fila.categoria.nombre,
            icono: fila.categoria.icono,
          },
          total: 1,
          orden: fila.categoria.orden,
        });
      }
    }
    return [...mapa.values()]
      .sort(
        (a, b) =>
          a.zona.nombre.localeCompare(b.zona.nombre, "es") ||
          a.orden - b.orden,
      )
      .map((combo) => ({
        zona: combo.zona,
        categoria: combo.categoria,
        total: combo.total,
      }));
  },
);

/** Búsqueda pública vía RPC (full-text español + subcadena). */
export async function buscarNegocios(q: string, limite = 20) {
  const supabase = clientePublico();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("buscar_negocios", {
    q,
    p_limite: limite,
  });
  if (error) {
    console.error("[negocios] buscarNegocios:", error.message);
    return [];
  }
  return data;
}

/** Tarjetas por lista de ids, conservando el orden recibido. */
export async function obtenerTarjetasPorIds(
  ids: string[],
): Promise<TarjetaNegocio[]> {
  const supabase = clientePublico();
  if (!supabase || ids.length === 0) return [];
  const { data, error } = await supabase
    .from("negocios")
    .select(CAMPOS_TARJETA)
    .in("id", ids)
    .eq("activo", true);
  if (error) {
    console.error("[negocios] obtenerTarjetasPorIds:", error.message);
    return [];
  }
  const tarjetas = data as unknown as TarjetaNegocio[];
  const posicion = new Map(ids.map((id, i) => [id, i]));
  return tarjetas.sort(
    (a, b) => (posicion.get(a.id) ?? 0) - (posicion.get(b.id) ?? 0),
  );
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
