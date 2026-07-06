"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Compartir la ficha: Web Share API en móvil, copiar enlace como respaldo. */
export function BotonCompartir({
  titulo,
  url,
}: {
  titulo: string;
  url: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // El usuario canceló el diálogo: no hacer nada.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles no disponible: como último recurso, abrir prompt nativo.
      window.prompt("Copia el enlace:", url);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={compartir}
      className="rounded-full"
    >
      {copiado ? (
        <>
          <Check aria-hidden className="size-4 text-abierto" />
          Enlace copiado
        </>
      ) : (
        <>
          <Share2 aria-hidden className="size-4" />
          Compartir
        </>
      )}
    </Button>
  );
}
