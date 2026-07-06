import "server-only";

import { clienteServicio } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import type { TipoClick } from "@/types/database";

export interface ConteosPorTipo {
  vista_ficha: number;
  whatsapp: number;
  llamada: number;
  sitio_web: number;
  como_llegar: number;
}

export const CONTEOS_VACIOS: ConteosPorTipo = {
  vista_ficha: 0,
  whatsapp: 0,
  llamada: 0,
  sitio_web: 0,
  como_llegar: 0,
};

/** Primer día del mes actual en Bogotá (UTC-5 fijo, sin horario de verano). */
export function inicioMesBogota(ahora: Date = new Date()): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: siteConfig.zonaHoraria,
    year: "numeric",
    month: "2-digit",
  }).format(ahora); // "2026-07"
  return new Date(`${partes}-01T00:00:00-05:00`);
}

/** Nombre del mes actual en Bogotá, en español ("julio de 2026"). */
export function etiquetaMesBogota(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: siteConfig.zonaHoraria,
    month: "long",
    year: "numeric",
  }).format(ahora);
}

function agruparPorTipo(filas: { tipo: TipoClick }[]): ConteosPorTipo {
  const conteos = { ...CONTEOS_VACIOS };
  for (const fila of filas) conteos[fila.tipo] += 1;
  return conteos;
}

// ---------------------------------------------------------------------------
// Dashboard general
// ---------------------------------------------------------------------------

export interface ResumenDashboard {
  negociosActivos: number;
  negociosTotales: number;
  clicksDelMes: ConteosPorTipo;
  masVistos: { negocio_id: string; nombre: string; slug: string; vistas: number }[];
  resenasPendientes: {
    id: string;
    nombre_autor: string;
    calificacion: number;
    comentario: string | null;
    negocio_nombre: string;
    created_at: string;
  }[];
  totalPendientes: number;
}

export async function resumenDashboard(): Promise<ResumenDashboard | null> {
  const supabase = clienteServicio();
  if (!supabase) return null;

  const desde = inicioMesBogota().toISOString();

  const [activos, totales, clicks, pendientes] = await Promise.all([
    supabase
      .from("negocios")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
    supabase.from("negocios").select("id", { count: "exact", head: true }),
    supabase
      .from("clicks")
      .select("tipo, negocio_id")
      .gte("created_at", desde)
      .limit(50000),
    supabase
      .from("resenas")
      .select("id, nombre_autor, calificacion, comentario, created_at, negocio:negocios(nombre)")
      .eq("aprobada", false)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const filasClicks = (clicks.data ?? []) as {
    tipo: TipoClick;
    negocio_id: string;
  }[];

  // Top de negocios por vistas del mes.
  const vistasPorNegocio = new Map<string, number>();
  for (const fila of filasClicks) {
    if (fila.tipo !== "vista_ficha") continue;
    vistasPorNegocio.set(
      fila.negocio_id,
      (vistasPorNegocio.get(fila.negocio_id) ?? 0) + 1,
    );
  }
  const topIds = [...vistasPorNegocio.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let masVistos: ResumenDashboard["masVistos"] = [];
  if (topIds.length > 0) {
    const { data: nombres } = await supabase
      .from("negocios")
      .select("id, nombre, slug")
      .in("id", topIds);
    masVistos = topIds.map((id) => {
      const negocio = nombres?.find((n) => n.id === id);
      return {
        negocio_id: id,
        nombre: negocio?.nombre ?? "(eliminado)",
        slug: negocio?.slug ?? "",
        vistas: vistasPorNegocio.get(id) ?? 0,
      };
    });
  }

  const filasPendientes = (pendientes.data ?? []) as unknown as {
    id: string;
    nombre_autor: string;
    calificacion: number;
    comentario: string | null;
    created_at: string;
    negocio: { nombre: string } | null;
  }[];

  return {
    negociosActivos: activos.count ?? 0,
    negociosTotales: totales.count ?? 0,
    clicksDelMes: agruparPorTipo(filasClicks),
    masVistos,
    resenasPendientes: filasPendientes.slice(0, 5).map((r) => ({
      id: r.id,
      nombre_autor: r.nombre_autor,
      calificacion: r.calificacion,
      comentario: r.comentario,
      negocio_nombre: r.negocio?.nombre ?? "(eliminado)",
      created_at: r.created_at,
    })),
    totalPendientes: filasPendientes.length,
  };
}

// ---------------------------------------------------------------------------
// Estadísticas por negocio (12 semanas)
// ---------------------------------------------------------------------------

export interface SemanaClicks extends ConteosPorTipo {
  /** Etiqueta corta del inicio de semana: "23 jun". */
  semana: string;
}

export interface EstadisticasNegocio {
  delMes: ConteosPorTipo;
  etiquetaMes: string;
  porSemana: SemanaClicks[];
}

const MS_SEMANA = 7 * 24 * 60 * 60 * 1000;

export async function estadisticasNegocio(
  negocioId: string,
  semanas = 12,
): Promise<EstadisticasNegocio | null> {
  const supabase = clienteServicio();
  if (!supabase) return null;

  const ahora = new Date();
  const inicioVentana = new Date(ahora.getTime() - semanas * MS_SEMANA);

  const { data, error } = await supabase
    .from("clicks")
    .select("tipo, created_at")
    .eq("negocio_id", negocioId)
    .gte("created_at", inicioVentana.toISOString())
    .limit(50000);
  if (error) {
    console.error("[estadisticas] estadisticasNegocio:", error.message);
    return null;
  }

  const filas = (data ?? []) as { tipo: TipoClick; created_at: string }[];

  // Cubetas semanales: la última termina "ahora".
  const porSemana: SemanaClicks[] = Array.from({ length: semanas }, (_, i) => {
    const inicio = new Date(
      ahora.getTime() - (semanas - i) * MS_SEMANA,
    );
    return {
      semana: new Intl.DateTimeFormat("es-CO", {
        timeZone: siteConfig.zonaHoraria,
        day: "numeric",
        month: "short",
      }).format(inicio),
      ...CONTEOS_VACIOS,
    };
  });

  for (const fila of filas) {
    const t = new Date(fila.created_at).getTime();
    const indice = Math.floor(
      (t - (ahora.getTime() - semanas * MS_SEMANA)) / MS_SEMANA,
    );
    const cubeta = porSemana[Math.min(Math.max(indice, 0), semanas - 1)];
    if (cubeta) cubeta[fila.tipo] += 1;
  }

  const desdeMes = inicioMesBogota().getTime();
  const delMes = agruparPorTipo(
    filas.filter((f) => new Date(f.created_at).getTime() >= desdeMes),
  );

  return { delMes, etiquetaMes: etiquetaMesBogota(), porSemana };
}
