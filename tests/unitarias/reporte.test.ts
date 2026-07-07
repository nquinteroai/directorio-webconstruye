import { describe, expect, it } from "vitest";
import { generarTextoReporte } from "@/lib/utils/reporte";

describe("generarTextoReporte", () => {
  it("incluye nombre, mes y todas las cifras", () => {
    const texto = generarTextoReporte({
      nombreNegocio: "La Cazuela de la 38",
      etiquetaMes: "julio de 2026",
      vistas: 143,
      whatsapp: 38,
      llamadas: 12,
      sitioWeb: 9,
      comoLlegar: 21,
    });
    expect(texto).toContain("La Cazuela de la 38");
    expect(texto).toContain("julio de 2026");
    expect(texto).toContain("143 visitas");
    expect(texto).toContain("38 contactos por WhatsApp");
    expect(texto).toContain("12 llamadas");
    expect(texto).toContain("9 visitas a tu página web");
    expect(texto).toContain("21 personas");
    // Total de contactos: 38 + 12 + 9 = 59.
    expect(texto).toContain("59 clientes potenciales");
  });

  it("usa singulares cuando corresponde", () => {
    const texto = generarTextoReporte({
      nombreNegocio: "Test",
      etiquetaMes: "julio de 2026",
      vistas: 1,
      whatsapp: 1,
      llamadas: 1,
      sitioWeb: 0,
      comoLlegar: 1,
    });
    expect(texto).toContain("1 visita a tu ficha");
    expect(texto).toContain("1 contacto por WhatsApp");
    expect(texto).toContain("1 llamada");
    expect(texto).toContain("1 persona pidió la ruta");
  });

  it("mensaje motivador cuando aún no hay contactos", () => {
    const texto = generarTextoReporte({
      nombreNegocio: "Nuevo Negocio",
      etiquetaMes: "julio de 2026",
      vistas: 5,
      whatsapp: 0,
      llamadas: 0,
      sitioWeb: 0,
      comoLlegar: 0,
    });
    expect(texto).toContain("posicionándose en Google");
  });
});
