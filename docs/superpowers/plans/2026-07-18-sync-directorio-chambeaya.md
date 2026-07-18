# Sync Directorio → Chambeaya — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Al vender una web a un negocio de servicio elegible, el Directorio lo publica (como hoy) y además lo registra en Chambeaya en estado `pendiente`, avisando a Nelson por un correo 🟡 para que lo apruebe.

**Architecture:** El Directorio orquesta: tras publicar la ficha en `publicarVenta`, si la categoría es elegible, hace `POST` a un endpoint interno nuevo de Chambeaya (Bearer, apagado sin env). Chambeaya inserta el `worker` pendiente y manda el correo. Comunicación por HTTP (son 2 Supabase distintos). Fire-and-forget: un fallo hacia Chambeaya nunca rompe la publicación.

**Tech Stack:** Next.js 15 (App Router) en ambos repos, TypeScript estricto, Supabase (`@supabase/supabase-js`), Resend (HTTP directo, ya cableado en Chambeaya). Sin framework de tests en ninguno de los dos repos → verificación por `tsc --noEmit`, `npm run lint`, `curl` y consultas a la BD.

## Global Constraints

- **Todo en español de Colombia (es-CO)** — UI, slugs, mensajes, notas.
- **Directorio auto-despliega desde GitHub main.** Trabajar en rama `feat/sync-chambeaya`; NO pushear a main hasta que Nelson dé el OK de merge. Previews de Vercel por rama sirven para probar.
- **Chambeaya**: repo `C:\proyectos\chambeaya`, sin remoto git, branch master, deploy a mano `npx vercel --prod`. Supabase `ydmjepzqeljmdjpmbjlj`.
- **Directorio**: repo `C:\Users\Nelson\Documents\directorio-webconstruye`, Supabase `ncfzuzcjkzkkbjrxdrgy`.
- **Endpoints internos apagados sin su env** (503) — patrón existente, no romperlo.
- **Slugs de Chambeaya** en el mapa DEBEN coincidir con los `id` de `C:\proyectos\chambeaya\lib\content\categorias.ts`.
- **Fotos**: curar SIEMPRE viéndolas (Read del .jpg antes de subir). Pexels vía `PEXELS_API_KEY` en `.env.local` del Directorio.
- **Commits/deploys**: pedir OK a Nelson antes de mergear a main del Directorio o correr `npx vercel --prod` en Chambeaya.

---

## File Structure

**Chambeaya:**
- Create: `app/api/internal/workers/route.ts` — endpoint interno que crea el worker desde una venta + correo 🟡.

**Directorio:**
- Create: `src/lib/sync/chambeaya.ts` — `MAPA_CHAMBEAYA`, `normalizarTelefonoCo()`, `reenviarAChambeaya()`.
- Modify: `src/lib/sync/publicar.ts` — invocar el forward tras publicar.
- BD (`categorias`): split Contadores/Abogados.
- Modify: `src/lib/iconos.ts` — ícono de `abogados`.
- Modify (si aplica): `src/lib/sync/mapeos.ts` — repuntar sector que apuntara a `contadores-y-abogados`.

---

## Task 1: Separar la categoría Contadores / Abogados en el Directorio

**Files:**
- BD `categorias` (Supabase `ncfzuzcjkzkkbjrxdrgy`).
- Modify: `src/lib/iconos.ts`
- Modify (si aplica): `src/lib/sync/mapeos.ts`

**Interfaces:**
- Produces: dos categorías `contadores` (renombrada) y `abogados` (nueva) en la BD; usadas por el mapa de la Task 4.

- [ ] **Step 1: Rama de trabajo**

```bash
cd "C:/Users/Nelson/Documents/directorio-webconstruye"
git checkout -b feat/sync-chambeaya
```

- [ ] **Step 2: Ver el ícono y el negocio de ejemplo actuales**

Revisar `src/lib/iconos.ts` para el mapeo de `contadores-y-abogados`, y consultar el negocio de ejemplo existente:

