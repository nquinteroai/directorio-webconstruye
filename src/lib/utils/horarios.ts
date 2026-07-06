import { siteConfig } from "@/config/site";
import type {
  DiaSemana,
  FranjaHoraria,
  Horarios,
  Json,
} from "@/types/database";

export const DIAS_SEMANA: readonly DiaSemana[] = [
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
  "dom",
] as const;

export const NOMBRES_DIAS: Record<DiaSemana, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

const RE_HORA = /^([01]?\d|2[0-3]):[0-5]\d$/;

/** Valida y normaliza el jsonb `horarios` de la base de datos. */
export function normalizarHorarios(json: Json | Horarios): Horarios {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  const resultado: Horarios = {};
  for (const dia of DIAS_SEMANA) {
    const valor = (json as Record<string, unknown>)[dia];
    if (valor === null) {
      resultado[dia] = null;
      continue;
    }
    if (
      valor &&
      typeof valor === "object" &&
      typeof (valor as FranjaHoraria).abre === "string" &&
      typeof (valor as FranjaHoraria).cierra === "string" &&
      RE_HORA.test((valor as FranjaHoraria).abre) &&
      RE_HORA.test((valor as FranjaHoraria).cierra)
    ) {
      resultado[dia] = {
        abre: (valor as FranjaHoraria).abre,
        cierra: (valor as FranjaHoraria).cierra,
      };
    }
  }
  return resultado;
}

/** ¿El negocio tiene al menos una franja definida? */
export function tieneHorarios(horarios: Horarios): boolean {
  return DIAS_SEMANA.some((dia) => Boolean(horarios[dia]));
}

/** "08:30" → 510 (minutos desde medianoche). */
export function aMinutos(hora: string): number {
  const [h = 0, m = 0] = hora.split(":").map(Number);
  return h * 60 + m;
}

export interface MomentoBogota {
  dia: DiaSemana;
  /** Minutos transcurridos desde la medianoche en Bogotá. */
  minutos: number;
}

const MAPA_DIA_EN: Record<string, DiaSemana> = {
  Mon: "lun",
  Tue: "mar",
  Wed: "mie",
  Thu: "jue",
  Fri: "vie",
  Sat: "sab",
  Sun: "dom",
};

/**
 * Día y hora actuales en la zona horaria de Bogotá, sin depender de la zona
 * del dispositivo ni del servidor.
 */
export function momentoEnBogota(fecha: Date = new Date()): MomentoBogota {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: siteConfig.zonaHoraria,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);

  let dia: DiaSemana = "lun";
  let horas = 0;
  let minutos = 0;
  for (const parte of partes) {
    if (parte.type === "weekday") dia = MAPA_DIA_EN[parte.value] ?? "lun";
    if (parte.type === "hour") horas = Number(parte.value) % 24;
    if (parte.type === "minute") minutos = Number(parte.value);
  }
  return { dia, minutos: horas * 60 + minutos };
}

export type EstadoAperturaTipo = "abierto" | "cierra_pronto" | "cerrado";

export interface EstadoApertura {
  tipo: EstadoAperturaTipo;
  /** Texto corto para la píldora: "Abierto ahora", "Cierra pronto", "Cerrado". */
  etiqueta: string;
  /** Complemento: "Cierra a las 6:00 p. m." / "Abre mañana a las 8:00 a. m." */
  detalle: string | null;
}

/** "18:30" → "6:30 p. m." (estilo es-CO). */
export function formatearHora12(hora: string): string {
  const [h = 0, m = 0] = hora.split(":").map(Number);
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hora12}:00 ${sufijo}` : `${hora12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

function franjaActiva(
  franja: FranjaHoraria,
  minutos: number,
): { activa: boolean; cierreEnMinutos: number } {
  const abre = aMinutos(franja.abre);
  const cierra = aMinutos(franja.cierra);
  if (cierra > abre) {
    // Franja normal en el mismo día.
    return {
      activa: minutos >= abre && minutos < cierra,
      cierreEnMinutos: cierra - minutos,
    };
  }
  // Franja nocturna que cruza medianoche (ej. 18:00 → 02:00).
  return {
    activa: minutos >= abre,
    cierreEnMinutos: 24 * 60 - minutos + cierra,
  };
}

/**
 * Calcula el estado "Abierto ahora / Cierra pronto / Cerrado" de un negocio.
 * Devuelve `null` si el negocio no tiene horarios configurados.
 *
 * Soporta franjas nocturnas (ej. 18:00–02:00): revisa la franja de hoy y el
 * remanente de la franja nocturna de ayer.
 */
export function estadoApertura(
  horarios: Horarios,
  fecha: Date = new Date(),
): EstadoApertura | null {
  if (!tieneHorarios(horarios)) return null;

  const { dia, minutos } = momentoEnBogota(fecha);
  const indiceHoy = DIAS_SEMANA.indexOf(dia);

  // 1. Remanente nocturno de AYER (ej. ayer 18:00–02:00 y son la 1:30 a. m.).
  const ayer = DIAS_SEMANA[(indiceHoy + 6) % 7] as DiaSemana;
  const franjaAyer = horarios[ayer];
  if (franjaAyer && aMinutos(franjaAyer.cierra) <= aMinutos(franjaAyer.abre)) {
    const cierraAyer = aMinutos(franjaAyer.cierra);
    if (minutos < cierraAyer) {
      const restante = cierraAyer - minutos;
      return restante <= 60
        ? {
            tipo: "cierra_pronto",
            etiqueta: "Cierra pronto",
            detalle: `Cierra a las ${formatearHora12(franjaAyer.cierra)}`,
          }
        : {
            tipo: "abierto",
            etiqueta: "Abierto ahora",
            detalle: `Cierra a las ${formatearHora12(franjaAyer.cierra)}`,
          };
    }
  }

  // 2. Franja de HOY.
  const franjaHoy = horarios[dia];
  if (franjaHoy) {
    const { activa, cierreEnMinutos } = franjaActiva(franjaHoy, minutos);
    if (activa) {
      return cierreEnMinutos <= 60
        ? {
            tipo: "cierra_pronto",
            etiqueta: "Cierra pronto",
            detalle: `Cierra a las ${formatearHora12(franjaHoy.cierra)}`,
          }
        : {
            tipo: "abierto",
            etiqueta: "Abierto ahora",
            detalle: `Cierra a las ${formatearHora12(franjaHoy.cierra)}`,
          };
    }
    // Aún no abre hoy.
    if (minutos < aMinutos(franjaHoy.abre)) {
      return {
        tipo: "cerrado",
        etiqueta: "Cerrado",
        detalle: `Abre hoy a las ${formatearHora12(franjaHoy.abre)}`,
      };
    }
  }

  // 3. Próxima apertura en los siguientes 7 días.
  for (let salto = 1; salto <= 7; salto++) {
    const proximoDia = DIAS_SEMANA[(indiceHoy + salto) % 7] as DiaSemana;
    const franja = horarios[proximoDia];
    if (franja) {
      const cuando =
        salto === 1 ? "mañana" : `el ${NOMBRES_DIAS[proximoDia].toLowerCase()}`;
      return {
        tipo: "cerrado",
        etiqueta: "Cerrado",
        detalle: `Abre ${cuando} a las ${formatearHora12(franja.abre)}`,
      };
    }
  }

  return { tipo: "cerrado", etiqueta: "Cerrado", detalle: null };
}
