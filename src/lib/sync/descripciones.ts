/**
 * Textos SEO generados para listados creados por la sincronización
 * automática. Plantillas en es-CO: cumplen los mínimos del directorio
 * (corta ≤160) y varían su redacción según una `semilla` (el id del demo)
 * para que no todas las fichas lean igual. Funciones puras, sin IO.
 */

interface DatosDescripcion {
  nombre: string;
  categoriaNombre: string;
  zonaNombre: string;
  ciudad: string;
  direccion: string;
  barrio?: string | null;
  servicios?: string[] | null;
  horarios?: unknown;
  semilla?: string;
}

/** Suma simple de charCodes de la semilla, módulo n. Determinístico. */
function indicePorSemilla(semilla: string | undefined, n: number): number {
  if (!semilla) return 0;
  let suma = 0;
  for (const ch of semilla) suma += ch.charCodeAt(0);
  return suma % n;
}

/** Frase natural con hasta 3 servicios: "a, b y c". */
function fraseServicios(servicios?: string[] | null): string | null {
  if (!servicios || servicios.length === 0) return null;
  const lista = servicios.slice(0, 3).map((s) => s.trim()).filter(Boolean);
  if (lista.length === 0) return null;
  if (lista.length === 1) return lista[0];
  const ultimo = lista[lista.length - 1];
  const resto = lista.slice(0, -1);
  return `${resto.join(", ")} y ${ultimo}`;
}

export function generarDescripcionCorta(d: DatosDescripcion): string {
  const lugar = d.barrio ? `${d.barrio}, ${d.zonaNombre}` : d.zonaNombre;
  const corta = `${d.nombre}: ${d.categoriaNombre.toLowerCase()} en ${lugar}, ${d.ciudad}. Contacto directo por WhatsApp o teléfono y cómo llegar.`;
  return corta.length <= 160 ? corta : `${corta.slice(0, 157)}…`;
}

// Tres aperturas con estructura de frase distinta entre sí.
const APERTURAS: Array<(d: DatosDescripcion, categoria: string, lugar: string) => string> = [
  (d, categoria, lugar) =>
    `${d.nombre} es un negocio de ${categoria} ubicado en ${d.direccion}, en ${lugar} (${d.ciudad}).`,
  (d, categoria, lugar) =>
    `En ${lugar} (${d.ciudad}) encuentras a ${d.nombre}, atendiendo en ${d.direccion} con servicio de ${categoria}.`,
  (d, categoria, lugar) =>
    `¿Buscas ${categoria} en ${lugar}? ${d.nombre} queda en ${d.direccion}, en ${d.ciudad}, y atiende al barrio y sus alrededores.`,
];

// Dos cierres con la invitación al propietario y la mención del directorio.
const CIERRES: Array<(d: DatosDescripcion, zonaNombre: string) => string> = [
  (d, zonaNombre) =>
    `${d.nombre} hace parte del Directorio Webconstruye, la guía de negocios locales verificados de ${zonaNombre}. Si eres el propietario y quieres actualizar la información de tu ficha, escríbenos.`,
  (d, zonaNombre) =>
    `Esta ficha se publica dentro del Directorio Webconstruye, con negocios verificados de ${zonaNombre}. ¿Eres el dueño de ${d.nombre}? Contáctanos para ajustar los datos cuando quieras.`,
];

export function generarDescripcionLarga(d: DatosDescripcion): string {
  const categoria = d.categoriaNombre.toLowerCase();
  const lugar = d.barrio ? `la zona de ${d.zonaNombre}, cerca a ${d.barrio}` : `la zona de ${d.zonaNombre}`;

  const iApertura = indicePorSemilla(d.semilla, APERTURAS.length);
  const iCierre = indicePorSemilla(d.semilla, CIERRES.length);
  const apertura = APERTURAS[iApertura](d, categoria, lugar);

  const servicios = fraseServicios(d.servicios);
  const parrafoMedio = servicios
    ? `Entre los servicios que ofrece están ${servicios}. Atiende al público del sector y sus alrededores con atención personalizada. Desde esta página puedes contactarlo directamente por WhatsApp o por teléfono, y consultar cómo llegar con el mapa de la ficha.`
    : `Atiende al público del sector y sus alrededores con atención personalizada. Desde esta página puedes contactarlo directamente por WhatsApp o por teléfono, y consultar cómo llegar con el mapa de la ficha.`;

  const cierre = CIERRES[iCierre](d, d.zonaNombre);

  return [apertura, parrafoMedio, cierre].join("\n\n");
}
