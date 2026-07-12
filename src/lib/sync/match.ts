/**
 * Match automático entre la venta que reporta el CRM y su demo en la
 * Fábrica de Demos (misma base de datos). Es el ÚNICO filtro de calidad
 * antes de publicar en el directorio: si el mejor candidato no alcanza el
 * umbral, la venta NO se publica y queda en `sync_eventos` como
 * `sin_match` para revisión manual.
 */

import {
  distanciaMetros,
  normalizarTelefono,
  similitudDice,
} from "./normalizar";

/** Datos del negocio tal como llegan del CRM (payload del webhook). */
export interface NegocioCrm {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  lat: number;
  lng: number;
}

/** Candidato contra el que se compara (demo o negocio ya publicado). */
export interface CandidatoMatch {
  id: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface ResultadoMatch {
  id: string;
  nombre: string;
  puntaje: number;
  puntajeNombre: number;
  detalle: {
    nombre: number;
    telefono: number;
    geo: number;
    direccion: number;
    distanciaM: number | null;
  };
}

/**
 * Umbral mínimo de confianza para publicar automáticamente.
 * Referencias con los pesos actuales:
 *   · nombre idéntico + teléfono igual            → 0.65 ✓
 *   · nombre idéntico + a <100 m                  → 0.60 ✓
 *   · nombre idéntico solo (sin tel, sin coords)  → 0.40 ✗ (a revisión)
 */
export const UMBRAL_PUBLICACION = 0.6;

/** Piso duro: sin parecido real de nombre no hay match, sume lo que sume. */
export const UMBRAL_NOMBRE_MINIMO = 0.5;

const PESOS = { nombre: 0.4, telefono: 0.25, geo: 0.2, direccion: 0.15 };

function puntajeGeo(distanciaM: number | null): number {
  if (distanciaM == null) return 0;
  if (distanciaM <= 100) return 1;
  if (distanciaM <= 250) return 0.6;
  if (distanciaM <= 500) return 0.25;
  return 0;
}

/** Compara el negocio del CRM contra un candidato y devuelve su puntaje. */
export function puntuarCandidato(
  crm: NegocioCrm,
  candidato: CandidatoMatch,
): ResultadoMatch {
  const nombre = similitudDice(crm.nombre, candidato.nombre);

  const telCrm = normalizarTelefono(crm.telefono);
  const telefono =
    telCrm.length >= 7 &&
    (telCrm === normalizarTelefono(candidato.telefono) ||
      telCrm === normalizarTelefono(candidato.whatsapp))
      ? 1
      : 0;

  const distanciaM =
    candidato.lat != null && candidato.lng != null
      ? distanciaMetros(crm.lat, crm.lng, candidato.lat, candidato.lng)
      : null;
  const geo = puntajeGeo(distanciaM);

  const direccion =
    crm.direccion && candidato.direccion
      ? similitudDice(crm.direccion, candidato.direccion)
      : 0;

  const puntaje =
    nombre * PESOS.nombre +
    telefono * PESOS.telefono +
    geo * PESOS.geo +
    direccion * PESOS.direccion;

  return {
    id: candidato.id,
    nombre: candidato.nombre,
    puntaje: Number(puntaje.toFixed(4)),
    puntajeNombre: Number(nombre.toFixed(4)),
    detalle: {
      nombre: Number(nombre.toFixed(4)),
      telefono,
      geo,
      direccion: Number(direccion.toFixed(4)),
      distanciaM: distanciaM != null ? Math.round(distanciaM) : null,
    },
  };
}

/** ¿El resultado supera el umbral de publicación automática? */
export function esMatchConfiable(r: ResultadoMatch): boolean {
  return r.puntaje >= UMBRAL_PUBLICACION && r.puntajeNombre >= UMBRAL_NOMBRE_MINIMO;
}

/** Puntúa todos los candidatos y los devuelve de mejor a peor. */
export function rankearCandidatos(
  crm: NegocioCrm,
  candidatos: CandidatoMatch[],
): ResultadoMatch[] {
  return candidatos
    .map((c) => puntuarCandidato(crm, c))
    .sort((a, b) => b.puntaje - a.puntaje);
}
