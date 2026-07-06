"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { pinNegocio } from "@/components/mapas/pin";
import { cn } from "@/lib/utils";

export interface PuntoMapa {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  lat: number;
  lng: number;
  destacado: boolean;
}

export interface PropsMapaNegocios {
  puntos: PuntoMapa[];
  centro: { lat: number; lng: number };
  zoom: number;
  /** Mostrar enlace "Ver ficha" en el popup (apagado en la propia ficha). */
  popupConEnlace?: boolean;
  className?: string;
}

const UMBRAL_CLUSTERS = 25;

const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const URL_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * bindPopup recibe HTML crudo: todo dato dinámico se escapa para impedir
 * inyección (XSS) aunque un nombre de negocio traiga marcado malicioso.
 */
function escaparHtml(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Con muchos pines, agrupa con leaflet.markercluster (cargado bajo demanda). */
function MarcadoresAgrupados({
  puntos,
  popupConEnlace,
}: {
  puntos: PuntoMapa[];
  popupConEnlace: boolean;
}) {
  const mapa = useMap();

  useEffect(() => {
    let grupo: L.MarkerClusterGroup | null = null;
    let cancelado = false;

    void (async () => {
      await import("leaflet.markercluster");
      if (cancelado) return;
      grupo = L.markerClusterGroup({ showCoverageOnHover: false });
      for (const punto of puntos) {
        const marcador = L.marker([punto.lat, punto.lng], {
          icon: pinNegocio(punto.destacado),
          alt: punto.nombre,
        });
        marcador.bindPopup(
          `<strong>${escaparHtml(punto.nombre)}</strong><br/><span>${escaparHtml(punto.categoria)}</span>` +
            (popupConEnlace
              ? `<br/><a href="/negocio/${encodeURIComponent(punto.slug)}">Ver ficha completa</a>`
              : ""),
        );
        grupo.addLayer(marcador);
      }
      mapa.addLayer(grupo);
    })();

    return () => {
      cancelado = true;
      if (grupo) mapa.removeLayer(grupo);
    };
  }, [mapa, puntos, popupConEnlace]);

  return null;
}

export function MapaNegocios({
  puntos,
  centro,
  zoom,
  popupConEnlace = true,
  className,
}: PropsMapaNegocios) {
  return (
    <MapContainer
      key={`${centro.lat},${centro.lng}`}
      center={[centro.lat, centro.lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={cn("z-0 h-full w-full", className)}
    >
      <TileLayer attribution={ATRIBUCION} url={URL_TILES} />
      {puntos.length > UMBRAL_CLUSTERS ? (
        <MarcadoresAgrupados puntos={puntos} popupConEnlace={popupConEnlace} />
      ) : (
        puntos.map((punto) => (
          <Marker
            key={punto.id}
            position={[punto.lat, punto.lng]}
            icon={pinNegocio(punto.destacado)}
            alt={punto.nombre}
          >
            <Popup>
              <strong className="block text-sm">{punto.nombre}</strong>
              <span className="text-xs text-muted-foreground">
                {punto.categoria}
              </span>
              {popupConEnlace ? (
                <a
                  href={`/negocio/${punto.slug}`}
                  className="mt-1 block text-xs font-semibold text-primary"
                >
                  Ver ficha completa →
                </a>
              ) : null}
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
}
