import Link from "next/link";
import { Estrellas } from "@/components/negocio/estrellas";
import { BotonesModeracion } from "@/components/admin/moderar-resena";
import { clienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ ver?: string }>;
}

export default async function PaginaResenasAdmin({ searchParams }: Props) {
  const { ver } = await searchParams;
  const mostrarAprobadas = ver === "aprobadas";

  const supabase = await clienteServidor();
  if (!supabase) return null;

  const { data } = await supabase
    .from("resenas")
    .select("id, nombre_autor, calificacion, comentario, aprobada, created_at, negocio:negocios(nombre, slug)")
    .eq("aprobada", mostrarAprobadas)
    .order("created_at", { ascending: false })
    .limit(100);

  const resenas = (data ?? []) as unknown as {
    id: string;
    nombre_autor: string;
    calificacion: number;
    comentario: string | null;
    aprobada: boolean;
    created_at: string;
    negocio: { nombre: string; slug: string } | null;
  }[];

  return (
    <main className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold">Reseñas</h1>

      <nav aria-label="Filtro de reseñas" className="flex gap-1.5">
        {[
          { href: "/admin/resenas", etiqueta: "Pendientes", activa: !mostrarAprobadas },
          {
            href: "/admin/resenas?ver=aprobadas",
            etiqueta: "Aprobadas",
            activa: mostrarAprobadas,
          },
        ].map((pestana) => (
          <Link
            key={pestana.href}
            href={pestana.href}
            aria-current={pestana.activa ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              pestana.activa
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:border-primary/40 hover:text-primary",
            )}
          >
            {pestana.etiqueta}
          </Link>
        ))}
      </nav>

      {resenas.length > 0 ? (
        <ul className="space-y-3">
          {resenas.map((resena) => (
            <li
              key={resena.id}
              className="space-y-2.5 rounded-xl border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">
                    {resena.nombre_autor}{" "}
                    <span className="font-normal text-muted-foreground">
                      → {resena.negocio?.nombre ?? "(negocio eliminado)"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(resena.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "America/Bogota",
                    })}
                  </p>
                </div>
                <Estrellas promedio={resena.calificacion} />
              </div>
              {resena.comentario ? (
                <p className="text-sm leading-relaxed text-foreground/85">
                  {resena.comentario}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  (Sin comentario, solo calificación)
                </p>
              )}
              <BotonesModeracion id={resena.id} aprobada={resena.aprobada} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
          <p className="font-heading text-lg font-semibold">
            {mostrarAprobadas
              ? "Aún no hay reseñas aprobadas"
              : "No hay reseñas pendientes"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {mostrarAprobadas
              ? "Cuando apruebes reseñas pendientes, aparecerán aquí y en las fichas."
              : "Todo al día. Las nuevas reseñas de los visitantes llegarán a esta bandeja. ✨"}
          </p>
        </div>
      )}
    </main>
  );
}
