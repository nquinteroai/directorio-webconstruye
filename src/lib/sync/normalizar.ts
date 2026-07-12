/**
 * Utilidades puras de normalización y similitud para el match automático
 * CRM ↔ Fábrica de Demos. Sin dependencias de Supabase: 100% testeables.
 */

/** Minúsculas, sin tildes, solo [a-z0-9] separados por espacios simples. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Solo dígitos; descarta el prefijo de país 57 para comparar líneas locales. */
export function normalizarTelefono(telefono: string | null | undefined): string {
  if (!telefono) return "";
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length === 12 && digitos.startsWith("57")) return digitos.slice(2);
  return digitos;
}

/**
 * Similitud de Dice sobre bigramas (0..1). Robusta a palabras reordenadas
 * y errores menores de tipeo — suficiente para nombres de negocio cortos.
 */
export function similitudDice(a: string, b: string): number {
  const na = normalizarTexto(a);
  const nb = normalizarTexto(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const bigramas = (s: string): Map<string, number> => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      m.set(bg, (m.get(bg) ?? 0) + 1);
    }
    return m;
  };
  const ba = bigramas(na);
  const bb = bigramas(nb);
  let comunes = 0;
  let totalA = 0;
  let totalB = 0;
  for (const n of ba.values()) totalA += n;
  for (const n of bb.values()) totalB += n;
  for (const [bg, n] of ba) comunes += Math.min(n, bb.get(bg) ?? 0);
  if (totalA + totalB === 0) return 0;
  return (2 * comunes) / (totalA + totalB);
}

/** Distancia haversine en metros entre dos coordenadas. */
export function distanciaMetros(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
