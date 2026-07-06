"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DIAS_SEMANA,
  NOMBRES_DIAS,
} from "@/lib/utils/horarios";
import type { DiaSemana, FranjaHoraria, Horarios } from "@/types/database";

const FRANJA_POR_DEFECTO: FranjaHoraria = { abre: "08:00", cierra: "18:00" };

/** Editor amigable de horarios: switch por día + horas + "copiar a todos". */
export function EditorHorarios({
  valor,
  onCambio,
}: {
  valor: Horarios;
  onCambio: (horarios: Horarios) => void;
}) {
  function fijarDia(dia: DiaSemana, franja: FranjaHoraria | null) {
    onCambio({ ...valor, [dia]: franja });
  }

  function copiarATodos(franja: FranjaHoraria) {
    const nuevo: Horarios = {};
    for (const dia of DIAS_SEMANA) {
      // Copia el horario solo a los días que ya están marcados como abiertos.
      nuevo[dia] = valor[dia] ? { ...franja } : valor[dia] ?? null;
    }
    onCambio(nuevo);
  }

  return (
    <div className="divide-y rounded-xl border bg-card">
      {DIAS_SEMANA.map((dia, indice) => {
        const franja = valor[dia] ?? null;
        const abierto = franja !== null;
        return (
          <div
            key={dia}
            className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5"
          >
            <label className="flex w-32 items-center gap-2.5 text-sm font-medium">
              <Switch
                checked={abierto}
                aria-label={`${NOMBRES_DIAS[dia]}: ${abierto ? "abierto" : "cerrado"}`}
                onCheckedChange={(marcado) =>
                  fijarDia(dia, marcado ? { ...FRANJA_POR_DEFECTO } : null)
                }
              />
              {NOMBRES_DIAS[dia]}
            </label>

            {abierto && franja ? (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={franja.abre}
                  aria-label={`Hora de apertura del ${NOMBRES_DIAS[dia]}`}
                  onChange={(e) => fijarDia(dia, { ...franja, abre: e.target.value })}
                  className="h-8 rounded-md border bg-background px-2 tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                <span className="text-muted-foreground">a</span>
                <input
                  type="time"
                  value={franja.cierra}
                  aria-label={`Hora de cierre del ${NOMBRES_DIAS[dia]}`}
                  onChange={(e) => fijarDia(dia, { ...franja, cierra: e.target.value })}
                  className="h-8 rounded-md border bg-background px-2 tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                {indice === 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => copiarATodos(franja)}
                  >
                    <Copy aria-hidden className="size-3.5" />
                    Copiar a los demás
                  </Button>
                ) : null}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Cerrado</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
