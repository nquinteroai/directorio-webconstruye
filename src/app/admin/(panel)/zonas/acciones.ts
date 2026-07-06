"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { clienteServidor } from "@/lib/supabase/servidor";
import { esSlugValido } from "@/lib/utils/slug";

export interface EstadoSimple {
  ok: boolean;
  mensaje: string | null;
  errores: Record<string, string>;
}

const esquemaZona = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre de la zona.").max(80),
  slug: z.string().trim().refine(esSlugValido, "Solo minúsculas, números y guiones."),
  ciudad: z.string().trim().min(2, "Escribe la ciudad.").max(80),
  departamento: z.string().trim().min(2, "Escribe el departamento.").max(80),
  lat: z.coerce.number().min(-4.5, "Latitud fuera de Colombia.").max(13.5),
  lng: z.coerce.number().min(-82, "Longitud fuera de Colombia.").max(-66),
  zoom: z.coerce.number().int().min(3).max(19),
  descripcion_seo: z
    .string()
    .trim()
    .min(120, "Mínimo 120 caracteres: este texto posiciona la zona en Google."),
});

export async function guardarZona(
  _estado: EstadoSimple,
  formData: FormData,
): Promise<EstadoSimple> {
  const supabase = await clienteServidor();
  if (!supabase) {
    return { ok: false, mensaje: "Supabase no está configurado.", errores: {} };
  }

  const crudo = Object.fromEntries(formData.entries());
  const datos = esquemaZona.safeParse(crudo);
  if (!datos.success) {
    const errores: Record<string, string> = {};
    for (const problema of datos.error.issues) {
      const campo = String(problema.path[0] ?? "");
      if (campo && !errores[campo]) errores[campo] = problema.message;
    }
    return { ok: false, mensaje: "Revisa los campos marcados.", errores };
  }

  const id = typeof crudo.id === "string" && crudo.id !== "" ? crudo.id : null;
  const registro = { ...datos.data, activa: formData.get("activa") === "on" };

  const { error } = id
    ? await supabase.from("zonas").update(registro).eq("id", id)
    : await supabase.from("zonas").insert(registro);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        mensaje: "Ese slug ya existe.",
        errores: { slug: "Ya hay una zona con esta URL." },
      };
    }
    console.error("[admin] guardarZona:", error.message);
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}`, errores: {} };
  }

  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Zona guardada.", errores: {} };
}
