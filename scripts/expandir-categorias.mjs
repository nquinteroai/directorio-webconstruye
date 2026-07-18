/**
 * Crea las categorías nuevas del directorio (una por ítem de la lista de Nelson,
 * ignorando las que ya existían) y para cada una un negocio de EJEMPLO con foto
 * de Openverse (uso comercial, sin llave). Idempotente: upsert por slug; si la
 * foto falla queda NULL y se puede reintentar con scripts/fotos-openverse.mjs.
 *
 * Uso: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/expandir-categorias.mjs
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Faltan envs de Supabase"); process.exit(1); }
const supabase = createClient(URL, KEY);
const BUCKET = "negocios";
const UA = "Mozilla/5.0 (WebconstruyeDirectorio; +https://directorio.webconstruye.com)";
const ORDEN_BASE = 25;

const H_COM = { lun:{abre:"08:00",cierra:"18:00"},mar:{abre:"08:00",cierra:"18:00"},mie:{abre:"08:00",cierra:"18:00"},jue:{abre:"08:00",cierra:"18:00"},vie:{abre:"08:00",cierra:"18:00"},sab:{abre:"09:00",cierra:"16:00"} };
const H_FOOD = { lun:{abre:"11:00",cierra:"22:00"},mar:{abre:"11:00",cierra:"22:00"},mie:{abre:"11:00",cierra:"22:00"},jue:{abre:"11:00",cierra:"22:00"},vie:{abre:"11:00",cierra:"23:00"},sab:{abre:"11:00",cierra:"23:00"},dom:{abre:"12:00",cierra:"21:00"} };

const BARRIOS_K = ["Kennedy Central","Timiza","Castilla","Patio Bonito","Banderas","Class","Tintal","Américas"];
const BARRIOS_S = ["Soacha Centro","San Mateo","León XIII","Compartir","Ciudad Verde","La Despensa"];

// slug, nombre categoría, icono, negocio, corta, servicios, query, comida?
const DEFS = [
  ["asaderos","Asaderos","Drumstick","Asadero El Buen Pollo","Pollo asado y broaster con papa, arepa y ensalada. Combos familiares y domicilios.",["Pollo asado","Broaster","Combos familiares","Domicilios"],"roast chicken restaurant",true],
  ["areperias","Areperías","CookingPot","Areperías El Maíz","Arepas rellenas, de chócolo y con todo. Desayunos y onces a la plancha.",["Arepas rellenas","Arepa de chócolo","Desayunos","Bebidas"],"arepa grilled corn food",true],
  ["pizzerias","Pizzerías","Pizza","Pizzería Napoli","Pizza al horno por porciones y familiar. Pasta, lasaña y domicilios en la zona.",["Pizza familiar","Por porciones","Pasta","Domicilios"],"pizzeria pizza",true],
  ["heladerias","Heladerías","IceCreamCone","Heladería Polo Norte","Helados, malteadas, conos y postres fríos. El antojo dulce del barrio.",["Helados","Malteadas","Conos","Postres"],"ice cream shop",true],
  ["queserias","Queserías","Milk","Quesería La Vaca Feliz","Quesos frescos, cuajada, kumis y yogurt campesino directo del productor.",["Queso fresco","Cuajada","Kumis","Yogurt"],"cheese shop dairy",false],
  ["materiales-construccion","Materiales de construcción","HardHat","Depósito La Roca","Cemento, arena, ladrillo, varilla y todo para su obra. Despacho a domicilio.",["Cemento","Agregados","Ladrillo","Despachos"],"construction materials warehouse",false],
  ["muebles","Muebles","Sofa","Muebles El Roble","Salas, comedores, camas y muebles a la medida. Financiación y domicilio.",["Salas","Comedores","Camas","A la medida"],"furniture store",false],
  ["colchones","Colchones","BedDouble","Colchones Descanso Real","Colchones ortopédicos, semiortopédicos y bases en todas las medidas y marcas.",["Colchones","Bases","Almohadas","Todas las medidas"],"mattress store bed",false],
  ["vidrieria","Vidriería y marquetería","Frame","Vidriería El Cristal","Vidrios, espejos, ventanería y enmarcado de cuadros con instalación a domicilio.",["Vidrios","Espejos","Marquetería","Ventanería"],"glass shop mirror",false],
  ["telas","Telas","Palette","Almacén de Telas La Aguja","Telas por metro, insumos de confección, botones y cierres al por mayor y detal.",["Telas por metro","Insumos","Botones","Cierres"],"fabric textile store",false],
  ["cacharrerias","Cacharrerías","Package","Cacharrería El Baratón","De todo a bajo precio: hogar, aseo, cocina, juguetería y variedades.",["Hogar","Aseo","Cocina","Variedades"],"variety store household goods",false],
  ["viveros","Viveros","Sprout","Vivero Verde Vida","Plantas ornamentales, materas, tierra abonada y jardinería con asesoría.",["Plantas","Materas","Abonos","Jardinería"],"plant nursery garden",false],
  ["agropecuarios","Agropecuarios","Wheat","Agropecuaria El Campo","Concentrados, alimento para animales, insumos agrícolas y veterinarios.",["Concentrados","Alimento animal","Insumos","Veterinaria"],"farm supply feed store",false],
  ["perfumerias","Perfumería y cosméticos","SprayCan","Perfumería Esencia","Perfumes originales y por decant, maquillaje y cuidado de la piel.",["Perfumes","Maquillaje","Cuidado facial","Originales"],"perfume cosmetics store",false],
  ["relojerias","Relojería","Watch","Relojería El Tiempo","Venta y reparación de relojes, cambio de pila y correa, joyería fina.",["Relojes","Reparación","Cambio de pila","Joyería"],"watch shop repair",false],
  ["bisuterias","Bisutería","Gem","Bisutería Destellos","Aretes, cadenas, pulseras y accesorios de moda al por mayor y detal.",["Aretes","Cadenas","Pulseras","Accesorios"],"jewelry accessories shop",false],
  ["distribuidoras-belleza","Distribuidora de belleza","Sparkles","Distribuidora Belleza Total","Insumos para peluquería y estética: tintes, herramientas y productos capilares.",["Tintes","Herramientas","Productos capilares","Estética"],"beauty supply store",false],
  ["sastrerias","Sastrería y arreglos","Ruler","Sastrería El Corte Fino","Arreglos de ropa, confección a la medida, bastas y cambio de cremallera.",["Arreglos","A la medida","Bastas","Cremalleras"],"tailor sewing shop",false],
  ["uniformes","Uniformes escolares","Shirt","Uniformes El Estudiante","Uniformes de colegio, sudaderas, camibusos y bordado del escudo.",["Uniformes","Sudaderas","Bordados","Escolar"],"school uniform store",false],
  ["maletas","Maletas y marroquinería","Luggage","Almacén de Maletas El Viajero","Maletas, morrales, bolsos y artículos de viaje de marca y con garantía.",["Maletas","Morrales","Bolsos","Viaje"],"luggage bags store",false],
  ["ropa-deportiva","Ropa deportiva","Dumbbell","Deportivos La Cancha","Ropa y calzado deportivo, camisetas de equipos y accesorios fitness.",["Ropa deportiva","Tenis","Camisetas","Accesorios"],"sportswear store",false],
  ["ropa-infantil","Ropa infantil","Baby","Ropa Infantil Pequeñines","Ropa para bebé y niños, conjuntos, pañaleras y accesorios.",["Ropa de bebé","Ropa de niños","Conjuntos","Accesorios"],"children clothing store",false],
  ["ropa-segunda","Ropa de segunda","Shirt","Ropa Americana El Bazar","Ropa americana y de segunda seleccionada, en buen estado y a buen precio.",["Ropa americana","Por prendas","Por pacas","Novedades"],"thrift clothing store",false],
  ["montallantas","Montallantas","Disc3","Montallantas El Rápido","Cambio y reparación de llantas, alineación, balanceo y montaje. 24 horas.",["Llantas","Alineación","Balanceo","Montaje"],"tire shop garage",false],
  ["latonerias","Latonería y pintura","Car","Latonería y Pintura El Retoque","Latonería, pintura de vehículos, pulida y arreglo de golpes con garantía.",["Latonería","Pintura","Pulida","Golpes"],"auto body paint shop",false],
  ["concesionarios","Concesionario de motos","Bike","Motos del Sur","Venta de motos nuevas y usadas, financiación, trámites y taller propio.",["Motos nuevas","Usadas","Financiación","Taller"],"motorcycle dealership",false],
  ["repuestos","Repuestos de carro y moto","Cog","Repuestos El Piñón","Repuestos originales y alternos para carro y moto, lubricantes y accesorios.",["Repuestos","Lubricantes","Accesorios","Originales"],"auto parts store",false],
  ["chatarrerias","Chatarrería y reciclaje","Recycle","Chatarrería El Reciclador","Compra de chatarra, cobre, aluminio, cartón y reciclaje con pesaje justo.",["Chatarra","Metales","Reciclaje","Compra"],"scrap metal recycling",false],
  ["corresponsal-bancario","Corresponsal bancario y pagos","Banknote","Punto de Pago El Vecino","Recibos, giros, recargas, retiros y pagos de servicios. Corresponsal bancario.",["Pago de recibos","Giros","Recargas","Retiros"],"money transfer payment shop",false],
  ["compraventa","Compraventa y empeño","Coins","Compraventa El Buen Negocio","Compra, venta y empeño de celulares, electrodomésticos, oro y herramientas.",["Compra","Venta","Empeño","Avalúos"],"pawn shop",false],
  ["cerrajerias","Cerrajería","Key","Cerrajería El Candado","Apertura de puertas, copias de llaves, cambio de guardas y cerraduras. 24 horas.",["Apertura","Copias","Guardas","Urgencias"],"locksmith keys lock",false],
  ["tramites-gestoria","Trámites y gestoría","FileText","Gestoría Trámites Ya","Trámites de tránsito, notariales, Simit, pasado judicial y más, rápido y seguro.",["Tránsito","Notariales","Simit","Antecedentes"],"office paperwork documents",false],
  ["servicio-tecnico","Servicio técnico","Cpu","Servicio Técnico Electrohogar","Reparación de neveras, lavadoras, TV y electrodomésticos con domicilio y garantía.",["Neveras","Lavadoras","Televisores","Domicilio"],"appliance repair technician",false],
  ["fumigacion","Fumigación y control de plagas","Bug","Fumigaciones El Escudo","Control de plagas, cucarachas, roedores y comején, residencial y comercial.",["Fumigación","Roedores","Comején","Comercial"],"pest control spray",false],
  ["alquiler-lavadoras","Alquiler de lavadoras","WashingMachine","Alquiler de Lavadoras Doña Fabiola","Alquiler de lavadoras por día con entrega y recogida a domicilio en la zona.",["Alquiler por día","Domicilio","Entrega","Recogida"],"washing machine appliance",false],
  ["alquiler-disfraces","Alquiler de disfraces","Drama","Disfraces La Fantasía","Alquiler y venta de disfraces para toda ocasión, niños y adultos, con accesorios.",["Alquiler","Venta","Niños","Adultos"],"costume shop",false],
  ["remontadoras","Remontadora de calzado","Footprints","Remontadora El Zapatero","Reparación de calzado, medias suelas, tacones y arreglo de carteras.",["Medias suelas","Tacones","Reparación","Carteras"],"shoe repair cobbler",false],
  ["publicidad","Publicidad y avisos","Megaphone","Publicidad Impacto Visual","Avisos, pendones, vallas, tarjetas y publicidad impresa con diseño incluido.",["Avisos","Pendones","Tarjetas","Diseño"],"print shop signage",false],
  ["estudios-fotograficos","Estudio fotográfico","Camera","Foto Estudio Recuerdos","Fotos para documentos, retratos, eventos y revelado. Cuadros y enmarcado.",["Fotos de documento","Retratos","Eventos","Revelado"],"photography studio",false],
  ["mayoristas","Depósito mayorista","Warehouse","Distribuidora La Bodega","Venta al por mayor de víveres, aseo y desechables para tiendas y negocios.",["Al por mayor","Víveres","Aseo","Desechables"],"wholesale warehouse goods",false],
  ["laboratorios-clinicos","Laboratorio clínico","FlaskConical","Laboratorio Clínico Vida","Exámenes de sangre, perfiles, pruebas de embarazo y toma de muestras a domicilio.",["Exámenes de sangre","Perfiles","Domicilio","Resultados"],"medical laboratory blood test",false],
  ["fisioterapia","Fisioterapia","HeartPulse","Centro de Fisioterapia Movimiento","Rehabilitación física, terapias de dolor, deportiva y masajes con citas ágiles.",["Rehabilitación","Terapia de dolor","Deportiva","Masajes"],"physical therapy clinic",false],
  ["ortopedia","Ortopedia","Bone","Ortopedia Bienestar","Sillas de ruedas, muletas, plantillas, fajas y ayudas ortopédicas en alquiler y venta.",["Sillas de ruedas","Muletas","Plantillas","Fajas"],"orthopedic medical supplies",false],
  ["jardines-infantiles","Jardín infantil","Blocks","Jardín Infantil Mis Primeros Pasos","Educación inicial, estimulación, refuerzo y cuidado con amor y horario extendido.",["Educación inicial","Estimulación","Refuerzo","Cuidado"],"kindergarten preschool kids",false],
  ["colegios","Colegios","GraduationCap","Colegio San Marcos","Educación preescolar, primaria y bachillerato con formación integral y valores.",["Preescolar","Primaria","Bachillerato","Valores"],"school building students",false],
  ["universidades","Universidades","School","Universidad del Saber","Programas técnicos, tecnológicos y profesionales en jornada diurna y nocturna.",["Técnicos","Tecnológicos","Profesionales","Nocturno"],"university campus",false],
  ["academias-idiomas","Academia de idiomas","Languages","Academia de Inglés Speak Up","Cursos de inglés y otros idiomas en todos los niveles, presencial y virtual.",["Inglés","Todos los niveles","Presencial","Virtual"],"language school classroom",false],
  ["institutos-tecnicos","Instituto técnico","BookOpen","Instituto Técnico Progreso","Cursos técnicos de sistemas, belleza, culinaria y auxiliares con certificado.",["Cursos técnicos","Sistemas","Belleza","Certificados"],"technical institute training",false],
  ["escuelas-conduccion","Escuela de conducción","TrafficCone","Escuela de Conducción Al Volante","Cursos de conducción para carro y moto, trámite de licencia y refuerzo.",["Carro","Moto","Licencia","Refuerzo"],"driving school car",false],
  ["academias-baile","Academia de baile","Music","Academia de Baile Ritmo Latino","Clases de salsa, bachata, urbano y fitness dance para todas las edades.",["Salsa","Bachata","Urbano","Fitness"],"dance studio class",false],
  ["parqueaderos","Parqueaderos","SquareParking","Parqueadero El Central","Parqueadero para carro y moto por horas y mensualidad con vigilancia 24 horas.",["Por horas","Mensualidad","Moto","Vigilancia"],"parking lot cars",false],
  ["billares","Billares","Target","Billares El As","Mesas de billar y pool, rana, dominó y bar en ambiente familiar y seguro.",["Billar","Pool","Rana","Bar"],"billiard pool table",false],
  ["canchas-sinteticas","Canchas sintéticas","Trophy","Cancha Sintética Gol de Oro","Alquiler de canchas de fútbol 5 y 8, torneos y cumpleaños. Iluminadas.",["Fútbol 5","Fútbol 8","Torneos","Iluminadas"],"soccer field turf",false],
  ["salones-eventos","Salón de eventos","PartyPopper","Salón de Eventos La Fiesta","Alquiler de salón para grados, matrimonios y cumpleaños con sonido y decoración.",["Salón","Sonido","Decoración","Eventos"],"event party hall",false],
  ["agencias-viajes","Agencia de viajes","Plane","Agencia de Viajes Mundo Tours","Tiquetes, planes turísticos, hoteles y excursiones con financiación disponible.",["Tiquetes","Planes","Hoteles","Excursiones"],"travel agency",false],
  ["tatuajes","Estudio de tatuajes","Feather","Estudio de Tatuajes Tinta Negra","Tatuajes personalizados, piercings y retoques con bioseguridad garantizada.",["Tatuajes","Piercings","Retoques","Bioseguridad"],"tattoo studio",false],
  ["funerarias","Funerarias","Cross","Funeraria Paz Eterna","Servicios exequiales, salas de velación, cofres y planes futuros. 24 horas.",["Exequias","Salas de velación","Cofres","Planes"],"funeral home flowers",false],
  ["iglesias","Iglesias","Church","Iglesia Cristiana Nueva Vida","Comunidad de fe con servicios dominicales, grupos y apoyo a la comunidad.",["Servicios","Grupos","Oración","Comunidad"],"church building",false],
  ["constructoras","Constructoras","Building2","Constructora Cimientos","Construcción, remodelación y acabados de vivienda y locales. Presupuesto gratis.",["Construcción","Remodelación","Acabados","Presupuesto"],"construction company building",false],
  ["sex-shop","Sex-shop","Heart","Sex-Shop Placer Íntimo","Productos para adultos, juguetería y lencería con atención discreta y respetuosa.",["Adultos","Lencería","Juguetería","Discreto"],"lingerie boutique",false],
];

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function candidatos(query) {
  const params = new URLSearchParams({ q: query, license_type: "commercial", category: "photograph", page_size: "20" });
  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).flatMap((r) => {
    const u = [];
    if (r.id) u.push(`https://api.openverse.org/v1/images/${r.id}/thumb/`);
    if (r.url) u.push(r.url);
    if (r.thumbnail) u.push(r.thumbnail);
    return u;
  });
}
async function subir(slug, urls) {
  for (const u of urls.slice(0, 8)) {
    try {
      const res = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 4000) continue;
      const webp = await sharp(buf).resize(1280, 800, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
      const ruta = `portadas/${slug}.webp`;
      const { error } = await supabase.storage.from(BUCKET).upload(ruta, webp, { contentType: "image/webp", upsert: true });
      if (error) throw new Error(error.message);
      return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
    } catch { /* siguiente */ }
  }
  return null;
}

