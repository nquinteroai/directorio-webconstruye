/**
 * "6017451233" → "601 745 1233" · "3202223302" → "320 222 3302".
 * Números que no calcen con el patrón colombiano se devuelven tal cual.
 */
export function formatearTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, "");
  if (limpio.length === 10) {
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
  }
  if (limpio.length === 12 && limpio.startsWith("57")) {
    const nacional = limpio.slice(2);
    return `${nacional.slice(0, 3)} ${nacional.slice(3, 6)} ${nacional.slice(6)}`;
  }
  return telefono;
}

/** href de llamada: "6017451233" → "tel:+576017451233". */
export function telefonoHref(telefono: string): string {
  const limpio = telefono.replace(/\D/g, "");
  return limpio.startsWith("57") ? `tel:+${limpio}` : `tel:+57${limpio}`;
}

/** "https://www.ejemplo.co/ruta" → "ejemplo.co" (para mostrar). */
export function dominioLegible(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Promedio con un decimal estilo es-CO: 4.6667 → "4,7". */
export function formatearCalificacion(valor: number): string {
  return valor.toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** 1 → "1 reseña", 3 → "3 reseñas". */
export function pluralResenas(total: number): string {
  return total === 1 ? "1 reseña" : `${total} reseñas`;
}
