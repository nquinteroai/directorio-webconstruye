"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DIAS_SEMANA,
  NOMBRES_DIAS,
  formatearHora12,
  momentoEnBogota,
  normalizarHorarios,
} from "@/lib/utils/horarios";
import type { DiaSemana, Json } from "@/types/database";

/**
 * Tabla de horarios de la semana. El día de HOY (hora de Bogotá) se resalta
 * tras el montaje en el cliente, para no romper la hidratación de la página
 * estática.
 */
export function HorariosTabla({ horarios }: { horarios: Json }) {
  const [hoy, setHoy] = useState<DiaSemana | null>(null);
  const normalizados = normalizarHorarios(horarios);

  useEffect(() => {
    setHoy(momentoEnBogota().dia);
  }, []);

  return (
    <dl className="divide-y rounded-xl border bg-card">
      {DIAS_SEMANA.map((dia) => {
        const franja = normalizados[dia];
        const esHoy = hoy === dia;
        return (
          <div
            key={dia}
            className={cn(
              "flex items-center justify-between gap-4 px-4 py-2.5 text-sm",
              esHoy && "bg-accent/60",
            )}
          >
            <dt className={cn("text-muted-foreground", esHoy && "font-semibold text-foreground")}>
              {NOMBRES_DIAS[dia]}
              {esHoy ? (
                <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Hoy
                </span>
              ) : null}
            </dt>
            <dd className={cn("tabular-nums", esHoy && "font-semibold")}>
              {franja
                ? `${formatearHora12(franja.abre)} – ${formatearHora12(franja.cierra)}`
                : "Cerrado"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
