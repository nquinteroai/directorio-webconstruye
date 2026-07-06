import { iconoCategoria } from "@/lib/iconos";
import { cn } from "@/lib/utils";

/**
 * Portada de respaldo para negocios sin foto: gradiente cálido con el ícono
 * de la categoría como marca de agua. Mantiene la grilla viva y coherente.
 */
export function PortadaFallback({
  icono,
  className,
  tamanoIcono = "size-14",
}: {
  icono: string | null | undefined;
  className?: string;
  tamanoIcono?: string;
}) {
  const Icono = iconoCategoria(icono);
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-accent via-secondary to-background",
        className,
      )}
    >
      <Icono className={cn(tamanoIcono, "text-primary/30")} strokeWidth={1.5} />
    </div>
  );
}
