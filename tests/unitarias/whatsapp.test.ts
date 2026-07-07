import { describe, expect, it } from "vitest";
import {
  esWhatsappValido,
  linkWhatsapp,
  linkWhatsappAgencia,
} from "@/lib/utils/whatsapp";

describe("esWhatsappValido", () => {
  it("acepta el formato internacional colombiano", () => {
    expect(esWhatsappValido("573001234567")).toBe(true);
  });

  it("rechaza formatos incorrectos", () => {
    expect(esWhatsappValido("3001234567")).toBe(false); // sin 57
    expect(esWhatsappValido("+573001234567")).toBe(false); // con +
    expect(esWhatsappValido("57300123456")).toBe(false); // 9 dígitos
    expect(esWhatsappValido("5730012345678")).toBe(false); // 11 dígitos
  });
});

describe("linkWhatsapp", () => {
  it("arma el enlace wa.me con mensaje precargado", () => {
    const url = new URL(linkWhatsapp("573001234567", "Hola, los encontré"));
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/573001234567");
    expect(url.searchParams.get("text")).toBe("Hola, los encontré");
  });

  it("omite el mensaje si no se pasa", () => {
    expect(linkWhatsapp("573001234567")).toBe("https://wa.me/573001234567");
  });

  it("el enlace de la agencia trae mensaje por defecto", () => {
    const url = new URL(linkWhatsappAgencia());
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toBeTruthy();
  });
});
