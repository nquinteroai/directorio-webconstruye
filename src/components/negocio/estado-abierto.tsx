"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  estadoApertura,
  normalizarHorarios,
  type EstadoApertura,
} from "@/lib/utils/horarios";
import type { Json } from "@/types/database";

/**
 * Píldora "Abierto ahora / Cierra pronto / Cerrado".
 *
 * Se calcula EN EL CLIENTE con la hora de Bogotá: las páginas públicas son
 * estáticas (ISR) y el servidor no puede saber la hora del visitante. En el
 * primer render (SSR) no muestra nada para evitar diferencias de hidratación;
 * reserva su alto para no mover el contenido.
 */
export function EstadoAbierto({
  horarios,
  conDetalle = false,
  className,
}: {
  horarios: Json;
  conDetalle?: boolean;
  className?: string;
}) {
  const [estado, setEstado] = useState<EstadoApertura | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const calcular = () =>
      setEstado(estadoApertura(normalizarHorarios(horarios)));
    calcular();
    const intervalo = setInterval(calcular, 60_000);
    return () => clearInterval(intervalo);
  }, [horarios]);

  // Sin montar aún (SSR/hidratación) o negocio sin horarios: hueco estable.
  if (estado === undefined) {
    return <span aria-hidden className={cn("block h-5", className)} />;
  }
  if (estado === null) return null;

  return (
    <span className={cn("flex min-h-5 flex-wrap items-center gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
          estado.tipo === "abierto" && "bg-abierto-suave text-abierto",
          estado.tipo === "cierra_pronto" && "bg-accent text-accent-foreground",
          estado.tipo === "cerrado" && "bg-muted text-muted-foreground",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            estado.tipo === "abierto" && "bg-abierto",
            estado.tipo === "cierra_pronto" && "bg-primary",
            estado.tipo === "cerrado" && "bg-muted-foreground/60",
          )}
        />
        {estado.etiqueta}
      </span>
      {conDetalle && estado.detalle ? (
        <span className="text-xs text-muted-foreground">{estado.detalle}</span>
      ) : null}
    </span>
  );
}
