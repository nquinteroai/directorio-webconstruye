import { describe, expect, it } from "vitest";
import {
  aMinutos,
  estadoApertura,
  formatearHora12,
  momentoEnBogota,
  normalizarHorarios,
  tieneHorarios,
} from "@/lib/utils/horarios";
import type { Horarios } from "@/types/database";

/** Crea una fecha en hora exacta de Bogotá (UTC-5 fijo, sin DST). */
function fechaBogota(iso: string): Date {
  return new Date(`${iso}-05:00`);
}

const HORARIO_COMERCIO: Horarios = {
  lun: { abre: "08:00", cierra: "18:00" },
  mar: { abre: "08:00", cierra: "18:00" },
  mie: { abre: "08:00", cierra: "18:00" },
  jue: { abre: "08:00", cierra: "18:00" },
  vie: { abre: "08:00", cierra: "18:00" },
  sab: { abre: "09:00", cierra: "14:00" },
  dom: null,
};

describe("normalizarHorarios", () => {
  it("acepta el formato válido y descarta basura", () => {
    const resultado = normalizarHorarios({
      lun: { abre: "08:00", cierra: "18:00" },
      mar: null,
      mie: { abre: "25:00", cierra: "18:00" }, // hora inválida
      jue: "texto", // tipo inválido
      otra_clave: { abre: "08:00", cierra: "18:00" }, // día inexistente
    });
    expect(resultado.lun).toEqual({ abre: "08:00", cierra: "18:00" });
    expect(resultado.mar).toBeNull();
    expect(resultado.mie).toBeUndefined();
    expect(resultado.jue).toBeUndefined();
    expect("otra_clave" in resultado).toBe(false);
  });

  it("devuelve objeto vacío ante null o tipos raros", () => {
    expect(normalizarHorarios(null)).toEqual({});
    expect(normalizarHorarios([1, 2] as never)).toEqual({});
    expect(tieneHorarios({})).toBe(false);
  });
});

describe("aMinutos y formatearHora12", () => {
  it("convierte horas a minutos", () => {
    expect(aMinutos("00:00")).toBe(0);
    expect(aMinutos("08:30")).toBe(510);
    expect(aMinutos("23:59")).toBe(1439);
  });

  it("formatea en 12 horas estilo es-CO", () => {
    expect(formatearHora12("08:00")).toBe("8:00 a. m.");
    expect(formatearHora12("12:00")).toBe("12:00 p. m.");
    expect(formatearHora12("00:30")).toBe("12:30 a. m.");
    expect(formatearHora12("18:45")).toBe("6:45 p. m.");
  });
});

describe("momentoEnBogota", () => {
  it("calcula día y minutos en zona America/Bogota", () => {
    // Miércoles 8 de julio de 2026, 10:30 a. m. en Bogotá.
    const momento = momentoEnBogota(fechaBogota("2026-07-08T10:30:00"));
    expect(momento.dia).toBe("mie");
    expect(momento.minutos).toBe(10 * 60 + 30);
  });

  it("no depende de la zona del sistema (usa UTC de entrada)", () => {
    // 03:00 UTC del jueves = 22:00 del miércoles en Bogotá.
    const momento = momentoEnBogota(new Date("2026-07-09T03:00:00Z"));
    expect(momento.dia).toBe("mie");
    expect(momento.minutos).toBe(22 * 60);
  });
});

describe("estadoApertura", () => {
  it("negocio abierto en plena jornada", () => {
    const estado = estadoApertura(
      HORARIO_COMERCIO,
      fechaBogota("2026-07-08T10:30:00"), // miércoles
    );
    expect(estado?.tipo).toBe("abierto");
    expect(estado?.detalle).toContain("6:00 p. m.");
  });

  it("avisa 'cierra pronto' en la última hora", () => {
    const estado = estadoApertura(
      HORARIO_COMERCIO,
      fechaBogota("2026-07-08T17:15:00"),
    );
    expect(estado?.tipo).toBe("cierra_pronto");
  });

  it("cerrado antes de abrir, con hora de apertura de hoy", () => {
    const estado = estadoApertura(
      HORARIO_COMERCIO,
      fechaBogota("2026-07-08T06:00:00"),
    );
    expect(estado?.tipo).toBe("cerrado");
    expect(estado?.detalle).toContain("hoy");
    expect(estado?.detalle).toContain("8:00 a. m.");
  });

  it("domingo cerrado anuncia que abre mañana", () => {
    const estado = estadoApertura(
      HORARIO_COMERCIO,
      fechaBogota("2026-07-12T15:00:00"), // domingo
    );
    expect(estado?.tipo).toBe("cerrado");
    expect(estado?.detalle).toContain("mañana");
  });

  it("franja nocturna que cruza medianoche sigue abierta de madrugada", () => {
    const nocturno: Horarios = {
      vie: { abre: "18:00", cierra: "02:00" },
    };
    // Sábado 1:00 a. m.: la franja del viernes sigue activa.
    const estado = estadoApertura(nocturno, fechaBogota("2026-07-11T01:00:00"));
    expect(estado?.tipo).toBe("cierra_pronto"); // cierra a las 2:00 a. m.
    expect(estado?.detalle).toContain("2:00 a. m.");
  });

  it("devuelve null si el negocio no tiene horarios", () => {
    expect(estadoApertura({}, fechaBogota("2026-07-08T10:00:00"))).toBeNull();
  });
});
