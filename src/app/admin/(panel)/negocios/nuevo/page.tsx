import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NegocioForm } from "@/components/admin/negocio-form";
import { clienteServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

export default async function PaginaNuevoNegocio() {
  const supabase = await clienteServidor();
  if (!supabase) return null;

  const [{ data: zonas }, { data: categorias }] = await Promise.all([
    supabase.from("zonas").select("*").order("nombre"),
    supabase.from("categorias").select("*").order("orden"),
  ]);

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href="/admin/negocios"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Negocios
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Nuevo negocio</h1>
      </div>
      <NegocioForm
        negocio={null}
        zonas={zonas ?? []}
        categorias={categorias ?? []}
      />
    </main>
  );
}
