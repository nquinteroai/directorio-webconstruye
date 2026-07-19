import { describe, expect, it } from "vitest";
import { generarDescripcionCorta, generarDescripcionLarga } from "@/lib/sync/descripciones";

const base = {
  nombre: "Cerrajería El Candado",
  categoriaNombre: "Cerrajería",
  zonaNombre: "Kennedy",
  ciudad: "Bogotá",
  direccion: "Cra 78 # 35-20 Sur",
  barrio: "Timiza",
  servicios: ["Apertura de puertas", "Cambio de guardas"],
  semilla: "a1b2c3",
};

describe("generarDescripcionCorta", () => {
  it("respeta el máximo de 160 caracteres", () => {
    expect(generarDescripcionCorta(base).length).toBeLessThanOrEqual(160);
  });
  it("menciona el nombre y la zona o el barrio", () => {
    const corta = generarDescripcionCorta(base);
    expect(corta).toContain("Cerrajería El Candado");
    expect(corta.includes("Kennedy") || corta.includes("Timiza")).toBe(true);
  });
});

describe("generarDescripcionLarga", () => {
  it("incluye los servicios cuando existen", () => {
    expect(generarDescripcionLarga(base)).toContain("Apertura de puertas");
  });
  it("varía la estructura según la semilla", () => {
    const a = generarDescripcionLarga({ ...base, semilla: "aaaa" });
    const b = generarDescripcionLarga({ ...base, semilla: "zzzz" });
    expect(a).not.toEqual(b);
  });
  it("sin servicios ni barrio no rompe", () => {
    const texto = generarDescripcionLarga({ ...base, servicios: null, barrio: null, semilla: "x" });
    expect(texto.length).toBeGreaterThan(100);
  });
});
