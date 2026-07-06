"use client";

import dynamic from "next/dynamic";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PropsMapaPicker {
  lat: number;
  lng: number;
  onCambio: (coordenadas: { lat: number; lng: number }) => void;
}

const MapaPickerInterno = dynamic(
  () =>
    import("@/components/admin/mapa-picker-interno").then(
      (m) => m.MapaPickerInterno,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center bg-secondary/60 text-xs text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  },
);

/**
 * Selector de ubicación: clic en el mapa (o arrastrar el pin) fija lat/lng.
 */
export function MapaPicker({
  lat,
  lng,
  onCambio,
  centroZona,
}: PropsMapaPicker & { centroZona: { lat: number; lng: number } | null }) {
  return (
    <div className="space-y-2">
      <div className="h-64 overflow-hidden rounded-xl border">
        <MapaPickerInterno lat={lat} lng={lng} onCambio={onCambio} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground tabular-nums">
          Lat: {lat.toFixed(6)} · Lng: {lng.toFixed(6)} — haz clic en el mapa o
          arrastra el pin.
        </p>
        {centroZona ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onCambio(centroZona)}
          >
            <LocateFixed aria-hidden className="size-3.5" />
            Centrar en la zona
          </Button>
        ) : null}
      </div>
    </div>
  );
}