```sql
select id, slug, nombre, categoria_id, foto_portada_url
from negocios n
join categorias c on c.id = n.categoria_id
where c.slug = 'contadores-y-abogados';
```
(Vía `mcp__plugin_supabase_supabase__execute_sql`, project_id `ncfzuzcjkzkkbjrxdrgy`.)

- [ ] **Step 3: Renombrar la categoría existente e insertar "Abogados"**

```sql
-- Renombra la combinada a solo Contadores (conserva su id y su negocio de ejemplo).
update categorias
set slug = 'contadores',
    nombre = 'Contadores',
    icono = 'Calculator',
    descripcion_seo = 'Contadores y asesoría contable en Kennedy, Bogotá y Soacha: declaración de renta, impuestos y contabilidad para tu negocio.'
where slug = 'contadores-y-abogados';

-- Nueva categoría Abogados.
insert into categorias (slug, nombre, icono, descripcion_seo, orden)
values ('abogados', 'Abogados', 'Scale',
        'Abogados y asesoría legal en Kennedy, Bogotá y Soacha: tutelas, contratos, derecho laboral y trámites jurídicos.',
        86);
```

- [ ] **Step 4: Ícono de abogados en el código**

En `src/lib/iconos.ts`, importar `Scale` de `lucide-react` y agregarlo al mapa con la clave `abogados` (y confirmar que `contadores` use `Calculator`). Seguir el patrón exacto del archivo (mismo estilo de import y de la tabla de íconos que ya tiene).

- [ ] **Step 5: Repuntar el sync si algún sector apuntaba a la categoría combinada**

Abrir `src/lib/sync/mapeos.ts`. Si `categoriaDeSector` (o su tabla) mapea algún `sector_id` a `'contadores-y-abogados'`, cambiarlo a `'contadores'`. Si no aparece esa cadena, no hay cambio (dejar constancia en el commit).

- [ ] **Step 6: Verificar typecheck + lint**

```bash
cd "C:/Users/Nelson/Documents/directorio-webconstruye"
npx tsc --noEmit && npm run lint
```
Expected: sin errores.

- [ ] **Step 7: Verificar en el navegador (local)**

Levantar dev y comprobar que `/categorias` muestra "Contadores" y "Abogados" con ícono, y que `/categoria/abogados` carga (aunque sin negocios aún).

```bash
npm run dev
```
Verificar con Claude_Browser (get_page_text) `http://localhost:3000/categorias`.
Expected: aparecen ambas categorías; la de abogados tiene ícono (no el fallback).

- [ ] **Step 8: Commit**

```bash
git add src/lib/iconos.ts src/lib/sync/mapeos.ts
git commit -m "feat(directorio): separar categoria Contadores y Abogados"
```
(La BD ya quedó cambiada en el Step 3; anotarlo en el mensaje del PR.)

---

## Task 2: Negocio de ejemplo "Abogados" con foto curada

**Files:**
- BD `negocios` + Storage bucket `negocios` (Supabase `ncfzuzcjkzkkbjrxdrgy`).

**Interfaces:**
- Consumes: la categoría `abogados` creada en la Task 1.
- Produces: una ficha de ejemplo publicada para `abogados` (paridad con las otras 84 categorías, que tienen 1 ejemplo con foto).

- [ ] **Step 1: Bajar candidatas de Pexels y CURARLAS viéndolas**

Usar `PEXELS_API_KEY` de `.env.local`. Bajar 3–4 fotos para query "law office lawyer" al scratchpad como .jpg y hacer `Read` de cada una. Elegir una profesional y relevante (oficina/abogado, no clip-art, no texto sobreimpreso). Regla de Nelson: rechazar off-topic/mala calidad.

- [ ] **Step 2: Convertir a WebP y subir al bucket**

Redimensionar a 1280×800 (cover) con sharp, subir a `portadas/abogados-<slug>.webp` en el bucket `negocios` (mismo patrón que `scripts/fotos-pexels.mjs`). Copiar el .webp resultante al scratchpad y hacer `Read` para confirmar el recorte final antes de dar por buena la foto.

