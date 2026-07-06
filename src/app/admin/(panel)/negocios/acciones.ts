"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clienteServidor } from "@/lib/supabase/servidor";
import { normalizarHorarios } from "@/lib/utils/horarios";
import { esSlugValido } from "@/lib/utils/slug";
import type { Json, NegocioInsert } from "@/types/database";

export interface EstadoNegocio {
  ok: boolean;
  mensaje: string | null;
  errores: Record<string, string>;
}

const RE_TELEFONO = /^[0-9]{7,12}$/;
const RE_WHATSAPP = /^57[0-9]{10}$/;

const esquemaNegocio = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre del negocio.").max(120),
  slug: z
    .string()
    .trim()
    .refine(esSlugValido, "Solo minúsculas, números y guiones (ej. mi-negocio)."),
  zona_id: z.string().uuid("Elige la zona."),
  categoria_id: z.string().uuid("Elige la categoría."),
  descripcion_corta: z
    .string()
    .trim()
    .min(30, "Mínimo 30 caracteres: es la descripción que sale en Google.")
    .max(160, "Máximo 160 caracteres (meta description)."),
  descripcion_larga: z
    .string()
    .trim()
    .min(
      300,
      "Mínimo 300 caracteres. Un texto único y completo posiciona mejor en Google.",
    )
    .max(5000, "Máximo 5.000 caracteres."),
  direccion: z.string().trim().min(5, "Escribe la dirección completa."),
  barrio: z.string().trim().max(80).optional(),
  lat: z.coerce
    .number()
    .min(-4.5, "Latitud fuera de Colombia.")
    .max(13.5, "Latitud fuera de Colombia."),
  lng: z.coerce
    .number()
    .min(-82, "Longitud fuera de Colombia.")
    .max(-66, "Longitud fuera de Colombia."),
  telefono: z
    .string()
    .trim()
    .regex(RE_TELEFONO, "Solo dígitos (7 a 12). Ej: 6017451233 o 3201234567.")
    .or(z.literal(""))
    .optional(),
  whatsapp: z
    .string()
    .trim()
    .regex(RE_WHATSAPP, "Formato internacional: 57 + 10 dígitos (573001234567).")
    .or(z.literal(""))
    .optional(),
  sitio_web: z
    .string()
    .trim()
    .url("Debe empezar por https:// (la página que le construyó la agencia).")
    .or(z.literal(""))
    .optional(),
  email: z.string().trim().email("Correo no válido.").or(z.literal("")).optional(),
  instagram: z.string().trim().max(60).optional(),
  facebook: z.string().trim().max(80).optional(),
  plan: z.enum(["web", "mantenimiento", "premium"]),
  fecha_ingreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida."),
  logo_url: z.string().url().or(z.literal("")).optional(),
  foto_portada_url: z.string().url().or(z.literal("")).optional(),
});

function parsearListaJson(valor: unknown, maxItems: number, maxLargo: number): string[] {
  if (typeof valor !== "string" || valor === "") return [];
  try {
    const lista = JSON.parse(valor) as unknown;
    if (!Array.isArray(lista)) return [];
    return lista
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length <= maxLargo)
      .slice(0, maxItems);
  } catch {
    return [];
  }
}

/**
 * Crea o actualiza un negocio. Corre con la SESIÓN del admin (RLS es_admin):
 * si alguien sin permisos llega aquí, la base de datos rechaza la escritura.
 */
export async function guardarNegocio(
  _estado: EstadoNegocio,
  formData: FormData,
): Promise<EstadoNegocio> {
  const supabase = await clienteServidor();
  if (!supabase) {
    return { ok: false, mensaje: "Supabase no está configurado.", errores: {} };
  }

  const crudo = Object.fromEntries(formData.entries());
  const datos = esquemaNegocio.safeParse(crudo);

  if (!datos.success) {
    const errores: Record<string, string> = {};
    for (const problema of datos.error.issues) {
      const campo = String(problema.path[0] ?? "");
      if (campo && !errores[campo]) errores[campo] = problema.message;
    }
    return {
      ok: false,
      mensaje: "Revisa los campos marcados en rojo.",
      errores,
    };
  }

  const id = typeof crudo.id === "string" && crudo.id !== "" ? crudo.id : null;
  const horarios = normalizarHorarios(
    (() => {
      try {
        return JSON.parse(String(crudo.horarios ?? "{}")) as Json;
      } catch {
        return {};
      }
    })(),
  );

  const registro: NegocioInsert = {
    nombre: datos.data.nombre,
    slug: datos.data.slug,
    zona_id: datos.data.zona_id,
    categoria_id: datos.data.categoria_id,
    descripcion_corta: datos.data.descripcion_corta,
    descripcion_larga: datos.data.descripcion_larga,
    direccion: datos.data.direccion,
    barrio: datos.data.barrio || null,
    lat: datos.data.lat,
    lng: datos.data.lng,
    telefono: datos.data.telefono || null,
    whatsapp: datos.data.whatsapp || null,
    sitio_web: datos.data.sitio_web || null,
    email: datos.data.email || null,
    instagram: datos.data.instagram?.replace(/^@/, "") || null,
    facebook: datos.data.facebook || null,
    plan: datos.data.plan,
    fecha_ingreso: datos.data.fecha_ingreso,
    horarios: horarios as Json,
    servicios: parsearListaJson(crudo.servicios, 20, 60),
    palabras_clave: parsearListaJson(crudo.palabras_clave, 20, 60),
    galeria: parsearListaJson(crudo.galeria, 10, 500),
    logo_url: datos.data.logo_url || null,
    foto_portada_url: datos.data.foto_portada_url || null,
    destacado: formData.get("destacado") === "on",
    verificado: formData.get("verificado") === "on",
    activo: formData.get("activo") === "on",
  };

  const { error } = id
    ? await supabase.from("negocios").update(registro).eq("id", id)
    : await supabase.from("negocios").insert(registro);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        mensaje: "Ese slug ya existe: cambia la URL del negocio.",
        errores: { slug: "Ya hay un negocio con esta URL." },
      };
    }
    console.error("[admin] guardarNegocio:", error.message);
    return {
      ok: false,
      mensaje: `No se pudo guardar: ${error.message}`,
      errores: {},
    };
  }

  // Revalidación on-demand de TODO el sitio público: la ficha, los listados,
  // la home, el footer y el sitemap dependen de estos datos.
  revalidatePath("/", "layout");
  redirect(`/admin/negocios?guardado=${encodeURIComponent(datos.data.nombre)}`);
}

const CAMPOS_ALTERNABLES = ["destacado", "verificado", "activo"] as const;
type CampoAlternable = (typeof CAMPOS_ALTERNABLES)[number];

/** Prende/apaga destacado, verificado o activo desde la tabla. */
export async function alternarNegocio(
  id: string,
  campo: CampoAlternable,
  valor: boolean,
): Promise<{ ok: boolean; mensaje?: string }> {
  if (!CAMPOS_ALTERNABLES.includes(campo)) {
    return { ok: false, mensaje: "Campo no permitido." };
  }
  const supabase = await clienteServidor();
  if (!supabase) return { ok: false, mensaje: "Supabase no configurado." };

  const cambio: Partial<Pick<NegocioInsert, "destacado" | "verificado" | "activo">> =
    campo === "destacado"
      ? { destacado: valor }
      : campo === "verificado"
        ? { verificado: valor }
        : { activo: valor };

  const { error } = await supabase
    .from("negocios")
    .update(cambio)
    .eq("id", id);
  if (error) {
    console.error("[admin] alternarNegocio:", error.message);
    return { ok: false, mensaje: error.message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
