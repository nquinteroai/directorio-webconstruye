import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente de Supabase CON SESIÓN (cookies) para el panel /admin.
 * Corre bajo RLS: las escrituras pasan por las políticas es_admin().
 * Devuelve `null` si el proyecto aún no está conectado.
 */
export async function clienteServidor(): Promise<SupabaseClient<Database> | null> {
  if (!url || !anonKey) return null;
  const almacenCookies = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return almacenCookies.getAll();
      },
      setAll(cookiesAEstablecer) {
        try {
          cookiesAEstablecer.forEach(({ name, value, options }) =>
            almacenCookies.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component (no puede escribir cookies):
          // el middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}
