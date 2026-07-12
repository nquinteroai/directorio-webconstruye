/**
 * Textos SEO generados para listados creados por la sincronización
 * automática. Plantillas neutras en es-CO: cumplen los mínimos del
 * directorio (corta ≤160) y se pueden pulir después desde /admin.
 */

interface DatosDescripcion {
  nombre: string;
  categoriaNombre: string;
  zonaNombre: string;
  ciudad: string;
  direccion: string;
  barrio?: string | null;
}

export function generarDescripcionCorta(d: DatosDescripcion): string {
  const lugar = d.barrio ? `${d.barrio}, ${d.zonaNombre}` : d.zonaNombre;
  const corta = `${d.nombre}: ${d.categoriaNombre.toLowerCase()} en ${lugar}, ${d.ciudad}. Contacto directo por WhatsApp o teléfono y cómo llegar.`;
  return corta.length <= 160 ? corta : `${corta.slice(0, 157)}…`;
}

export function generarDescripcionLarga(d: DatosDescripcion): string {
  const categoria = d.categoriaNombre.toLowerCase();
  return [
    `${d.nombre} es un negocio de ${categoria} ubicado en ${d.direccion}, en la zona de ${d.zonaNombre} (${d.ciudad}).`,
    `Atiende al público del sector y sus alrededores con atención personalizada. Desde esta página puedes contactarlo directamente por WhatsApp o por teléfono, y consultar cómo llegar con el mapa de la ficha.`,
    `${d.nombre} hace parte del Directorio Webconstruye, la guía de negocios locales verificados de ${d.zonaNombre}. Si eres el propietario y quieres actualizar la información de tu ficha, escríbenos.`,
  ].join("\n\n");
}
