/**
 * Pone foto de portada a los negocios de ejemplo que no tengan, usando
 * Openverse (API libre, sin llave, imágenes de uso comercial). Prueba varios
 * resultados por negocio por si alguna URL falla. Idempotente: solo toca los
 * que tienen foto_portada_url NULL.
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Faltan envs de Supabase"); process.exit(1); }
const supabase = createClient(URL, KEY);
const BUCKET = "negocios";
const UA = "Mozilla/5.0 (WebconstruyeDirectorio; +https://directorio.webconstruye.com)";

const QUERY_POR_SLUG = {
  "la-cazuela-de-la-38": "restaurant food table",
  "panaderia-la-espiga-dorada": "bakery bread shop",
  "drogueria-la-economia": "pharmacy drugstore",
  "peluqueria-estilo-y-color": "hair salon",
  "barberia-el-patron": "barber shop",
  "ferreteria-tornillos-y-tuercas": "hardware store tools",
  "papeleria-el-estudiante": "stationery office supplies",
  "odontologia-sonrisa-sana": "dentist dental clinic",
  "veterinaria-huellitas": "veterinary dog cat",
  "taller-el-mono-motos": "motorcycle mechanic workshop",
  "perro-loco-express": "hamburger fast food",
  "cafe-de-la-esquina": "coffee shop cafe",
  "supermercado-el-vecino": "supermarket grocery",
  "tienda-dona-rosa": "grocery corner store",
  "miscelanea-el-detalle": "gift shop stationery",
  "optica-vision-clara": "eyeglasses optical store",
  "tecnocel-kennedy": "smartphone mobile phone",
  "modas-valentina": "clothing store fashion",
  "calzado-el-paso": "shoes footwear store",
  "gimnasio-fuerza-total": "gym fitness weights",
  "lavanderia-burbujas": "laundry washing machine",
  "floristeria-jardin-de-rosas": "flower shop bouquet",
  "inmobiliaria-casa-propia": "real estate house keys",
  "asesorias-contables-jc": "office desk accounting",
  "licoreria-la-30": "wine liquor bottles store",
  "cerrajeria-24-horas": "keys locksmith lock",
  "areperias-el-maiz": "corn cakes grilled food",
  "agropecuaria-el-campo": "agriculture farm field",
  "latoneria-y-pintura-el-retoque": "car garage workshop",
  "punto-de-pago-el-vecino": "cash money counter shop",
  "servicio-tecnico-electrohogar": "appliance repair tools",
  "fumigaciones-el-escudo": "cleaning service worker",
  "ortopedia-bienestar": "wheelchair",
};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function candidatos(query) {
  const params = new URLSearchParams({
    q: query, license_type: "commercial", category: "photograph",
    page_size: "20",
  });
  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const data = await res.json();
  // Prioriza el proxy de miniatura de Openverse (siempre sirve la imagen);
  // luego la URL directa del proveedor como alternativa de mayor resolución.
  return (data.results ?? []).flatMap((r) => {
    const urls = [];
    if (r.id) urls.push(`https://api.openverse.org/v1/images/${r.id}/thumb/`);
    if (r.url) urls.push(r.url);
    if (r.thumbnail) urls.push(r.thumbnail);
    return urls;
  });
}

async function intentarSubir(slug, urls) {
  for (const u of urls.slice(0, 8)) {
    try {
      const res = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 4000) continue; // demasiado pequeña, casi seguro rota
      const webp = await sharp(buf).resize(1280, 800, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
      const ruta = `portadas/${slug}.webp`;
      const { error } = await supabase.storage.from(BUCKET).upload(ruta, webp, { contentType: "image/webp", upsert: true });
      if (error) throw new Error(error.message);
      return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
    } catch { /* siguiente candidato */ }
  }
  return null;
}

async function main() {
  const { data: faltantes } = await supabase
    .from("negocios")
    .select("slug, categoria:categorias(nombre)")
    .eq("es_ejemplo", true)
    .is("foto_portada_url", null)
    .order("slug");
  console.log(`${faltantes?.length ?? 0} negocios sin foto`);
  let ok = 0;
  for (const n of faltantes ?? []) {
    const query = QUERY_POR_SLUG[n.slug] ?? `${n.categoria?.nombre} store`;
    try {
      const urls = await candidatos(query);
      const publicUrl = await intentarSubir(n.slug, urls);
      if (!publicUrl) { console.error(`✗ ${n.slug}: ningún candidato sirvió`); continue; }
      const { error } = await supabase.from("negocios").update({ foto_portada_url: publicUrl }).eq("slug", n.slug);
      if (error) throw new Error(error.message);
      ok++;
      console.log(`✓ ${n.slug}`);
    } catch (e) { console.error(`✗ ${n.slug}: ${e.message}`); }
    await dormir(1200);
  }
  console.log(`Listo. ${ok}/${faltantes?.length ?? 0} con foto nueva.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
