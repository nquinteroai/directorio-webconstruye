"use server";

import { revalidatePath } from "next/cache";
import { clienteServidor } from "@/lib/supabase/servidor";

/** Aprueba una reseña: se vuelve visible en la ficha pública. */
export async function aprobarResena(id: string): Promise<{ ok: boolean }> {
  const supabase = await clienteServidor();
  if (!supabase) return { ok: false };
  const { error } = await supabase
    .from("resenas")
    .update({ aprobada: true })
    .eq("id", id);
  if (error) {
    console.error("[admin] aprobarResena:", error.message);
    return { ok: false };
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/resenas");
  return { ok: true };
}

/** Rechaza (elimina) una reseña. */
export async function eliminarResena(id: string): Promise<{ ok: boolean }> {
  const supabase = await clienteServidor();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from("resenas").delete().eq("id", id);
  if (error) {
    console.error("[admin] eliminarResena:", error.message);
    return { ok: false };
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/resenas");
  return { ok: true };
}
