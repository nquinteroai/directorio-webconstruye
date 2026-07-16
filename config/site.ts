/**
 * Configuración central de marca y agencia.
 *
 * Para renombrar el directorio, cambiar el dominio o el WhatsApp de la
 * agencia, edita SOLO este archivo (y las variables de entorno en Vercel).
 * Las zonas y categorías NO viven aquí: se administran desde /admin
 * (tablas `zonas` y `categorias` en Supabase) para poder expandir sin
 * tocar código.
 */
export const siteConfig = {
  /** Nombre público del directorio (marca). */
  nombre: "Directorio Webconstruye",
  /** Nombre corto de la agencia (badges, créditos). */
  agenciaNombre: "Webconstruye",
  /**
   * URL canónica del sitio. En producción se toma de NEXT_PUBLIC_SITE_URL
   * (configúrala en Vercel cuando el dominio esté definido).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://DOMINIO-PENDIENTE.com",
  /** Meta description por defecto del sitio. */
  descripcion:
    "Encuentra los mejores negocios locales de Kennedy (Bogotá) y Soacha: restaurantes, peluquerías, ferreterías, droguerías y más. Con teléfono, WhatsApp, horarios y cómo llegar.",
  /**
   * WhatsApp de la agencia en formato internacional (57 + 10 dígitos).
   * PLACEHOLDER: reemplazar por el número real antes de lanzar.
   */
  agenciaWhatsapp: "573181682069",
  /** Mensaje precargado del CTA "¿Tienes un negocio? Aparece aquí". */
  mensajeCtaAgencia:
    "Hola, tengo un negocio y quiero aparecer en el Directorio Webconstruye.",
  /** Mensaje precargado al contactar un negocio desde su ficha. */
  mensajeWhatsappNegocio: "Hola, los encontré en el Directorio Webconstruye.",
  /** Zona horaria para el cálculo de "Abierto ahora". */
  zonaHoraria: "America/Bogota",
} as const;

export type SiteConfig = typeof siteConfig;
