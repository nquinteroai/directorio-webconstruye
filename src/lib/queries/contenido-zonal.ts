import { clientePublico } from "@/lib/supabase/publico";
import type { FaqZonal } from "@/types/database";

export interface ContenidoZonal {
  intro_html: string;
  faqs: FaqZonal[];
}

/** Contenido editorial de una página categoría×zona; `null` si no existe. */
export async function obtenerContenidoZonal(
  categoriaId: string,
  zonaId: string,
): Promise<ContenidoZonal | null> {
  const supabase = clientePublico();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("contenido_zonal")
    .select("intro_html, faqs")
    .eq("categoria_id", categoriaId)
    .eq("zona_id", zonaId)
    .maybeSingle();
  if (error) {
    console.error("[contenido-zonal] obtenerContenidoZonal:", error.message);
    return null;
  }
  if (!data) return null;
  const faqs = Array.isArray(data.faqs)
    ? (data.faqs as unknown as FaqZonal[])
    : [];
  return { intro_html: data.intro_html, faqs };
}
