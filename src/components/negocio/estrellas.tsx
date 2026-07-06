import { Star } from "lucide-react";
import { formatearCalificacion } from "@/lib/utils/formato";
import { cn } from "@/lib/utils";

/**
 * Calificación con estrellas (soporta fracciones vía capa recortada).
 * Componente de servidor: no necesita JavaScript en el cliente.
 */
export function Estrellas({
  promedio,
  className,
  tamano = "size-4",
}: {
  promedio: number;
  className?: string;
  tamano?: string;
}) {
  const porcentaje = Math.max(0, Math.min(100, (promedio / 5) * 100));

  return (
    <span
      role="img"
      aria-label={`Calificación: ${formatearCalificacion(promedio)} de 5`}
      className={cn("relative inline-flex", className)}
    >
      <span className="flex gap-0.5 text-border" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(tamano, "fill-current")} />
        ))}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-primary"
        style={{ width: `${porcentaje}%` }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(tamano, "shrink-0 fill-current")} />
        ))}
      </span>
    </span>
  );
}
