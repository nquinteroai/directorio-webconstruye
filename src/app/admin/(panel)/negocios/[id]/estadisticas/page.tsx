import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotonCopiarReporte } from "@/components/admin/boton-copiar-reporte";
import { GraficaClicks } from "@/components/admin/grafica-clicks";
import { estadisticasNegocio } from "@/lib/queries/estadisticas";
import { clienteServidor } from "@/lib/supabase/servidor";
import { generarTextoReporte } from "@/lib/utils/reporte";

export const dynamic = "force-dynamic";

const TIPOS: { clave: keyof import("@/lib/queries/estadisticas").ConteosPorTipo; etiqueta: string; color: string }[] = [
  { clave: "vista_ficha", etiqueta: "Vistas", color: "var(--chart-1)" },
  { clave: "whatsapp", etiqueta: "WhatsApp", color: "var(--chart-2)" },
  { clave: "llamada", etiqueta: "Llamadas", color: "var(--chart-3)" },
  { clave: "sitio_web", etiqueta: "Sitio web", color: "var(--chart-4)" },
  { clave: "como_llegar", etiqueta: "Cómo llegar", color: "var(--chart-5)" },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PaginaEstadisticasNegocio({ params }: Props) {
  const { id } = await params;
  const supabase = await clienteServidor();
  if (!supabase) notFound();

  const { data: negocio } = await supabase
    .from("negocios")
    .select("id, nombre, slug, activo")
    .eq("id", id)
    .maybeSingle();
  if (!negocio) notFound();

  const estadisticas = await estadisticasNegocio(negocio.id);
  if (!estadisticas) notFound();

  const textoReporte = generarTextoReporte({
    nombreNegocio: negocio.nombre,
    etiquetaMes: estadisticas.etiquetaMes,
    vistas: estadisticas.delMes.vista_ficha,
    whatsapp: estadisticas.delMes.whatsapp,
    llamadas: estadisticas.delMes.llamada,
    sitioWeb: estadisticas.delMes.sitio_web,
    comoLlegar: estadisticas.delMes.como_llegar,
  });

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/admin/negocios"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Negocios
          </Link>
          <h1 className="truncate font-heading text-2xl font-semibold">
            {negocio.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">
            Estadísticas · {estadisticas.etiquetaMes}
          </p>
        </div>
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

      <section
        aria-label="Totales del mes"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {TIPOS.map((tipo) => (
          <Card key={tipo.clave} className="gap-1 py-4">
            <CardContent className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: tipo.color }}
                />
                {tipo.etiqueta}
              </p>
              <p className="font-heading text-2xl font-semibold tabular-nums">
                {estadisticas.delMes[tipo.clave].toLocaleString("es-CO")}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Últimas 12 semanas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GraficaClicks datos={estadisticas.porSemana} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Reporte para el cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="whitespace-pre-wrap rounded-xl border bg-secondary/50 p-4 font-sans text-sm leading-6">
            {textoReporte}
          </pre>
          <BotonCopiarReporte texto={textoReporte} />
        </CardContent>
      </Card>
    </main>
  );
}
