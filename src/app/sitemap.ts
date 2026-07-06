import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { clientePublico } from "@/lib/supabase/publico";
import { obtenerCombinacionesActivas } from "@/lib/queries/negocios";
import { obtenerZonas } from "@/lib/queries/zonas";

export const revalidate = 3600;

/**
 * Sitemap dinámico: estáticas + zonas + combinaciones zona×categoría con
 * negocios + todas las fichas activas (con su fecha real de actualización).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const estaticas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/categorias`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const supabase = clientePublico();
  if (!supabase) return estaticas;

  const [zonas, combinaciones, { data: negocios }] = await Promise.all([
    obtenerZonas(),
    obtenerCombinacionesActivas(),
    supabase
      .from("negocios")
      .select("slug, updated_at")
      .eq("activo", true)
      .limit(5000),
  ]);

  return [
    ...estaticas,
    ...zonas.map((zona) => ({
      url: `${base}/${zona.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...combinaciones.map((combo) => ({
      url: `${base}/${combo.zona.slug}/${combo.categoria.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(negocios ?? []).map((negocio) => ({
      url: `${base}/negocio/${negocio.slug}`,
      lastModified: new Date(negocio.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