- [ ] **Step 3: Insertar el negocio de ejemplo**

Seguir el molde de los seed de ejemplo (uno por categoría): `es_ejemplo=true`, `verificado=false`, `activo=true`, zona existente, `foto_portada_url` = URL pública del WebP subido, nombre tipo "Abogados & Asesoría Legal La Justicia", descripción de servicios legales. Usar `execute_sql` (project `ncfzuzcjkzkkbjrxdrgy`) espejando las columnas que usan los demás ejemplos (verificar el shape con un `select` de otro negocio `es_ejemplo=true`).

- [ ] **Step 4: Verificar en el navegador (local)**

`http://localhost:3000/categoria/abogados` debe mostrar la ficha con su foto. Confirmar con get_page_text + (si no hay canvas) screenshot.
Expected: 1 negocio de ejemplo con foto.

- [ ] **Step 5: Commit (solo doc/seed si aplica)**

Si se agregó/actualizó un script de seed, commitearlo:
```bash
git add scripts/
git commit -m "feat(directorio): negocio de ejemplo para Abogados con foto"
```
(Si el insert fue solo por SQL, anotarlo en el PR; no hay archivo que commitear.)

---

## Task 3: Endpoint interno de Chambeaya + correo 🟡

**Files:**
- Create: `C:\proyectos\chambeaya\app\api\internal\workers\route.ts`

**Interfaces:**
- Consumes: nada de tasks previas (repo Chambeaya, independiente).
- Produces: contrato HTTP `POST /api/internal/workers` con cuerpo
  `{ evento_id?: string, nombre: string, telefono: string(^57\d{10}$), categorias: string[], zona: string, venta_fecha: string }`,
  Bearer `SYNC_INTERNAL_KEY`. Respuestas: `201 {resultado:"creado",worker_id}`, `200 {resultado:"ya_existe"}`, `401`, `422`, `503`.

- [ ] **Step 1: Crear el endpoint**

Crear `C:\proyectos\chambeaya\app\api\internal\workers\route.ts` con este contenido exacto:

```ts
import { timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { NextResponse, type NextRequest } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { notificarAdmin, filaHtml } from "@/lib/notificaciones";
import { CATEGORIAS } from "@/lib/content/categorias";

export const dynamic = "force-dynamic";

/**
 * Webhook interno Directorio → Chambeaya: registra un negocio recién vendido
 * como trabajador en estado 'pendiente' (sin verificación de cédula), para que
 * Nelson lo apruebe desde /admin. Apagado (503) sin SYNC_INTERNAL_KEY.
 * Idempotencia: la unicidad de `telefono` en `workers` evita duplicados.
 */
export async function POST(request: NextRequest) {
  const clave = process.env.SYNC_INTERNAL_KEY;
  if (!clave) {
    return NextResponse.json({ error: "Sync no configurado." }, { status: 503 });
  }
  if (!autorizado(request.headers.get("authorization"), clave)) {
    return new NextResponse(null, { status: 401 });
  }

  let crudo: unknown;
  try {
    crudo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const c = crudo as Record<string, unknown>;

  const nombre = String(c?.nombre ?? "").trim();
  const telefono = String(c?.telefono ?? "").replace(/\D/g, "");
  const categorias = Array.isArray(c?.categorias)
    ? (c.categorias as unknown[]).map(String).map((s) => s.trim()).filter(Boolean)
    : [];
  const zona = (String(c?.zona ?? "bogota").trim().toLowerCase() || "bogota");
  const ventaFecha = String(c?.venta_fecha ?? "").trim();

  if (
    nombre.length < 2 ||
    nombre.length > 120 ||
    !/^57\d{10}$/.test(telefono) ||
    categorias.length === 0
  ) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 422 });
  }

  const db = crearClienteAdmin();
  const { data: worker, error } = await db
    .from("workers")
    .insert({
      nombre,
      telefono,
      categorias,
      zonas: [zona],
      estado_verificacion: "pendiente",
      disponible: false,
      notas: `Cliente del Directorio — venta ${ventaFecha || "s/f"}, sin verificación de cédula`,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Teléfono ya registrado: no duplicar ni volver a notificar.
      return NextResponse.json({ resultado: "ya_existe" }, { status: 200 });
    }
    console.error("workers sync: error insertando", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const nombresCategorias = categorias
    .map((id) => CATEGORIAS.find((cat) => cat.id === id)?.nombre ?? id)
    .join(", ");

  after(() =>
    Promise.all([
      notificarAdmin(
        `🟡 Revisar en Chambeaya: ${nombre}`,
        [
          `<h2 style="margin:0 0 12px">Un negocio recién vendido se registró en Chambeaya</h2>`,
          filaHtml("Nombre", nombre),
          filaHtml("Teléfono", telefono),
          filaHtml("Categorías", nombresCategorias),
          filaHtml("Origen", `Venta del Directorio — ${ventaFecha || "s/f"}`),
          `<p style="margin:12px 0 0">Entró en <strong>pendiente</strong> y NO es matchable todavía. Revísalo, confirma que aplica a domicilio/servicio y déjalo en <strong>Aprobado + Disponible</strong>:</p>`,
          `<p style="margin:8px 0 0"><a href="https://chambeaya.com/admin">Abrir el panel de Chambeaya</a></p>`,
        ].join(""),
      ),
      db.from("audit_log").insert({
        evento: "worker_desde_venta",
        entidad: `worker:${worker.id}`,
        payload: { nombre, telefono, categorias, zona, venta_fecha: ventaFecha },
      }),
    ]),
  );

  return NextResponse.json(
    { resultado: "creado", worker_id: worker.id },
    { status: 201 },
  );
}

function autorizado(encabezado: string | null, clave: string): boolean {
  if (!encabezado?.startsWith("Bearer ")) return false;
  const recibida = Buffer.from(encabezado.slice(7));
  const esperada = Buffer.from(clave);
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}
```

