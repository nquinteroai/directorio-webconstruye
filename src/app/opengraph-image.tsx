import { imagenOg, TAMANO_OG } from "@/lib/seo/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.nombre} — negocios locales en Kennedy y Soacha`;
export const size = TAMANO_OG;
export const contentType = "image/png";

export default function ImagenOgInicio() {
  return imagenOg({
    titulo: "Los negocios de tu barrio, a un clic",
    subtitulo:
      "Restaurantes, peluquerías, ferreterías y más — con WhatsApp, horarios y cómo llegar.",
  });
}
