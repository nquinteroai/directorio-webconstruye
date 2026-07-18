/**
 * Rehace la foto de portada de TODOS los negocios de ejemplo usando Pexels
 * (stock profesional, relevante). Reemplaza las fotos ruidosas de Openverse.
 * Cache-busting con ?v= para que Next/Image y el navegador tomen la nueva.
 *
 * Uso: PEXELS_API_KEY=... NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/fotos-pexels.mjs [solo-faltantes]
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const PEXELS = process.env.PEXELS_API_KEY;
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!PEXELS || !URL || !KEY) { console.error("Faltan envs"); process.exit(1); }
const supabase = createClient(URL, KEY);
const BUCKET = "negocios";
const SOLO_FALTANTES = process.argv.includes("solo-faltantes");

const Q = {
  restaurantes:"colombian restaurant food", "comidas-rapidas":"fast food burger", panaderias:"bakery bread shop",
  cafes:"coffee shop cafe interior", supermercados:"supermarket grocery aisle", tiendas:"convenience store shop",
  droguerias:"pharmacy drugstore", "peluquerias-y-barberias":"barber hair salon", ferreterias:"hardware store tools",
  papelerias:"stationery office supplies store", miscelaneas:"variety store shop", odontologias:"dentist dental clinic",
  opticas:"optical eyewear glasses store", veterinarias:"veterinary clinic pet", talleres:"car mechanic workshop",
  "tecnologia-y-celulares":"cellphone mobile phone store", ropa:"clothing store boutique", calzado:"shoe store footwear",
  gimnasios:"gym fitness", lavanderias:"laundromat laundry", floristerias:"flower shop florist",
  inmobiliarias:"real estate office", "contadores-y-abogados":"accounting office desk", licorerias:"liquor store bottles",
  otros:"local shop store",
  asaderos:"roast chicken grill", areperias:"grilled corn cakes food", pizzerias:"pizzeria pizza",
  heladerias:"ice cream shop", queserias:"cheese dairy shop", "materiales-construccion":"construction materials",
  muebles:"furniture store", colchones:"mattress bed store", vidrieria:"glass mirror shop",
  telas:"fabric textile store", cacharrerias:"household goods variety store", viveros:"plant nursery garden center",
  agropecuarios:"farm supply feed store", perfumerias:"perfume cosmetics store", relojerias:"wristwatch watch shop",
  bisuterias:"jewelry accessories store", "distribuidoras-belleza":"beauty cosmetics store", sastrerias:"tailor sewing",
  uniformes:"school uniform clothing", maletas:"luggage suitcase store", "ropa-deportiva":"sportswear athletic store",
  "ropa-infantil":"children kids clothing store", "ropa-segunda":"thrift clothing store", montallantas:"tire shop garage",
  latonerias:"auto body car paint shop", concesionarios:"motorcycle dealership", repuestos:"auto parts store",
  chatarrerias:"scrap metal recycling", "corresponsal-bancario":"money transfer store", compraventa:"pawn shop",
  cerrajerias:"locksmith keys", "tramites-gestoria":"office documents desk", "servicio-tecnico":"appliance repair technician",
  fumigacion:"pest control exterminator", "alquiler-lavadoras":"washing machine", "alquiler-disfraces":"costume shop",
  remontadoras:"shoe repair cobbler", publicidad:"printing signage shop", "estudios-fotograficos":"photography studio",
  mayoristas:"wholesale warehouse boxes", "laboratorios-clinicos":"medical laboratory", fisioterapia:"physiotherapy physical therapy",
  ortopedia:"wheelchair orthopedic medical", "jardines-infantiles":"kindergarten preschool children", colegios:"school classroom students",
  universidades:"university campus students", "academias-idiomas":"language class classroom", "institutos-tecnicos":"training class students",
  "escuelas-conduccion":"driving school car lesson", "academias-baile":"dance studio class", parqueaderos:"parking lot cars",
  billares:"billiard pool table", "canchas-sinteticas":"soccer field turf", "salones-eventos":"event hall party",
  "agencias-viajes":"travel agency", tatuajes:"tattoo studio artist", funerarias:"funeral flowers white",
  iglesias:"church interior", constructoras:"construction site building", "sex-shop":"lingerie boutique",
};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
// Cuántas veces se ha usado cada query en esta corrida: el 1er negocio de una
// categoría toma el mejor resultado (índice 0), el 2º el siguiente, etc. Así el
// resultado más relevante gana y dos negocios de la misma categoría no repiten.
const usos = new Map();

async function buscar(query, intentos = 4) {
  for (let i = 0; i < intentos; i++) {
    const p = new URLSearchParams({ query, per_page: "15", orientation: "landscape" });
    const res = await fetch(`https://api.pexels.com/v1/search?${p}`, { headers: { Authorization: PEXELS } });
    if (res.ok) return (await res.json()).photos ?? [];
    await dormir(2500 * (i + 1));
  }
  throw new Error(`Pexels agotó reintentos: "${query}"`);
}

async function subir(slug, foto) {
  const res = await fetch(foto.src.large2x ?? foto.src.large, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`descarga ${res.status}`);
  const webp = await sharp(Buffer.from(await res.arrayBuffer())).resize(1280, 800, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
  const ruta = `portadas/${slug}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`upload ${error.message}`);
  const base = supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
  return `${base}?v=${Date.now()}`; // cache-bust
}

async function main() {
  let q = supabase.from("negocios").select("slug, categoria:categorias(slug, nombre)").eq("es_ejemplo", true).eq("activo", true);
  if (SOLO_FALTANTES) q = q.is("foto_portada_url", null);
  const { data: negs } = await q.order("slug");
  console.log(`${negs?.length ?? 0} negocios a procesar${SOLO_FALTANTES ? " (solo faltantes)" : ""}`);
  let ok = 0, fail = 0;
  for (const n of negs ?? []) {
    const cat = n.categoria?.slug;
    const query = Q[cat] ?? `${n.categoria?.nombre ?? "store"} shop`;
    try {
      const fotos = await buscar(query);
      const cand = fotos.filter((p) => p.width >= 1200);
      const lista = cand.length ? cand : fotos;
      if (!lista.length) { console.error(`✗ ${n.slug}: sin resultados`); fail++; continue; }
      const k = usos.get(query) ?? 0; usos.set(query, k + 1);
      const foto = lista[Math.min(k, lista.length - 1)]; // mejor resultado primero
      const url = await subir(n.slug, foto);
      const { error } = await supabase.from("negocios").update({ foto_portada_url: url }).eq("slug", n.slug);
      if (error) throw new Error(error.message);
      ok++; console.log(`✓ ${n.slug} (${cat})`);
    } catch (e) { console.error(`✗ ${n.slug}: ${e.message}`); fail++; }
    await dormir(1400);
  }
  console.log(`Listo. OK ${ok}, fallos ${fail}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
