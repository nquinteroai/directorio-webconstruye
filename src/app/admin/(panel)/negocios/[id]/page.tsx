import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChartNoAxesColumn, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NegocioForm } from "@/components/admin/negocio-form";
import { clienteServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaginaEditarNegocio({ params }: Props) {
  const { id } = await params;
  const supabase = await clienteServidor();
  if (!supabase) return null;

  const [{ data: negocio }, { data: zonas }, { data: categorias }] =
    await Promise.all([
      supabase.from("negocios").select("*").eq("id", id).maybeSingle(),
      supabase.from("zonas").select("*").order("nombre"),
      supabase.from("categorias").select("*").order("orden"),
    ]);
  if (!negocio) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/admin/negocios"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Negocios
          </Link>
          <h1 className="font-heading text-2xl font-semibold">
            Editar: {negocio.nombre}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/admin/negocios/${negocio.id}/estadisticas`} />}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <ChartNoAxesColumn aria-hidden className="size-4" />
            Estadísticas
          </Button>
          <Button
            render={<Link href={`/negocio/${negocio.slug}`} target="_blank" />}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <ExternalLink aria-hidden className="size-4" />
            Ver ficha
          </Button>
        </div>
      </div>
      <NegocioForm
        negocio={negocio}
        zonas={zonas ?? []}
        categorias={categorias ?? []}
      />
    </main>
  );
}
