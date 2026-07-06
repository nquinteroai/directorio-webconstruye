"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { clienteServidor } from "@/lib/supabase/servidor";
import { ICONOS_CATEGORIA } from "@/lib/iconos";
import { esSlugValido } from "@/lib/utils/slug";
import type { EstadoSimple } from "@/app/admin/(panel)/zonas/acciones";

const esquemaCategoria = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre.").max(80),
  slug: z.string().trim().refine(esSlugValido, "Solo minúsculas, números y guiones."),
  icono: z
    .string()
    .refine((v) => v in ICONOS_CATEGORIA, "Elige un ícono de la lista."),
  orden: z.coerce.number().int().min(0).max(999),
  descripcion_seo: z
    .string()
    .trim()
    .min(40, "Mínimo 40 caracteres: se usa en las páginas de categoría."),
});

export async function guardarCategoria(
  _estado: EstadoSimple,
  formData: FormData,
): Promise<EstadoSimple> {
  const supabase = await clienteServidor();
  if (!supabase) {
    return { ok: false, mensaje: "Supabase no está configurado.", errores: {} };
  }

  const crudo = Object.fromEntries(formData.entries());
  const datos = esquemaCategoria.safeParse(crudo);
  if (!datos.success) {
    const errores: Record<string, string> = {};
    for (const problema of datos.error.issues) {
      const campo = String(problema.path[0] ?? "");
      if (campo && !errores[campo]) errores[campo] = problema.message;
    }
    return { ok: false, mensaje: "Revisa los campos marcados.", errores };
  }

  const id = typeof crudo.id === "string" && crudo.id !== "" ? crudo.id : null;

  const { error } = id
    ? await supabase.from("categorias").update(datos.data).eq("id", id)
    : await supabase.from("categorias").insert(datos.data);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        mensaje: "Ese slug ya existe.",
        errores: { slug: "Ya hay una categoría con esta URL." },
      };
    }
    console.error("[admin] guardarCategoria:", error.message);
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}`, errores: {} };
  }

  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Categoría guardada.", errores: {} };
}
