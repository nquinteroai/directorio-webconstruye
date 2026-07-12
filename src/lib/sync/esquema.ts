/**
 * Contrato del webhook CRM → Directorio (POST /api/internal/businesses).
 * Debe coincidir con el payload que arma el trigger de webconstruye-ventas
 * (supabase/migraciones/…-webhook-directorio.sql en ese repo).
 */

import { z } from "zod";
import { TIERS_VENTA } from "./mapeos";

export const esquemaSyncVenta = z.object({
  /** id de la fila de `visitas` en el CRM: clave de idempotencia. */
  evento_id: z.uuid(),
  origen: z.literal("webconstruye-ventas"),
  negocio: z.object({
    /** id de OpenStreetMap ("node/123…"): id externo estable del CRM. */
    osm_id: z.string().min(1).max(60),
    nombre: z.string().trim().min(2).max(120),
    /** Valor crudo de OSM; solo informativo (la categoría sale del demo). */
    categoria_osm: z.string().max(80).nullish(),
    lat: z.number().min(-4.5).max(13.5),
    lng: z.number().min(-82).max(-66),
    direccion: z.string().max(200).nullish(),
    telefono: z.string().max(20).nullish(),
    zona: z.string().min(1).max(60),
  }),
  venta: z.object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    monto_setup: z.number().nonnegative(),
    monto_mensual: z.number().nonnegative(),
    tier: z.enum(TIERS_VENTA),
  }),
});

export type PayloadSyncVenta = z.infer<typeof esquemaSyncVenta>;
