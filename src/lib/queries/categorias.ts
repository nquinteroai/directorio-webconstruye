import { clientePublico } from "@/lib/supabase/publico";
import type { Categoria } from "@/types/database";

/** Todas las categorías, ordenadas por `orden`. */
export async function obtenerCategorias(): Promise<Categoria[]> {
  const supabase = clientePublico();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden")
    .order("nombre");
  if (error) {
    console.error("[categorias] obtenerCategorias:", error.message);
    return [];
  }
  return data;
}

export async function obtenerCategoriaPorSlug(
  slug: string,
): Promise<Categoria | null> {
  const supabase = clientePublico();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[categorias] obtenerCategoriaPorSlug:", error.message);
    return null;
  }
  return data;
}