- [ ] **Step 2: Verificar typecheck + lint**

```bash
cd "C:/proyectos/chambeaya"
npx tsc --noEmit && npm run lint
```
Expected: sin errores.

- [ ] **Step 3: Smoke test local (503 sin env, 401 con env y sin auth)**

Levantar Chambeaya dev SIN `SYNC_INTERNAL_KEY` y verificar 503:
```bash
cd "C:/proyectos/chambeaya" && npm run dev
```
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/internal/workers -H "Content-Type: application/json" -d '{}'
```
Expected: `503`.

Detener, exportar la env y reintentar (401 sin Bearer, 422 con Bearer y payload vacío, 201 con payload válido):
```bash
SYNC_INTERNAL_KEY=clave-de-prueba npm run dev
```
```bash
# 401 sin Bearer
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/internal/workers -H "Content-Type: application/json" -d '{"nombre":"x"}'
# 422 con Bearer y payload inválido
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/internal/workers -H "Authorization: Bearer clave-de-prueba" -H "Content-Type: application/json" -d '{}'
# 201 con payload válido (usa un teléfono de PRUEBA que luego se borra)
curl -s -X POST http://localhost:3000/api/internal/workers -H "Authorization: Bearer clave-de-prueba" -H "Content-Type: application/json" -d '{"nombre":"Fumigaciones Prueba","telefono":"573000000001","categorias":["fumigacion"],"zona":"bogota","venta_fecha":"2026-07-18"}'
```
Expected: `401`, `422`, y `{"resultado":"creado",...}`. Repetir el último → `{"resultado":"ya_existe"}`.

- [ ] **Step 4: Limpiar el worker de prueba**

```sql
delete from workers where telefono = '573000000001';
delete from audit_log where evento = 'worker_desde_venta' and payload->>'telefono' = '573000000001';
```
(Vía `execute_sql`, project `ydmjepzqeljmdjpmbjlj`.)

- [ ] **Step 5: Commit (Chambeaya)**

```bash
cd "C:/proyectos/chambeaya"
git add app/api/internal/workers/route.ts
git commit -m "feat: endpoint interno /api/internal/workers (sync desde Directorio)"
```

---

## Task 4: Mapa y helper de reenvío en el Directorio

**Files:**
- Create: `src/lib/sync/chambeaya.ts`

**Interfaces:**
- Consumes: contrato del endpoint de la Task 3.
- Produces:
  - `MAPA_CHAMBEAYA: Record<string, string[]>`
  - `normalizarTelefonoCo(...candidatos: (string|null|undefined)[]): string | null`
  - `reenviarAChambeaya(datos: { eventoId: string; nombre: string; telefono: string | null; categoriaSlug: string; zonaChambeaya: string; ventaFecha: string }): Promise<{ ok: true } | { ok: false; motivo: string }>`

- [ ] **Step 1: Crear el archivo**

Crear `src/lib/sync/chambeaya.ts` con este contenido exacto:

```ts
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
    const res = await fetch(url, {
      method: "POST",
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
    return { ok: false, motivo: e instanceof Error ? e.message : String(e) };
  }
}
```

- [ ] **Step 2: Verificar que los ids del mapa existen en Chambeaya**

Comparar cada id de valor del mapa contra los `id` de `C:\proyectos\chambeaya\lib\content\categorias.ts`. Todos deben existir: `cerrajeria, electrodomesticos, costura, construccion, belleza, fumigacion, vidrieria, lavanderia, alquiler-lavadoras, reciclaje, montallantas, mecanico, veterinario, fisioterapia, toma-muestras, fotografia, tramites, publicidad, contador, abogado`.
Expected: los 20 existen (Grep en el archivo de Chambeaya).

- [ ] **Step 3: Typecheck**

```bash
cd "C:/Users/Nelson/Documents/directorio-webconstruye"
npx tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sync/chambeaya.ts
git commit -m "feat(directorio): mapa y helper de reenvio a Chambeaya"
```

---

## Task 5: Enganchar el reenvío en `publicarVenta`

**Files:**
- Modify: `src/lib/sync/publicar.ts`

**Interfaces:**
- Consumes: `reenviarAChambeaya`, `normalizarTelefonoCo` de la Task 4.
- Produces: `publicarVenta` ahora, tras publicar, intenta el reenvío y anota el resultado en `detalle.chambeaya`.

- [ ] **Step 1: Importar el helper**

En `src/lib/sync/publicar.ts`, junto a los imports de `./mapeos` y `./descripciones`, agregar:
```ts
import { reenviarAChambeaya, normalizarTelefonoCo } from "./chambeaya";
```

- [ ] **Step 2: Reenviar antes del `return` de `publicado`**

Localizar el bloque final (tras obtener `creado`), que hoy es:
```ts
  return {
    resultado: "publicado",
    negocioId: creado.id,
    slug: creado.slug,
    detalle: {
      match: mejor,
      demo_id: demo.id,
      avisos: avisos.length ? avisos : undefined,
    } as unknown as Json,
  };
