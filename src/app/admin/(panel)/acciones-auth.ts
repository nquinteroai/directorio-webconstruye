"use server";

import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/servidor";

export async function cerrarSesion(): Promise<void> {
  const supabase = await clienteServidor();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
