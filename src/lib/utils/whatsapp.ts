import { siteConfig } from "@/config/site";

/** ¿Número colombiano en formato internacional? (57 + 10 dígitos). */
export function esWhatsappValido(numero: string): boolean {
  return /^57\d{10}$/.test(numero);
}

/** Construye el enlace wa.me con mensaje precargado. */
export function linkWhatsapp(numero: string, mensaje?: string): string {
  const url = new URL(`https://wa.me/${numero}`);
  if (mensaje) url.searchParams.set("text", mensaje);
  return url.toString();
}

/** Enlace al WhatsApp de la AGENCIA (CTA "¿Tienes un negocio?"). */
export function linkWhatsappAgencia(mensaje?: string): string {
  return linkWhatsapp(
    siteConfig.agenciaWhatsapp,
    mensaje ?? siteConfig.mensajeCtaAgencia,
  );
}
