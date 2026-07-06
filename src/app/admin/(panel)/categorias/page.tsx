import { CategoriaForm } from "@/components/admin/categoria-form";
import { iconoCategoria } from "@/lib/iconos";
import { clienteServidor } from "@/lib/supabase/servidor";

export const dynamic = "force-dynamic";

export default async function PaginaCategoriasAdmin() {
  const supabase = await clienteServidor();
  if (!supabase) return null;

  const [{ data: categorias }, { data: conteos }] = await Promise.all([
    supabase.from("categorias").select("*").order("orden").order("nombre"),
    supabase.from("negocios").select("categoria_id"),
  ]);

  const totalPorCategoria = new Map<string, number>();
  for (const fila of conteos ?? []) {
    totalPorCategoria.set(
      fila.categoria_id,
      (totalPorCategoria.get(fila.categoria_id) ?? 0) + 1,
    );
  }

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            El orden define cómo aparecen en la home y los filtros.
          </p>
        </div>
        <CategoriaForm categoria={null} />
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(categorias ?? []).map((categoria) => {
          const Icono = iconoCategoria(categoria.icono);
          return (
            <li
              key={categoria.id}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                  <Icono aria-hidden className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{categoria.nombre}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    /{categoria.slug} · orden {categoria.orden} ·{" "}
                    {totalPorCategoria.get(categoria.id) ?? 0} negocios
                  </p>
                </div>
              </div>
              <CategoriaForm categoria={categoria} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