async function main() {
  const { data: zonas } = await supabase.from("zonas").select("id, slug, nombre, ciudad");
  const zk = zonas.find((z) => z.slug === "kennedy");
  const zs = zonas.find((z) => z.slug === "soacha");
  let okCat = 0, okNeg = 0, okFoto = 0;

  for (let i = 0; i < DEFS.length; i++) {
    const [slug, nombre, icono, negNombre, corta, servicios, query, comida] = DEFS[i];
    const zona = i % 2 === 0 ? zk : zs;
    const barrios = zona.slug === "kennedy" ? BARRIOS_K : BARRIOS_S;
    const barrio = barrios[i % barrios.length];
    const lat = (zona.slug === "kennedy" ? 4.629 : 4.580) + (((i % 10) - 5) * 0.0012);
    const lng = (zona.slug === "kennedy" ? -74.150 : -74.215) + (((i % 8) - 4) * 0.0012);
    const descSeo = `Encuentra ${nombre.toLowerCase()} en Kennedy (Bogotá) y Soacha: ${servicios.slice(0,3).join(", ").toLowerCase()} y más, con WhatsApp, horarios y cómo llegar.`;

    // 1. Categoría.
    const { data: cat, error: eCat } = await supabase.from("categorias")
      .upsert({ slug, nombre, icono, descripcion_seo: descSeo, orden: ORDEN_BASE + i + 1 }, { onConflict: "slug" })
      .select("id").single();
    if (eCat) { console.error(`✗ cat ${slug}: ${eCat.message}`); continue; }
    okCat++;

    // 2. Foto (Openverse).
    const negSlug = slugify(negNombre);
    let foto = null;
    try { foto = await subir(negSlug, await candidatos(query)); if (foto) okFoto++; }
    catch (e) { console.warn(`  foto ${negSlug}: ${e.message}`); }

    // 3. Negocio de ejemplo.
    const larga = `${corta} ${negNombre} atiende en ${barrio}, ${zona.nombre} (${zona.ciudad}) con atención cercana y precios de barrio. Escríbenos y con gusto te atendemos.`;
    const { error: eNeg } = await supabase.from("negocios").upsert({
      slug: negSlug, nombre: negNombre, categoria_id: cat.id, zona_id: zona.id,
      descripcion_corta: corta, descripcion_larga: larga,
      direccion: `${barrio}, ${zona.nombre}`, barrio, lat, lng, telefono: null, whatsapp: null,
      horarios: comida ? H_FOOD : H_COM, servicios,
      palabras_clave: [nombre.toLowerCase(), `${nombre.toLowerCase()} ${zona.nombre.toLowerCase()}`, barrio.toLowerCase()],
      foto_portada_url: foto, plan: "web", verificado: false, es_ejemplo: true, activo: true,
    }, { onConflict: "slug" });
    if (eNeg) { console.error(`✗ neg ${negSlug}: ${eNeg.message}`); continue; }
    okNeg++;
    console.log(`✓ ${slug} → ${negSlug}${foto ? " (foto)" : " (SIN foto)"}`);
    await dormir(1100);
  }
  console.log(`Listo. Categorías: ${okCat}/${DEFS.length}, negocios: ${okNeg}, con foto: ${okFoto}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
