import { describe, expect, it } from "vitest";
import { esSlugValido, generarSlug } from "@/lib/utils/slug";

describe("generarSlug", () => {
  it("quita tildes y eñes", () => {
    expect(generarSlug("Peluquería Estilo & Color")).toBe(
      "peluqueria-estilo-color",
    );
    expect(generarSlug("El Ñato")).toBe("el-nato");
    expect(generarSlug("Óptica Visión Única")).toBe("optica-vision-unica");
  });

  it("limpia símbolos, espacios múltiples y guiones extremos", () => {
    expect(generarSlug("  Café -- de la 38!!! ")).toBe("cafe-de-la-38");
    expect(generarSlug("Talleres @ Motos #1")).toBe("talleres-motos-1");
  });

  it("produce slugs válidos según la regla del esquema", () => {
    const casos = ["Droguería La Economía", "1A Ferretería", "ÑOÑO'S BURGER"];
    for (const caso of casos) {
      expect(esSlugValido(generarSlug(caso))).toBe(true);
    }
  });

  it("valida el formato correcto", () => {
    expect(esSlugValido("mi-negocio-2")).toBe(true);
    expect(esSlugValido("Mi-Negocio")).toBe(false);
    expect(esSlugValido("-inicia-mal")).toBe(false);
    expect(esSlugValido("doble--guion")).toBe(false);
    expect(esSlugValido("")).toBe(false);
  });
});
