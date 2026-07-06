export interface DatosReporte {
  nombreNegocio: string;
  /** "julio de 2026" */
  etiquetaMes: string;
  vistas: number;
  whatsapp: number;
  llamadas: number;
  sitioWeb: number;
  comoLlegar: number;
}

/**
 * Texto del reporte mensual listo para pegar en WhatsApp al cliente.
 * Es el argumento de valor de la suscripción: claro, positivo y con cifras.
 */
export function generarTextoReporte(datos: DatosReporte): string {
  const contactos = datos.whatsapp + datos.llamadas + datos.sitioWeb;
  const lineas = [
    `📊 *Reporte de ${datos.nombreNegocio}* — ${datos.etiquetaMes}`,
    "",
    `En el Directorio Webconstruye, este mes tu negocio logró:`,
    `👀 ${datos.vistas} ${datos.vistas === 1 ? "visita a tu ficha" : "visitas a tu ficha"}`,
    `💬 ${datos.whatsapp} ${datos.whatsapp === 1 ? "contacto por WhatsApp" : "contactos por WhatsApp"}`,
    `📞 ${datos.llamadas} ${datos.llamadas === 1 ? "llamada" : "llamadas"}`,
    `🌐 ${datos.sitioWeb} ${datos.sitioWeb === 1 ? "visita a tu página web" : "visitas a tu página web"}`,
    `📍 ${datos.comoLlegar} ${datos.comoLlegar === 1 ? "persona pidió la ruta para llegar" : "personas pidieron la ruta para llegar"}`,
    "",
    contactos > 0
      ? `En total, *${contactos} ${contactos === 1 ? "cliente potencial te contactó" : "clientes potenciales te contactaron"}* gracias a tu ficha. 🚀`
      : `Tu ficha está publicada y posicionándose en Google. ¡Los contactos vienen en camino! 🚀`,
  ];
  return lineas.join("\n");
}
