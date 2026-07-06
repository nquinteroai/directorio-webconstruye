import { Badge } from "@/components/ui/badge";
import { ZonaForm } from "@/components/admin/zona-form";
import { clienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaginaZonasAdmin() {
  const supabase = await clienteServidor();
  if (!supabase) return null;

  const [{ data: zonas }, { data: conteos }] = await Promise.all([
    supabase.from("zonas").select("*").order("nombre"),
    supabase.from("negocios").select("zona_id"),
  ]);

  const totalPorZona = new Map<string, number>();
  for (const fila of conteos ?? []) {
    totalPorZona.set(fila.zona_id, (totalPorZona.get(fila.zona_id) ?? 0) + 1);
  }

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Zonas</h1>
          <p className="text-sm text-muted-foreground">
            Agrega una zona nueva y el directorio se expande sin tocar código.
          </p>
        </div>
        <ZonaForm zona={null} />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {(zonas ?? []).map((zona) => (
          <li
            key={zona.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-xl border bg-card p-4",
              !zona.activa && "opacity-55",
            )}
          >
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-2 font-medium">
                {zona.nombre}
                {!zona.activa ? <Badge variant="secondary">Inactiva</Badge> : null}
              </p>
              <p className="text-xs text-muted-foreground">
                /{zona.slug} · {zona.ciudad}, {zona.departamento}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {totalPorZona.get(zona.id) ?? 0} negocios · centro{" "}
                {zona.lat.toFixed(4)}, {zona.lng.toFixed(4)} · zoom {zona.zoom}
              </p>
            </div>
            <ZonaForm zona={zona} />
          </li>
        ))}
      </ul>

      {(zonas ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No hay zonas. Crea la primera o carga el seed.
        </p>
      ) : null}
    </main>
  );
}
