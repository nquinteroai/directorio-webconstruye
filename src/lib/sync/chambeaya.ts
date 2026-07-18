import "server-only";

/**
 * slug de categoría del Directorio → id(s) de categoría en Chambeaya.
 * Los ids DEBEN coincidir con lib/content/categorias.ts de Chambeaya.
 * Solo las categorías elegibles (servicio a domicilio o puro-servicio) están aquí;
 * lo que no esté en el mapa no se reenvía a Chambeaya.
 */
export const MAPA_CHAMBEAYA: Record<string, string[]> = {
  cerrajerias: ["cerrajeria"],
  "servicio-tecnico": ["electrodomesticos"],
  sastrerias: ["costura"],
  constructoras: ["construccion"],
  "peluquerias-y-barberias": ["belleza"],
  fumigacion: ["fumigacion"],
  vidrieria: ["vidrieria"],
  lavanderias: ["lavanderia"],
  "alquiler-lavadoras": ["alquiler-lavadoras"],
  chatarrerias: ["reciclaje"],
  montallantas: ["montallantas"],
  talleres: ["mecanico"],
  veterinarias: ["veterinario"],
  fisioterapia: ["fisioterapia"],
  "laboratorios-clinicos": ["toma-muestras"],
  "estudios-fotograficos": ["fotografia"],
  "tramites-gestoria": ["tramites"],
  publicidad: ["publicidad"],
  contadores: ["contador"],
  abogados: ["abogado"],
};

/** Normaliza a 57 + 10 dígitos; devuelve null si ningún candidato es un celular CO válido. */
export function normalizarTelefonoCo(
  ...candidatos: (string | null | undefined)[]
): string | null {
  for (const candidato of candidatos) {
    if (!candidato) continue;
    const digitos = candidato.replace(/\D/g, "");
    const con57 = digitos.length === 10 ? `57${digitos}` : digitos;
    if (/^57\d{10}$/.test(con57)) return con57;
  }
  return null;
}

/**
 * Reenvía un negocio recién publicado a Chambeaya (fire-and-forget desde el
 * llamador). Apagada sin CHAMBEAYA_SYNC_URL/KEY. Nunca lanza: devuelve el motivo.
 */
export async function reenviarAChambeaya(datos: {
  eventoId: string;
  nombre: string;
  telefono: string | null;
  categoriaSlug: string;
  zonaChambeaya: string;
  ventaFecha: string;
}): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const url = process.env.CHAMBEAYA_SYNC_URL;
  const key = process.env.CHAMBEAYA_SYNC_KEY;
  if (!url || !key) return { ok: false, motivo: "chambeaya sync apagado (sin env)" };

  const categorias = MAPA_CHAMBEAYA[datos.categoriaSlug];
  if (!categorias) return { ok: false, motivo: `categoria no elegible: ${datos.categoriaSlug}` };
  if (!datos.telefono) return { ok: false, motivo: "sin telefono valido para Chambeaya" };

  try {
    // Timeout de 3s: el reenvío no debe demorar el webhook del CRM (pg_net corta ~5s).
    const res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(3000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        evento_id: datos.eventoId,
        nombre: datos.nombre,
        telefono: datos.telefono,
        categorias,
        zona: datos.zonaChambeaya,
        venta_fecha: datos.ventaFecha,
      }),
    });
    if (!res.ok) return { ok: false, motivo: `chambeaya respondió ${res.status}` };
    return { ok: true };
  } catch (e) {
    // Mapea TimeoutError a motivo legible.
    if (e instanceof Error && e.name === "TimeoutError") {
      return { ok: false, motivo: "timeout hacia Chambeaya (3s)" };
    }
    return { ok: false, motivo: e instanceof Error ? e.message : String(e) };
  }
}
