"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Marker as MarkerLeaflet } from "leaflet";
import "leaflet/dist/leaflet.css";
import { pinNegocio } from "@/components/mapas/pin";
import type { PropsMapaPicker } from "@/components/admin/mapa-picker";

function PinInteractivo({ lat, lng, onCambio }: PropsMapaPicker) {
  const mapa = useMap();
  const marcadorRef = useRef<MarkerLeaflet>(null);

  useMapEvents({
    click(evento) {
      onCambio({ lat: evento.latlng.lat, lng: evento.latlng.lng });
    },
  });

  // Si las coordenadas cambian desde afuera (ej. "Centrar en la zona"),
  // el mapa acompaña al pin.
  useEffect(() => {
    mapa.panTo([lat, lng]);
  }, [mapa, lat, lng]);

  return (
    <Marker
      ref={marcadorRef}
      position={[lat, lng]}
      icon={pinNegocio()}
      draggable
      eventHandlers={{
        dragend() {
          const posicion = marcadorRef.current?.getLatLng();
          if (posicion) onCambio({ lat: posicion.lat, lng: posicion.lng });
        },
      }}
    />
  );
}

export function MapaPickerInterno({ lat, lng, onCambio }: PropsMapaPicker) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom
      className="z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PinInteractivo lat={lat} lng={lng} onCambio={onCambio} />
    </MapContainer>
  );
}
