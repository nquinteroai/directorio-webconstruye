"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let instancia: SupabaseClient<Database> | null = null;

/**
 * Cliente de Supabase para componentes de cliente del panel /admin
 * (login y subida de imágenes a Storage con la sesión del admin).
 */
export function clienteNavegador(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  instancia ??= createBrowserClient<Database>(url, anonKey);
  return instancia;
}
