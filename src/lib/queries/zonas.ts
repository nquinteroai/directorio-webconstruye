import { cache } from "react";
import { clientePublico } from "@/lib/supabase/publico";
import type { Zona } from "@/types/database";

/**
 * Zonas activas, en orden alfabético. Con React cache(): el encabezado y el
 * pie la piden en el mismo render y comparten una sola consulta.
 */
export const obtenerZonas = cache(async (): Promise<Zona[]> => {
  const supabase = clientePublico();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("zonas")
    .select("*")
    .eq("activa", true)
    .order("nombre");
  if (error) {
    console.error("[zonas] obtenerZonas:", error.message);
    return [];
  }
  return data;
});

export const obtenerZonaPorSlug = cache(
  async (slug: string): Promise<Zona | null> => {
    const supabase = clientePublico();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("zonas")
      .select("*")
      .eq("slug", slug)
      .eq("activa", true)
      .maybeSingle();
    if (error) {
      console.error("[zonas] obtenerZonaPorSlug:", error.message);
      return null;
    }
    return data;
  },
);
