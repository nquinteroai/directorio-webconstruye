import L from "leaflet";

/**
 * Pin SVG con el color de marca (miel). Usar un DivIcon propio evita el bug
 * clásico de Leaflet en bundlers (imágenes del ícono por defecto rotas) y
 * mantiene el mapa dentro del sistema visual del directorio.
 */
export function pinNegocio(destacado = false): L.DivIcon {
  const ancho = destacado ? 38 : 30;
  const alto = Math.round(ancho * 1.32);
  const relleno = destacado ? "var(--miel-clara)" : "var(--primary)";
  return L.divIcon({
    className: "", // sin estilos por defecto de Leaflet
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 24 32" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 8.8 10.4 18.9 11.2 19.6a1.2 1.2 0 0 0 1.6 0C13.6 30.9 24 20.8 24 12 24 5.4 18.6 0 12 0z"
          fill="${relleno}" stroke="oklch(0.99 0.005 85)" stroke-width="1.4"/>
        <circle cx="12" cy="12" r="4.6" fill="oklch(0.99 0.005 85)"/>
        ${destacado ? '<path d="M12 8.6l1 2.1 2.3.3-1.7 1.6.4 2.2-2-1.1-2 1.1.4-2.2-1.7-1.6 2.3-.3z" fill="var(--primary)"/>' : ""}
      </svg>`,
    iconSize: [ancho, alto],
    iconAnchor: [ancho / 2, alto],
    popupAnchor: [0, -alto + 6],
  });
}
