import { describe, expect, it } from "vitest";
import {
  dominioLegible,
  formatearCalificacion,
  formatearTelefono,
  pluralResenas,
  telefonoHref,
} from "@/lib/utils/formato";

describe("formatearTelefono", () => {
  it("agrupa números colombianos de 10 dígitos", () => {
    expect(formatearTelefono("6017451233")).toBe("601 745 1233");
    expect(formatearTelefono("3202223302")).toBe("320 222 3302");
  });

  it("maneja el formato internacional 57XXXXXXXXXX", () => {
    expect(formatearTelefono("573001234567")).toBe("300 123 4567");
  });

  it("devuelve tal cual lo que no reconoce", () => {
    expect(formatearTelefono("123")).toBe("123");
  });
});

describe("telefonoHref", () => {
  it("agrega el indicativo de Colombia", () => {
    expect(telefonoHref("6017451233")).toBe("tel:+576017451233");
    expect(telefonoHref("573001234567")).toBe("tel:+573001234567");
  });
});

describe("dominioLegible", () => {
  it("extrae el dominio sin www", () => {
    expect(dominioLegible("https://www.laespigadorada.co/menu")).toBe(
      "laespigadorada.co",
    );
  });

  it("devuelve el texto original si no es URL", () => {
    expect(dominioLegible("no-es-url")).toBe("no-es-url");
  });
});

describe("formatearCalificacion", () => {
  it("usa coma decimal es-CO con un decimal", () => {
    expect(formatearCalificacion(4.666)).toBe("4,7");
    expect(formatearCalificacion(5)).toBe("5,0");
  });
});

describe("pluralResenas", () => {
  it("singular y plural correctos", () => {
    expect(pluralResenas(1)).toBe("1 reseña");
    expect(pluralResenas(12)).toBe("12 reseñas");
  });
});
