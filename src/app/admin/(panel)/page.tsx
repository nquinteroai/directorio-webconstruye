import Link from "next/link";
import {
  ArrowRight,
  Eye,
  MessageCircle,
  MessagesSquare,
  Plus,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Estrellas } from "@/components/negocio/estrellas";
import { resumenDashboard, etiquetaMesBogota } from "@/lib/queries/estadisticas";

export const dynamic = "force-dynamic";

function Tarjeta({
  titulo,
  valor,
  icono: Icono,
  detalle,
  href,
}: {
  titulo: string;
  valor: number;
  icono: React.ComponentType<{ className?: string }>;
  detalle?: string;
  href?: string;
}) {
  const contenido = (
    <Card className="h-full gap-2 transition-colors hover:border-primary/40">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titulo}
        </CardTitle>
        <Icono aria-hidden className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-semibold tabular-nums">
          {valor.toLocaleString("es-CO")}
        </p>
        {detalle ? (
          <p className="mt-1 text-xs text-muted-foreground">{detalle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{contenido}</Link> : contenido;
}

export default async function PaginaDashboard() {
  const resumen = await resumenDashboard();

  if (!resumen) {
    return (
      <main className="rounded-2xl border border-dashed bg-card p-10 text-center">
        <p className="font-heading text-lg font-semibold">
          Conecta Supabase para ver el dashboard
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Completa <code className="font-mono">.env.local</code> siguiendo{" "}
          <code className="font-mono">supabase/README.md</code> y reinicia el
          servidor.
        </p>
      </main>
    );
  }

  const contactos =
    resumen.clicksDelMes.whatsapp +
    resumen.clicksDelMes.llamada +
    resumen.clicksDelMes.sitio_web +
    resumen.clicksDelMes.como_llegar;

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Actividad de {etiquetaMesBogota()}
          </p>
        </div>
        <Button render={<Link href="/admin/negocios/nuevo" />} className="rounded-full">
          <Plus aria-hidden className="size-4" />
          Nuevo negocio
        </Button>
      </div>

      <section
        aria-label="Resumen del mes"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Tarjeta
          titulo="Negocios activos"
          valor={resumen.negociosActivos}
          icono={Store}
          detalle={`${resumen.negociosTotales} en total`}
          href="/admin/negocios"
        />
        <Tarjeta
          titulo="Vistas de fichas"
          valor={resumen.clicksDelMes.vista_ficha}
          icono={Eye}
          detalle="este mes"
        />
        <Tarjeta
          titulo="Contactos generados"
          valor={contactos}
          icono={MessageCircle}
          detalle={`${resumen.clicksDelMes.whatsapp} WhatsApp · ${resumen.clicksDelMes.llamada} llamadas`}
        />
        <Tarjeta
          titulo="Reseñas por moderar"
          valor={resumen.totalPendientes}
          icono={MessagesSquare}
          href="/admin/resenas"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="titulo-mas-vistos">
          <Card className="gap-3">
            <CardHeader className="pb-0">
              <CardTitle id="titulo-mas-vistos" className="font-heading text-lg">
                Los más vistos del mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumen.masVistos.length > 0 ? (
                <ol className="divide-y">
                  {resumen.masVistos.map((negocio, i) => (
                    <li
                      key={negocio.negocio_id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-primary tabular-nums">
                          {i + 1}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {negocio.nombre}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {negocio.vistas} vistas
                        </span>
                        <Link
                          href={`/admin/negocios/${negocio.negocio_id}/estadisticas`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Estadísticas
                        </Link>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  Aún no hay vistas registradas este mes.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="titulo-pendientes">
          <Card className="gap-3">
            <CardHeader className="flex-row items-center justify-between pb-0">
              <CardTitle id="titulo-pendientes" className="font-heading text-lg">
                Reseñas pendientes
              </CardTitle>
              {resumen.totalPendientes > 0 ? (
                <Link
                  href="/admin/resenas"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Moderar todas
                  <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              ) : null}
            </CardHeader>
            <CardContent>
              {resumen.resenasPendientes.length > 0 ? (
                <ul className="divide-y">
                  {resumen.resenasPendientes.map((resena) => (
                    <li key={resena.id} className="space-y-1 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {resena.nombre_autor}{" "}
                          <span className="text-muted-foreground">
                            → {resena.negocio_nombre}
                          </span>
                        </p>
                        <Estrellas
                          promedio={resena.calificacion}
                          tamano="size-3"
                        />
                      </div>
                      {resena.comentario ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {resena.comentario}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  No hay reseñas esperando moderación. ✨
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
