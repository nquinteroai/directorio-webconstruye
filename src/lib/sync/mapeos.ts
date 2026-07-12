/**
 * Mapeos estáticos entre las taxonomías de los tres sistemas.
 *
 * · Sector de Fábrica de Demos (26, tabla `demo_sectores`) → slug de
 *   categoría del Directorio (25, tabla `categorias`).
 * · Zona del CRM (config/zonas.ts de webconstruye-ventas) → slug de zona.
 * · Tier vendido (CRM) → plan del Directorio.
 *
 * Si el seed de categorías cambia, actualizar aquí y en el test
 * tests/unitarias/sync-mapeos.test.ts.
 */

import { normalizarTexto } from "./normalizar";
import type { PlanNegocio } from "@/types/database";

export const SECTOR_A_CATEGORIA: Record<string, string> = {
  panaderia: "panaderias",
  restaurante: "restaurantes",
  peluqueria: "peluquerias-y-barberias",
  ropa: "ropa",
  ferreteria: "ferreterias",
  drogueria: "droguerias",
  muebles: "otros",
  zapateria: "calzado",
  supermercado: "supermercados",
  fruver: "tiendas",
  joyeria: "otros",
  mascotas: "tiendas",
  papeleria: "papelerias",
  taller: "talleres",
  spa: "peluquerias-y-barberias",
  veterinaria: "veterinarias",
  gimnasio: "gimnasios",
  cafeteria: "cafes",
  odontologia: "odontologias",
  consultorio: "otros",
  variedades: "miscelaneas",
  floristeria: "floristerias",
  aseo: "miscelaneas",
  electrodomesticos: "tecnologia-y-celulares",
  "comidas-rapidas": "comidas-rapidas",
  pasteleria: "panaderias",
};

export const CATEGORIA_FALLBACK = "otros";

/** Slug de categoría del Directorio para un sector de Demos. */
export function categoriaDeSector(sectorId: string | null | undefined): string {
  if (!sectorId) return CATEGORIA_FALLBACK;
  return SECTOR_A_CATEGORIA[sectorId] ?? CATEGORIA_FALLBACK;
}

/**
 * Zona del CRM → slug de zona del Directorio. El CRM guarda el id de
 * config/zonas.ts ("kennedy" | "soacha"), pero se acepta también el nombre
 * visible ("Soacha · Mercurio") por robustez.
 */
export function zonaDeCrm(zona: string | null | undefined): string | null {
  if (!zona) return null;
  const n = normalizarTexto(zona);
  if (n.includes("kennedy")) return "kennedy";
  if (n.includes("soacha")) return "soacha";
  return null;
}

/** Tiers que el vendedor elige en el CRM al marcar la venta. */
export const TIERS_VENTA = ["basico", "profesional", "pro"] as const;
export type TierVenta = (typeof TIERS_VENTA)[number];

const TIER_A_PLAN: Record<TierVenta, PlanNegocio> = {
  basico: "web",
  profesional: "mantenimiento",
  pro: "premium",
};

/** Tier vendido → plan del Directorio (enum `negocios.plan`). */
export function planDeTier(tier: TierVenta): PlanNegocio {
  return TIER_A_PLAN[tier];
}
