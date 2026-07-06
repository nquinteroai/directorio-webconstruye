import "server-only";

import { clienteServicio } from "@/lib/supabase/admin";
import type { FuenteClick, TipoClick } from "@/types/database";

/** Segmento de URL (/ir/[tipo]/…) → valor de la columna `clicks.tipo`. */
export const SEGMENTO_A_TIPO: Record<string, TipoClick> = {
  whatsapp: "whatsapp",
  llamada: "llamada",
  "sitio-web": "sitio_web",
  "como-llegar": "como_llegar",
};

const FUENTES_VALIDAS: readonly FuenteClick[] = [
  "ficha",
  "listado",
  "busqueda",
  "home",
];

export function normalizarFuente(valor: string | null): FuenteClick {
  return FUENTES_VALIDAS.includes(valor as FuenteClick)
    ? (valor as FuenteClick)
    : "ficha";
}

/**
 * Registra un evento en `clicks` con la clave de servicio (no hay políticas
 * de escritura anónimas). Nunca lanza: el tracking jamás debe romper la
 * navegación del visitante.
 */
export async function registrarClick(
  negocioId: string,
  tipo: TipoClick,
  fuente: FuenteClick,
): Promise<void> {
  try {
    const supabase = clienteServicio();
    if (!supabase) return;
    const { error } = await supabase
      .from("clicks")
      .insert({ negocio_id: negocioId, tipo, fuente });
    if (error) console.error("[tracking] registrarClick:", error.message);
  } catch (error) {
    console.error("[tracking] registrarClick:", error);
  }
}