```
Reemplazarlo por (reenvío fire-and-forget, nunca cambia el resultado de la publicación):
```ts
  // Reenvío a Chambeaya (best-effort): si la categoría es elegible y hay
  // teléfono, registra el negocio como trabajador pendiente en Chambeaya.
  const zonaChambeaya = zona.ciudad?.toLowerCase().includes("soacha")
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
```
(Nota: `categoriaSlug` ya está en scope desde el paso 4 de `publicarVenta`; `registro.nombre/whatsapp/telefono` también.)

- [ ] **Step 3: Typecheck + lint**

```bash
cd "C:/Users/Nelson/Documents/directorio-webconstruye"
npx tsc --noEmit && npm run lint
```
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sync/publicar.ts
git commit -m "feat(directorio): reenviar venta publicada a Chambeaya"
```

---

## Task 6: Activación (envs), despliegue y prueba end-to-end

**Files:** ninguno (configuración + verificación).

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: Generar la clave compartida**

Generar una clave aleatoria (p. ej. `openssl rand -hex 24`). Se usará como `SYNC_INTERNAL_KEY` (Chambeaya) y `CHAMBEAYA_SYNC_KEY` (Directorio) — mismo valor.

- [ ] **Step 2: Desplegar Chambeaya con la env (pedir OK a Nelson)**

