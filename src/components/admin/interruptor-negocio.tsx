"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { alternarNegocio } from "@/app/admin/(panel)/negocios/acciones";

/** Switch optimista para destacado / verificado / activo en la tabla. */
export function InterruptorNegocio({
  id,
  campo,
  valor,
  etiqueta,
}: {
  id: string;
  campo: "destacado" | "verificado" | "activo";
  valor: boolean;
  etiqueta: string;
}) {
  const [pendiente, iniciarTransicion] = useTransition();
  const [optimista, setOptimista] = useOptimistic(valor);

  return (
    <Switch
      checked={optimista}
      disabled={pendiente}
      aria-label={etiqueta}
      onCheckedChange={(nuevo) => {
        iniciarTransicion(async () => {
          setOptimista(nuevo);
          await alternarNegocio(id, campo, nuevo);
        });
      }}
    />
  );
}
