import { clientePublico } from "@/lib/supabase/publico";
import type { Resena } from "@/types/database";

export interface ResumenResenas {
  promedio: number;
  total: number;
}

/** Reseñas aprobadas de un negocio, recientes primero. */
export async function obtenerResenasAprobadas(
  negocioId: string,
  limite = 30,
): Promise<Resena[]> {
  const supabase = clientePublico();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("resenas")
    .select("*")
    .eq("negocio_id", negocioId)
    .eq("aprobada", true)
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) {
    console.error("[resenas] obtenerResenasAprobadas:", error.message);
    return [];
  }
  return data;
}

/** Promedio y total de reseñas aprobadas (para rating y JSON-LD). */
export function resumirResenas(resenas: Pick<Resena, "calificacion">[]): ResumenResenas | null {
  if (resenas.length === 0) return null;
  const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
  return {
    promedio: Math.round((suma / resenas.length) * 10) / 10,
    total: resenas.length,
  };
}
