import Link from "next/link";
import { ChartNoAxesColumn, ExternalLink, Pencil, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InterruptorNegocio } from "@/components/admin/interruptor-negocio";
import { clienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ETIQUETA_PLAN: Record<string, string> = {
  web: "Web",
  mantenimiento: "Mantenimiento",
  premium: "Premium",
};

interface Props {
  searchParams: Promise<{ q?: string; guardado?: string }>;
}

export default async function PaginaNegociosAdmin({ searchParams }: Props) {
  const { q, guardado } = await searchParams;
  const consulta = (q ?? "").trim();

  const supabase = await clienteServidor();
  if (!supabase) return null;

  let query = supabase
    .from("negocios")
    .select("id, slug, nombre, barrio, plan, destacado, verificado, activo, zona:zonas(nombre), categoria:categorias(nombre)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (consulta) {
    query = query.or(`nombre.ilike.%${consulta}%,slug.ilike.%${consulta}%,barrio.ilike.%${consulta}%`);
  }
  const { data } = await query;
  const negocios = (data ?? []) as unknown as {
    id: string;
    slug: string;
    nombre: string;
    barrio: string | null;
    plan: string;
    destacado: boolean;
    verificado: boolean;
    activo: boolean;
    zona: { nombre: string } | null;
    categoria: { nombre: string } | null;
  }[];

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Negocios</h1>
        <Button render={<Link href="/admin/negocios/nuevo" />} className="rounded-full">
          <Plus aria-hidden className="size-4" />
          Nuevo negocio
        </Button>
      </div>

      {guardado ? (
        <p
          role="status"
          className="rounded-xl border border-abierto/30 bg-abierto-suave px-4 py-3 text-sm font-medium text-abierto"
        >
          “{guardado}” se guardó y el sitio público ya está actualizado.
        </p>
      ) : null}

      <form method="get" className="relative max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          name="q"
          defaultValue={consulta}
          placeholder="Buscar por nombre, slug o barrio…"
          className="h-10 rounded-full pl-9"
        />
      </form>

      {/* Tabla en escritorio */}
      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Negocio</TableHead>
              <TableHead>Zona / Categoría</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-center">Activo</TableHead>
              <TableHead className="text-center">Destacado</TableHead>
              <TableHead className="text-center">Verificado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {negocios.map((negocio) => (
              <TableRow key={negocio.id} className={cn(!negocio.activo && "opacity-55")}>
                <TableCell>
                  <p className="font-medium">{negocio.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    /negocio/{negocio.slug}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {negocio.zona?.nombre} · {negocio.categoria?.nombre}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={negocio.plan === "premium" ? "default" : "secondary"}
                    className={cn(negocio.plan === "premium" && "bg-primary")}
                  >
                    {ETIQUETA_PLAN[negocio.plan] ?? negocio.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <InterruptorNegocio
                    id={negocio.id}
                    campo="activo"
                    valor={negocio.activo}
                    etiqueta={`Activo: ${negocio.nombre}`}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <InterruptorNegocio
                    id={negocio.id}
                    campo="destacado"
                    valor={negocio.destacado}
                    etiqueta={`Destacado: ${negocio.nombre}`}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <InterruptorNegocio
                    id={negocio.id}
                    campo="verificado"
                    valor={negocio.verificado}
                    etiqueta={`Verificado: ${negocio.nombre}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      render={<Link href={`/admin/negocios/${negocio.id}`} />}
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${negocio.nombre}`}
                    >
                      <Pencil aria-hidden className="size-4" />
                    </Button>
                    <Button
                      render={
                        <Link href={`/admin/negocios/${negocio.id}/estadisticas`} />
                      }
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Estadísticas de ${negocio.nombre}`}
                    >
                      <ChartNoAxesColumn aria-hidden className="size-4" />
                    </Button>
                    <Button
                      render={
                        <Link href={`/negocio/${negocio.slug}`} target="_blank" />
                      }
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Ver ficha de ${negocio.nombre}`}
                    >
                      <ExternalLink aria-hidden className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tarjetas en móvil */}
      <ul className="space-y-3 md:hidden">
        {negocios.map((negocio) => (
          <li
            key={negocio.id}
            className={cn(
              "space-y-3 rounded-xl border bg-card p-4",
              !negocio.activo && "opacity-55",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{negocio.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {negocio.zona?.nombre} · {negocio.categoria?.nombre}
                </p>
              </div>
              <Badge
                variant={negocio.plan === "premium" ? "default" : "secondary"}
                className={cn("shrink-0", negocio.plan === "premium" && "bg-primary")}
              >
                {ETIQUETA_PLAN[negocio.plan] ?? negocio.plan}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-1.5">
                <InterruptorNegocio
                  id={negocio.id}
                  campo="activo"
                  valor={negocio.activo}
                  etiqueta={`Activo: ${negocio.nombre}`}
                />
                Activo
              </label>
              <label className="flex items-center gap-1.5">
                <InterruptorNegocio
                  id={negocio.id}
                  campo="destacado"
                  valor={negocio.destacado}
                  etiqueta={`Destacado: ${negocio.nombre}`}
                />
                Destacado
              </label>
              <label className="flex items-center gap-1.5">
                <InterruptorNegocio
                  id={negocio.id}
                  campo="verificado"
                  valor={negocio.verificado}
                  etiqueta={`Verificado: ${negocio.nombre}`}
                />
                Verificado
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                render={<Link href={`/admin/negocios/${negocio.id}`} />}
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
              >
                <Pencil aria-hidden className="size-3.5" />
                Editar
              </Button>
              <Button
                render={<Link href={`/admin/negocios/${negocio.id}/estadisticas`} />}
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
              >
                <ChartNoAxesColumn aria-hidden className="size-3.5" />
                Estadísticas
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {negocios.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
          <p className="font-heading text-lg font-semibold">
            {consulta
              ? `Sin resultados para “${consulta}”`
              : "Aún no hay negocios"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {consulta
              ? "Prueba con otro nombre o revisa la ortografía."
              : "Crea el primer negocio del directorio o carga el seed de ejemplo."}
          </p>
        </div>
      ) : null}
    </main>
  );
}
