"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { PropsMapaNegocios } from "@/components/mapas/mapa-negocios";
import { cn } from "@/lib/utils";

function PlaceholderMapa() {
  return (
    <div
      aria-hidden
      className="grid h-full w-full place-items-center bg-secondary/60"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <MapPin className="size-6 animate-pulse text-primary/60" />
        <span className="text-xs font-medium">Cargando mapa…</span>
      </div>
    </div>
  );
}

// Leaflet solo existe en el navegador: se excluye del SSR y del bundle
// inicial. El chunk se descarga únicamente cuando el mapa va a mostrarse.
const MapaNegocios = dynamic(
  () => import("@/components/mapas/mapa-negocios").then((m) => m.MapaNegocios),
  { ssr: false, loading: () => <PlaceholderMapa /> },
);

/**
 * Envoltura perezosa del mapa: no monta Leaflet hasta que el contenedor está
 * por entrar al viewport (IntersectionObserver, margen 250 px). Clave para
 * el performance móvil: el mapa nunca compite con el LCP.
 */
export function MapaPerezoso({
  className,
  etiqueta,
  ...props
}: PropsMapaNegocios & { etiqueta: string }) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={contenedorRef}
      role="region"
      aria-label={etiqueta}
      className={cn("overflow-hidden rounded-xl border", className)}
    >
      {visible ? <MapaNegocios {...props} /> : <PlaceholderMapa />}
    </div>
  );
}
