import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * ¿Hay credenciales de Supabase? Permite compilar y navegar el sitio sin
 * `.env.local` (las páginas muestran estados vacíos con instrucciones).
 */
export const supabaseConfigurado = Boolean(url && anonKey);

let instancia: SupabaseClient<Database> | null = null;

/**
 * Cliente PÚBLICO de Supabase (clave anon, sin cookies ni sesión).
 *
 * Es el que usan todas las páginas públicas: al no tocar cookies, las rutas
 * pueden prerenderizarse como estáticas (SSG/ISR). RLS garantiza que solo
 * expone registros activos/aprobados.
 *
 * Devuelve `null` si el proyecto aún no está conectado a Supabase.
 */
export function clientePublico(): SupabaseClient<Database> | null {
  if (!supabaseConfigurado) return null;
  instancia ??= createClient<Database>(url as string, anonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return instancia;
}
