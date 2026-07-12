import { describe, expect, it } from "vitest";
import {
  esMatchConfiable,
  puntuarCandidato,
  rankearCandidatos,
  UMBRAL_PUBLICACION,
  type NegocioCrm,
} from "@/lib/sync/match";
import {
  distanciaMetros,
  normalizarTelefono,
  normalizarTexto,
  similitudDice,
} from "@/lib/sync/normalizar";

// Caso real del seed: la panadería de Soacha.
const crm: NegocioCrm = {
  nombre: "Panadería La Espiga Dorada",
  direccion: "Cra 7 # 12-34, Soacha",
  telefono: "3101234567",
  lat: 4.5885,
  lng: -74.2131,
};

describe("normalizar", () => {
  it("quita tildes, mayúsculas y símbolos", () => {
    expect(normalizarTexto("Panadería ¡La Espiga!  Dorada")).toBe(
      "panaderia la espiga dorada",
    );
  });

  it("compara teléfonos ignorando el prefijo 57", () => {
    expect(normalizarTelefono("573101234567")).toBe("3101234567");
    expect(normalizarTelefono("310 123-4567")).toBe("3101234567");
    expect(normalizarTelefono(null)).toBe("");
  });

  it("similitud de Dice: idénticos = 1, distintos ≈ 0", () => {
    expect(similitudDice("Panadería La Espiga", "panaderia la espiga")).toBe(1);
    expect(similitudDice("Ferretería El Tornillo", "Peluquería Sofía")).toBeLessThan(
      0.3,
    );
  });

  it("haversine da distancias razonables", () => {
    // ~111 km por grado de latitud.
    expect(distanciaMetros(4.6, -74.2, 4.61, -74.2)).toBeGreaterThan(1000);
    expect(distanciaMetros(4.6, -74.2, 4.6, -74.2)).toBe(0);
  });
});

describe("match CRM ↔ demo", () => {
  it("publica: nombre igual + teléfono igual", () => {
    const r = puntuarCandidato(crm, {
      id: "demo-1",
      nombre: "Panaderia La Espiga Dorada",
      whatsapp: "573101234567",
      lat: null,
      lng: null,
    });
    expect(r.puntaje).toBeGreaterThanOrEqual(UMBRAL_PUBLICACION);
    expect(esMatchConfiable(r)).toBe(true);
  });

  it("publica: nombre igual + a menos de 100 m", () => {
    const r = puntuarCandidato(crm, {
      id: "demo-1",
      nombre: "Panadería La Espiga Dorada",
      lat: 4.5886,
      lng: -74.2132,
    });
    expect(esMatchConfiable(r)).toBe(true);
  });

  it("NO publica: solo el nombre coincide (sin teléfono ni coordenadas)", () => {
    const r = puntuarCandidato(crm, {
      id: "demo-1",
      nombre: "Panadería La Espiga Dorada",
      lat: null,
      lng: null,
    });
    expect(esMatchConfiable(r)).toBe(false);
  });

  it("NO publica: teléfono igual pero nombre distinto (piso de nombre)", () => {
    const r = puntuarCandidato(crm, {
      id: "demo-2",
      nombre: "Ferretería Tornillos y Tuercas",
      telefono: "3101234567",
      lat: 4.5885,
      lng: -74.2131,
      direccion: "Cra 7 # 12-34, Soacha",
    });
    // Suma por teléfono+geo+dirección, pero el nombre no se parece.
    expect(esMatchConfiable(r)).toBe(false);
  });

  it("rankea el demo correcto por encima de los demás", () => {
    const ranking = rankearCandidatos(crm, [
      { id: "otro", nombre: "Veterinaria Huellitas", lat: 4.62, lng: -74.15 },
      {
        id: "correcto",
        nombre: "Panadería La Espiga Dorada",
        whatsapp: "573101234567",
        lat: 4.5885,
        lng: -74.2131,
      },
    ]);
    expect(ranking[0].id).toBe("correcto");
    expect(esMatchConfiable(ranking[0])).toBe(true);
    expect(esMatchConfiable(ranking[1])).toBe(false);
  });
});
