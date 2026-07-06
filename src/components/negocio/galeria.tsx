"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Galería de fotos con visor ampliado (lightbox) y navegación por teclado. */
export function Galeria({
  imagenes,
  nombreNegocio,
}: {
  imagenes: string[];
  nombreNegocio: string;
}) {
  const [abierta, setAbierta] = useState(false);
  const [indice, setIndice] = useState(0);

  const anterior = useCallback(
    () => setIndice((i) => (i - 1 + imagenes.length) % imagenes.length),
    [imagenes.length],
  );
  const siguiente = useCallback(
    () => setIndice((i) => (i + 1) % imagenes.length),
    [imagenes.length],
  );

  if (imagenes.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {imagenes.map((url, i) => (
          <li key={url} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button
              type="button"
              onClick={() => {
                setIndice(i);
                setAbierta(true);
              }}
              className="group relative block aspect-square h-full w-full overflow-hidden rounded-lg border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`Ampliar foto ${i + 1} de ${nombreNegocio}`}
            >
              <Image
                src={url}
                alt={`Foto ${i + 1} de ${nombreNegocio}`}
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={abierta} onOpenChange={setAbierta}>
        <DialogContent
          className="max-w-3xl border-none bg-transparent p-0 shadow-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") anterior();
            if (e.key === "ArrowRight") siguiente();
          }}
        >
          <DialogTitle className="sr-only">
            Fotos de {nombreNegocio} ({indice + 1} de {imagenes.length})
          </DialogTitle>
          <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/90">
            <Image
              src={imagenes[indice] ?? ""}
              alt={`Foto ${indice + 1} de ${nombreNegocio}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
            {imagenes.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={anterior}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-90"
                >
                  <ChevronLeft aria-hidden className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={siguiente}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-90"
                >
                  <ChevronRight aria-hidden className="size-5" />
                </Button>
                <figcaption className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white tabular-nums">
                  {indice + 1} / {imagenes.length}
                </figcaption>
              </>
            ) : null}
          </figure>
        </DialogContent>
      </Dialog>
    </>
  );
}
