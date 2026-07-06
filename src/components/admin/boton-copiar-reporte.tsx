"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copia el reporte mensual (texto listo para pegar en WhatsApp). */
export function BotonCopiarReporte({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copia el reporte:", texto);
    }
  }

  return (
    <Button type="button" onClick={copiar} className="h-10 rounded-full">
      {copiado ? (
        <>
          <Check aria-hidden className="size-4" />
          ¡Copiado! Pégalo en WhatsApp
        </>
      ) : (
        <>
          <Copy aria-hidden className="size-4" />
          Copiar reporte para WhatsApp
        </>
      )}
    </Button>
  );
}
