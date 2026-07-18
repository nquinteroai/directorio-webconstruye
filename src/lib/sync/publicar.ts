import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, NegocioInsert } from "@/types/database";
import { generarSlug } from "@/lib/utils/slug";
import {
  esMatchConfiable,
  rankearCandidatos,
  UMBRAL_PUBLICACION,
  type CandidatoMatch,
} from "./match";
import { categoriaDeSector, planDeTier, zonaDeCrm } from "./mapeos";
import {
  generarDescripcionCorta,
  generarDescripcionLarga,
} from "./descripciones";
import type { PayloadSyncVenta } from "./esquema";
import { reenviarAChambeaya, normalizarTelefonoCo } from "./chambeaya";

type Supabase = SupabaseClient<Database>;

const RE_WHATSAPP = /^57[0-9]{10}$/;
const BUCKET_DEMOS = "demo-fachadas";
const BUCKET_NEGOCIOS = "negocios";

export interface ResultadoPublicacion {
  resultado: "publicado" | "sin_match" | "duplicado" | "error";
  negocioId?: string;
  slug?: string;
  detalle?: Json;
}

/**
 * Procesa una venta reportada por el CRM: dedupe contra negocios ya
 * publicados, match contra demo_negocios (única fuente de foto/WhatsApp/
 * sector), y si el match supera el umbral, crea el listado publicado.
 * El llamador (route handler) es dueño de la idempotencia en sync_eventos.
 */
export async function publicarVenta(
  supabase: Supabase,
  payload: PayloadSyncVenta,
): Promise<ResultadoPublicacion> {
  const crm = {
    nombre: payload.negocio.nombre,
    direccion: payload.negocio.direccion,
    telefono: payload.negocio.telefono,
    lat: payload.negocio.lat,
    lng: payload.negocio.lng,
  };

  // 1. Zona del Directorio.
  const zonaSlug = zonaDeCrm(payload.negocio.zona);
  if (!zonaSlug) {
    return {
      resultado: "error",
      detalle: { motivo: `Zona desconocida: ${payload.negocio.zona}` },
    };
  }
  const { data: zona, error: errZona } = await supabase
    .from("zonas")
    .select("id, nombre, ciudad")
    .eq("slug", zonaSlug)
    .maybeSingle();
  if (errZona || !zona) {
    return {
      resultado: "error",
      detalle: { motivo: `Zona '${zonaSlug}' no existe en el Directorio.` },
    };
  }

  // 2. Dedupe: ¿ya hay un negocio publicado que es claramente el mismo?
  const { data: existentes } = await supabase
    .from("negocios")
    .select("id, slug, nombre, direccion, telefono, whatsapp, lat, lng")
    .eq("zona_id", zona.id);
  const duplicado = rankearCandidatos(crm, (existentes ?? []) as CandidatoMatch[])[0];
  if (duplicado && esMatchConfiable(duplicado)) {
    return {
      resultado: "duplicado",
      negocioId: duplicado.id,
      detalle: { match: duplicado } as unknown as Json,
    };
  }

  // 3. Match contra los demos (única fuente de enriquecimiento).
  const { data: demos, error: errDemos } = await supabase
    .from("demo_negocios")
    .select(
      "id, slug, nombre, sector_id, telefono, whatsapp, direccion, ciudad, zona, latitud, longitud, foto_fachada_url, logo_url, estado",
    );
  if (errDemos) {
    return { resultado: "error", detalle: { motivo: errDemos.message } };
  }
  const ranking = rankearCandidatos(
    crm,
    (demos ?? []).map((d) => ({
      id: d.id,
      nombre: d.nombre,
      direccion: d.direccion,
      telefono: d.telefono,
      whatsapp: d.whatsapp,
      lat: d.latitud,
      lng: d.longitud,
    })),
  );
  const mejor = ranking[0];
  if (!mejor || !esMatchConfiable(mejor)) {
    return {
      resultado: "sin_match",
      detalle: {
        umbral: UMBRAL_PUBLICACION,
        candidatos: ranking.slice(0, 3),
      } as unknown as Json,
    };
  }
  const demo = (demos ?? []).find((d) => d.id === mejor.id)!;

  // 4. Categoría desde el sector del demo.
  const categoriaSlug = categoriaDeSector(demo.sector_id);
  const { data: categoria } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("slug", categoriaSlug)
    .maybeSingle();
  if (!categoria) {
    return {
      resultado: "error",
      detalle: { motivo: `Categoría '${categoriaSlug}' no existe en el seed.` },
    };
  }

  // 5. Slug único.
  const slug = await slugDisponible(supabase, generarSlug(demo.nombre));

  // 6. Fotos: copiar del bucket de demos al de negocios (mejor esfuerzo:
  //    una foto fallida no bloquea la publicación del cliente).
  const avisos: string[] = [];
  const fotoPortada = await copiarFoto(
    supabase,
    demo.foto_fachada_url,
    `portadas/${slug}.webp`,
    avisos,
  );
  const logo = await copiarFoto(
    supabase,
    demo.logo_url,
    `logos/${slug}.webp`,
    avisos,
  );

  // 7. Insertar el listado. Datos del demo primero (los capturó el vendedor
  //    frente al negocio); el CRM completa lo que falte.
  const textos = {
    nombre: demo.nombre,
    categoriaNombre: categoria.nombre,
    zonaNombre: zona.nombre,
    ciudad: zona.ciudad,
    direccion: demo.direccion || payload.negocio.direccion || "",
    barrio: demo.zona,
  };
  const registro: NegocioInsert = {
    slug,
    nombre: demo.nombre,
    categoria_id: categoria.id,
    zona_id: zona.id,
    descripcion_corta: generarDescripcionCorta(textos),
    descripcion_larga: generarDescripcionLarga(textos),
    direccion: textos.direccion,
    barrio: demo.zona ?? null,
    lat: demo.latitud ?? payload.negocio.lat,
    lng: demo.longitud ?? payload.negocio.lng,
    telefono: demo.telefono ?? payload.negocio.telefono ?? null,
    whatsapp: demo.whatsapp && RE_WHATSAPP.test(demo.whatsapp) ? demo.whatsapp : null,
    horarios: {},
    logo_url: logo,
    foto_portada_url: fotoPortada,
    palabras_clave: [categoria.nombre.toLowerCase(), zona.nombre.toLowerCase()],
    plan: planDeTier(payload.venta.tier),
    fecha_ingreso: payload.venta.fecha,
    verificado: true,
    es_ejemplo: false,
    activo: true,
  };
  const { data: creado, error: errInsert } = await supabase
    .from("negocios")
    .insert(registro)
    .select("id, slug")
    .single();
  if (errInsert || !creado) {
    return {
      resultado: "error",
      detalle: { motivo: errInsert?.message ?? "INSERT sin fila devuelta" },
    };
  }

  // Reenvío a Chambeaya (best-effort): si la categoría es elegible y hay
  // teléfono, registra el negocio como trabajador pendiente en Chambeaya.
  const zonaChambeaya = zona.ciudad.toLowerCase().includes("soacha")
    ? "soacha"
    : "bogota";
  const telefonoChambeaya = normalizarTelefonoCo(registro.whatsapp, registro.telefono);
  const reenvio = await reenviarAChambeaya({
    eventoId: payload.evento_id,
    nombre: registro.nombre,
    telefono: telefonoChambeaya,
    categoriaSlug,
    zonaChambeaya,
    ventaFecha: payload.venta.fecha,
  });

  return {
    resultado: "publicado",
    negocioId: creado.id,
    slug: creado.slug,
    detalle: {
      match: mejor,
      demo_id: demo.id,
      avisos: avisos.length ? avisos : undefined,
      chambeaya: reenvio.ok ? "reenviado" : reenvio.motivo,
    } as unknown as Json,
  };
}