Setear en Vercel proyecto `chambeaya` la env `SYNC_INTERNAL_KEY` (Production) con `printf` sin newline (evitar el malformado del pipe de PowerShell). Luego:
```bash
cd "C:/proyectos/chambeaya" && npx vercel --prod --yes
```
Smoke: `curl` a `https://chambeaya.com/api/internal/workers` sin Bearer → 401; con Bearer y payload de prueba → 201; repetido → `ya_existe`. Limpiar el worker de prueba (Task 3, Step 4).

- [ ] **Step 3: Poner las envs del Directorio en el preview de la rama**

En Vercel proyecto `directorio-webconstruye`, setear `CHAMBEAYA_SYNC_URL=https://chambeaya.com/api/internal/workers` y `CHAMBEAYA_SYNC_KEY=<misma clave>` (con `printf`). Aplicarlas al scope que use el deploy de preview de `feat/sync-chambeaya` (Preview) además de Production para el corte final.

- [ ] **Step 4: Prueba end-to-end con una venta de prueba**

Reproducir el patrón ya documentado (memoria `sync-ventas-directorio`): insertar en el CRM un negocio + visita `estado='venta'` que casen con un demo de **categoría de servicio elegible** (p. ej. un demo cuya categoría mapee a `fumigacion`/`cerrajerias`), o usar `select public.sync_directorio_reintentar('<visita_id>')`. Verificar:
  1. Ficha publicada en el Directorio (como siempre).
  2. `sync_eventos.detalle->>'chambeaya' = 'reenviado'`.
  3. En Chambeaya `ydmjepzqeljmdjpmbjlj`: un `workers` nuevo `estado_verificacion='pendiente'`, `disponible=false`, con las categorías mapeadas.
  4. Llegó el correo 🟡 a `NOTIFICACIONES_EMAIL`.
  5. El worker aparece en `https://chambeaya.com/admin` en la tabla de Trabajadores.

- [ ] **Step 5: Limpieza total de la prueba**

Borrar: ficha + fila `sync_eventos` (Directorio), `workers` + `audit_log` de prueba (Chambeaya), visita + negocio (CRM), y la foto del bucket si se creó. (Mismo procedimiento de limpieza de la memoria `sync-ventas-directorio`.)

- [ ] **Step 6: Merge a main (pedir OK a Nelson) → deploy del Directorio**

Con Nelson presente y las envs de Production ya puestas:
```bash
cd "C:/Users/Nelson/Documents/directorio-webconstruye"
git checkout main && git merge --no-ff feat/sync-chambeaya
git push
```
El push a main dispara el deploy automático del Directorio. Verificar en prod que un `curl` de humo NO se hace contra el endpoint del Directorio (no exponerlo); confirmar por el navegador que el sitio sigue OK.

- [ ] **Step 7: Actualizar memoria y docs**

Actualizar el nodo de memoria `pendientes-webconstruye` (sync Directorio→Chambeaya = HECHO) y añadir una nota del cableado en `docs/` (junto a `proceso-venta-a-directorio.md`).

---

## Self-Review (hecha)

- **Cobertura del spec:** Fase 0 (split) → Tasks 1–2. Mapa → Task 4. Forward → Task 5. Endpoint + email + idempotencia → Task 3. Envs + e2e → Task 6. ✔
- **Sin placeholders:** todo el código va completo; comandos con salida esperada. ✔
- **Consistencia de tipos:** el cuerpo que arma `reenviarAChambeaya` (Task 4) coincide con lo que valida el endpoint (Task 3): `nombre, telefono ^57\d{10}$, categorias[], zona, venta_fecha`. Los ids del mapa (Task 4) se validan contra Chambeaya (Task 4, Step 2). `categoriaSlug`, `registro.*`, `zona.ciudad`, `payload.*` existen en el scope de `publicarVenta`. ✔
