"use server";

import { z } from "zod";
import { clienteServicio } from "@/lib/supabase/admin";

export interface EstadoResena {
  ok: boolean;
  mensaje: string | null;
  errores: Partial<Record<"nombre_autor" | "calificacion" | "comentario", string>>;
}

const esquemaResena = z.object({
  slug: z.string().min(1),
  nombre_autor: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre (mínimo 2 letras).")
    .max(80, "El nombre es demasiado largo."),
  calificacion: z.coerce
    .number()
    .int()
    .min(1, "Elige una calificación de 1 a 5 estrellas.")
    .max(5, "Elige una calificación de 1 a 5 estrellas."),
  comentario: z
    .string()
    .trim()
    .max(1000, "El comentario no puede superar 1.000 caracteres.")
    .optional(),
});

/**
 * Crea una reseña PENDIENTE de moderación. Corre en el servidor con la clave
 * de servicio (no hay políticas de escritura anónimas en la base de datos) y
 * SIEMPRE fuerza `aprobada: false`: solo el admin publica reseñas.
 */
export async function crearResena(
  _estadoAnterior: EstadoResena,
  formData: FormData,
): Promise<EstadoResena> {
  // Honeypot anti-bots: los humanos nunca ven ni llenan este campo.
  if (String(formData.get("sitio_web_confirmacion") ?? "") !== "") {
    return { ok: true, mensaje: "¡Gracias por tu reseña!", errores: {} };
  }

  const datos = esquemaResena.safeParse({
    slug: formData.get("slug"),
    nombre_autor: formData.get("nombre_autor"),
    calificacion: formData.get("calificacion"),
    comentario: formData.get("comentario"),
  });

  if (!datos.success) {
    const errores: EstadoResena["errores"] = {};
    for (const problema of datos.error.issues) {
      const campo = problema.path[0];
      if (
        campo === "nombre_autor" ||
        campo === "calificacion" ||
        campo === "comentario"
      ) {
        errores[campo] ??= problema.message;
      }
    }
    return {
      ok: false,
      mensaje: "Revisa los campos marcados e inténtalo de nuevo.",
      errores,
    };
  }

  const supabase = clienteServicio();
  if (!supabase) {
    return {
      ok: false,
      mensaje:
        "Las reseñas no están disponibles en este momento. Inténtalo más tarde.",
      errores: {},
    };
  }

  const { data: negocio, error: errorNegocio } = await supabase
    .from("negocios")
    .select("id")
    .eq("slug", datos.data.slug)
    .eq("activo", true)
    .maybeSingle();

  if (errorNegocio || !negocio) {
    return {
      ok: false,
      mensaje: "No encontramos este negocio. Recarga la página.",
      errores: {},
    };
  }

  const { error } = await supabase.from("resenas").insert({
    negocio_id: negocio.id,
    nombre_autor: datos.data.nombre_autor,
    calificacion: datos.data.calificacion,
    comentario: datos.data.comentario ? datos.data.comentario : null,
    aprobada: false, // Siempre pendiente: la publica el admin.
  });

  if (error) {
    console.error("[resenas] crearResena:", error.message);
    return {
      ok: false,
      mensaje: "No pudimos guardar tu reseña. Inténtalo de nuevo.",
      errores: {},
    };
  }

  return {
    ok: true,
    mensaje:
      "¡Gracias! Tu reseña quedó pendiente de revisión y se publicará pronto.",
    errores: {},
  };
}