/** Devuelve el slug base o la primera variante -2, -3… que esté libre. */
async function slugDisponible(supabase: Supabase, base: string): Promise<string> {
  const { data } = await supabase
    .from("negocios")
    .select("slug")
    .like("slug", `${base}%`);
  const ocupados = new Set((data ?? []).map((n) => n.slug));
  if (!ocupados.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    if (!ocupados.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Copia una imagen del bucket público de demos al bucket del directorio.
 * Devuelve la URL pública nueva, o null si no había foto o falló la copia
 * (el fallo se anota en `avisos` para el detalle del evento).
 */
async function copiarFoto(
  supabase: Supabase,
  urlOrigen: string | null,
  rutaDestino: string,
  avisos: string[],
): Promise<string | null> {
  if (!urlOrigen) return null;
  const marcador = `/object/public/${BUCKET_DEMOS}/`;
  const posicion = urlOrigen.indexOf(marcador);
  if (posicion === -1) {
    avisos.push(`URL de foto fuera del bucket de demos: ${urlOrigen}`);
    return null;
  }
  const rutaOrigen = decodeURIComponent(urlOrigen.slice(posicion + marcador.length));
  const { data: archivo, error: errDescarga } = await supabase.storage
    .from(BUCKET_DEMOS)
    .download(rutaOrigen);
  if (errDescarga || !archivo) {
    avisos.push(`No se pudo descargar ${rutaOrigen}: ${errDescarga?.message}`);
    return null;
  }
  const { error: errSubida } = await supabase.storage
    .from(BUCKET_NEGOCIOS)
    .upload(rutaDestino, archivo, { contentType: "image/webp", upsert: true });
  if (errSubida) {
    avisos.push(`No se pudo subir ${rutaDestino}: ${errSubida.message}`);
    return null;
  }
  return supabase.storage.from(BUCKET_NEGOCIOS).getPublicUrl(rutaDestino).data
    .publicUrl;
}
