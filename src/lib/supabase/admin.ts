import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let instancia: SupabaseClient<Database> | null = null;

/**
 * Cliente de SERVICIO (service_role) — SOLO servidor, importa "server-only".
 *
 * Omite RLS. Se usa únicamente para: registrar clicks/vistas y crear reseñas
 * pendientes de moderación (siempre con `aprobada: false` forzado en código),
 * y para las estadísticas del panel admin.
 *
 * Devuelve `null` si falta SUPABASE_SERVICE_ROLE_KEY.
 */
export function clienteServicio(): SupabaseClient<Database> | null {
  if (!url || !serviceRoleKey) return null;
  instancia ??= createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return instancia;
}
