import { Estrellas } from "@/components/negocio/estrellas";
import type { Resena } from "@/types/database";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

export function ResenasLista({ resenas }: { resenas: Resena[] }) {
  if (resenas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-secondary/40 p-5 text-sm text-muted-foreground">
        Este negocio aún no tiene reseñas publicadas. ¡Sé la primera persona en
        contar tu experiencia!
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {resenas.map((resena) => (
        <li key={resena.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{resena.nombre_autor}</p>
            <Estrellas promedio={resena.calificacion} tamano="size-3.5" />
          </div>
          {resena.comentario ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {resena.comentario}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground/80">
            {formatearFecha(resena.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
