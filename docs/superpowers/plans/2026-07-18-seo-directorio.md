# SEO del Directorio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Contenido único por página categoría×zona (con FAQ schema), fichas de ejemplo únicas, generador del sync mejorado, y paquetes GBP — para que el directorio posicione y genere leads.

**Architecture:** Tabla nueva `contenido_zonal` (intro + faqs jsonb, aditiva: sin fila la página no cambia). La página `/[zona]/[categoria]` renderiza el bloque editorial y las FAQs con JSON-LD FAQPage. El contenido se genera por lotes directo a la BD con gate de muestreo de Nelson. Los docs GBP van a `docs/`.

**Tech Stack:** Next.js 15 App Router (SSG/ISR 3600), Supabase (RLS), vitest, TypeScript estricto.

## Global Constraints

- **Todo en español de Colombia (es-CO).** Contenido útil para un vecino real; prohibido keyword stuffing y frases idénticas entre zonas.
- **El Directorio auto-despliega desde GitHub main.** Código en rama `feat/seo-contenido`; merge a main SOLO con OK de Nelson.
- Supabase del Directorio: `ncfzuzcjkzkkbjrxdrgy`. SQL de DDL con `apply_migration`; datos con `execute_sql`.
- **RLS**: lectura pública solo de contenido; escrituras solo admin/service role (patrón existente en `supabase/schema.sql`).
- **Gate de muestreo**: NO generar el lote masivo de contenido hasta que Nelson apruebe el tono del lote piloto.
- Tipos de BD se sincronizan A MANO en `src/types/database.ts` (decisión del repo).
- Contenido aditivo: página sin fila de `contenido_zonal` debe renderizar EXACTAMENTE como hoy.
- No martillar prod con curl en loops (bot-challenge de Vercel); verificar por navegador o requests puntuales.

---

## File Structure

- Create: migración SQL `contenido_zonal` (vía apply_migration; reflejar en `supabase/schema.sql`)
- Modify: `src/types/database.ts` — tipos de la tabla nueva
- Create: `src/lib/queries/contenido-zonal.ts` — query pública
- Modify: `src/lib/seo/jsonld.tsx` — `datosFaqPage()`
- Modify: `src/app/(publico)/[zona]/[categoria]/page.tsx` — bloque editorial + FAQs
- Modify: `src/lib/sync/descripciones.ts` — generador con variación
- Modify/Create: `tests/unitarias/sync-descripciones.test.ts`
- Create: `docs/gbp-agencia.md`, `docs/kit-gbp-cliente.md`

---

## Task 1: Tabla `contenido_zonal` + tipos + query

**Files:**
- BD: migración `contenido_zonal` (apply_migration, project `ncfzuzcjkzkkbjrxdrgy`)
- Modify: `supabase/schema.sql` (reflejar la tabla al final, sección comentada)
- Modify: `src/types/database.ts`
- Create: `src/lib/queries/contenido-zonal.ts`

**Interfaces:**
- Produces: `obtenerContenidoZonal(categoriaId: string, zonaId: string): Promise<ContenidoZonal | null>` con `ContenidoZonal = { intro_html: string; faqs: { pregunta: string; respuesta: string }[] }`.

- [ ] **Step 1: Rama**

```bash
cd "C:/Users/Nelson/Documents/directorio-webconstruye"
git checkout -b feat/seo-contenido
```

- [ ] **Step 2: Migración (apply_migration, nombre `contenido_zonal`)**

```sql
create table if not exists public.contenido_zonal (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  zona_id uuid not null references public.zonas(id) on delete cascade,
  intro_html text not null,
  faqs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (categoria_id, zona_id)
);

alter table public.contenido_zonal enable row level security;

create policy "contenido_zonal_lectura_publica"
  on public.contenido_zonal for select using (true);
-- Sin políticas de escritura anon: solo service role / admin (patrón del repo).
```

- [ ] **Step 3: Reflejar en `supabase/schema.sql`**

Añadir al final del archivo la misma DDL bajo un comentario `-- Contenido editorial por categoría×zona (SEO, jul-2026)`, siguiendo el estilo del resto del archivo.

- [ ] **Step 4: Tipos en `src/types/database.ts`**

Seguir el patrón exacto de las otras tablas del archivo (Row/Insert/Update). Campos: `id: string`, `categoria_id: string`, `zona_id: string`, `intro_html: string`, `faqs: Json`, `created_at: string`, `updated_at: string`. Exportar además:

```ts
export interface FaqZonal {
  pregunta: string;
  respuesta: string;
}
```

- [ ] **Step 5: Query pública `src/lib/queries/contenido-zonal.ts`**

Espejar el estilo de `src/lib/queries/categorias.ts` (cliente público, cache de request si los demás lo usan — revisar y copiar el patrón):

```ts
import { clientePublico } from "@/lib/supabase/public"; // ajustar al import real que usan las otras queries
import type { FaqZonal } from "@/types/database";

export interface ContenidoZonal {
  intro_html: string;
  faqs: FaqZonal[];
}

/** Contenido editorial de una página categoría×zona; null si no existe. */
export async function obtenerContenidoZonal(
  categoriaId: string,
  zonaId: string,
): Promise<ContenidoZonal | null> {
  const supabase = clientePublico();
  const { data } = await supabase
    .from("contenido_zonal")
    .select("intro_html, faqs")
    .eq("categoria_id", categoriaId)
    .eq("zona_id", zonaId)
    .maybeSingle();
  if (!data) return null;
  const faqs = Array.isArray(data.faqs) ? (data.faqs as unknown as FaqZonal[]) : [];
  return { intro_html: data.intro_html, faqs };
}
```

(IMPORTANTE: antes de escribirlo, abrir `src/lib/queries/categorias.ts` y copiar su forma real de crear el cliente y su manejo de errores; el snippet es la intención, el patrón del repo manda.)

- [ ] **Step 6: Verificar**

```bash
npx tsc --noEmit && npm run lint && npm run test
```
Expected: todo verde (50 tests actuales).

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql src/types/database.ts src/lib/queries/contenido-zonal.ts
git commit -m "feat(seo): tabla contenido_zonal con lectura publica y query"
```

---

## Task 2: Render del bloque editorial + FAQs + JSON-LD FAQPage

**Files:**
- Modify: `src/lib/seo/jsonld.tsx`
- Modify: `src/app/(publico)/[zona]/[categoria]/page.tsx`

**Interfaces:**
- Consumes: `obtenerContenidoZonal` (Task 1).
- Produces: `datosFaqPage(faqs: FaqZonal[]): ObjetoJsonLd` en jsonld.tsx.

- [ ] **Step 1: `datosFaqPage` en `src/lib/seo/jsonld.tsx`**

Junto a `datosBreadcrumb`/`datosItemList`, siguiendo su estilo:

```tsx
import type { FaqZonal } from "@/types/database"; // añadir al import de tipos existente

/** FAQPage para el bloque de preguntas frecuentes de categoría×zona. */
export function datosFaqPage(faqs: FaqZonal[]): ObjetoJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.pregunta,
      acceptedAnswer: { "@type": "Answer", text: f.respuesta },
    })),
  };
}
```

(Verificar cómo arman el `@context` los otros helpers del archivo y ser consistente: si `JsonLd` ya inyecta el context, no duplicarlo.)

- [ ] **Step 2: Página categoría×zona**

En `src/app/(publico)/[zona]/[categoria]/page.tsx`:

1. Importar `obtenerContenidoZonal` y `datosFaqPage`.
2. En el componente, tras obtener zona/categoría, añadir la consulta al `Promise.all` existente:
```tsx
const [negocios, combinaciones, contenido] = await Promise.all([
  obtenerPorZonaYCategoria(zona.id, categoria.id),
  obtenerCombinacionesActivas(),
  obtenerContenidoZonal(categoria.id, zona.id),
]);
```
3. En el array de `<JsonLd datos={[...]}>`, añadir condicionalmente:
```tsx
...(contenido && contenido.faqs.length > 0 ? [datosFaqPage(contenido.faqs)] : []),
```
4. Bloque editorial — insertar DESPUÉS de la `<section>` del grid de negocios y ANTES del aside de otras zonas:
```tsx
{contenido ? (
  <section
    aria-label={`Sobre ${nombreCategoriaLower} en ${zona.nombre}`}
    className="prose prose-sm mt-10 max-w-3xl text-[15px] leading-7 text-muted-foreground [&_h2]:font-heading [&_h2]:text-foreground"
    dangerouslySetInnerHTML={{ __html: contenido.intro_html }}
  />
) : null}
```
(El HTML viene solo de la BD con escritura restringida a admin/service role — no hay entrada de usuarios. Si el repo no usa la clase `prose` (sin plugin typography), usar en su lugar un wrapper con estilos equivalentes: `mt-10 max-w-3xl space-y-4 text-[15px] leading-7 text-muted-foreground`.)
5. Bloque FAQs — al final, antes del cierre de `</main>`:
```tsx
{contenido && contenido.faqs.length > 0 ? (
  <section aria-label="Preguntas frecuentes" className="mt-10 max-w-3xl">
    <h2 className="font-heading text-lg font-semibold">
      Preguntas frecuentes sobre {nombreCategoriaLower} en {zona.nombre}
    </h2>
    <div className="mt-3 space-y-2">
      {contenido.faqs.map((faq) => (
        <details key={faq.pregunta} className="group rounded-xl border bg-card px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold marker:content-none">
            {faq.pregunta}
          </summary>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.respuesta}</p>
        </details>
      ))}
    </div>
  </section>
) : null}
```

- [ ] **Step 3: Probar en local con una fila de prueba**

Insertar por `execute_sql` UNA fila real de prueba (categoría `cerrajerias` × zona `kennedy`) con un intro_html de 2 párrafos y 3 faqs de contenido real (no lorem):

```sql
insert into contenido_zonal (categoria_id, zona_id, intro_html, faqs)
select c.id, z.id,
  '<h2>Cerrajería en Kennedy: lo que hay que saber</h2><p>En Kennedy la mayoría de cerrajerías atienden urgencias a domicilio las 24 horas: apertura de puertas sin dañar la chapa, cambio de guardas y duplicado de llaves de seguridad. Los sectores con más movimiento son Kennedy Central, Banderas y Timiza, donde una apertura sencilla suele costar entre $40.000 y $80.000 según la hora.</p><p>Antes de llamar, tenga a mano el tipo de cerradura (tradicional, de seguridad o eléctrica) y pida el precio cerrado por adelantado. Un cerrajero serio siempre llega con identificación y factura.</p>',
  '[{"pregunta":"¿Cuánto cobra un cerrajero por abrir una puerta en Kennedy?","respuesta":"Una apertura sencilla de puerta residencial cuesta entre $40.000 y $80.000 en el día; de noche o festivo puede subir a $100.000. Pida siempre el precio cerrado antes de que llegue."},{"pregunta":"¿Hay cerrajerías 24 horas en Kennedy?","respuesta":"Sí. Varias cerrajerías del sector atienden urgencias las 24 horas con servicio a domicilio en Kennedy Central, Banderas, Timiza y barrios vecinos."},{"pregunta":"¿Qué necesito para cambiar la guarda de una chapa?","respuesta":"Solo la chapa a intervenir y un documento que lo acredite como residente. El cambio de guarda estándar tarda menos de 30 minutos e incluye llaves nuevas."}]'::jsonb
from categorias c, zonas z where c.slug='cerrajerias' and z.slug='kennedy';
```

Levantar `npm run dev` y verificar `http://localhost:3000/kennedy/cerrajerias`:
- El bloque editorial y las 3 FAQs se ven.
- El HTML contiene `"@type":"FAQPage"` (grep en el HTML servido).
- Una página SIN fila (p. ej. `/kennedy/asaderos`) se ve exactamente como antes.
Matar el dev server por PID.

- [ ] **Step 4: Verificar suite**

```bash
npx tsc --noEmit && npm run lint && npm run test
```
Expected: verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/jsonld.tsx "src/app/(publico)/[zona]/[categoria]/page.tsx"
git commit -m "feat(seo): bloque editorial y FAQs con schema FAQPage en categoria x zona"
```

---

## Task 3: Generador de descripciones del sync con variación (B1) + test

**Files:**
- Modify: `src/lib/sync/descripciones.ts`
- Create: `tests/unitarias/sync-descripciones.test.ts`
- Modify: `src/lib/sync/publicar.ts` (pasar los datos nuevos al generador)

**Interfaces:**
- Consumes: datos del demo ya disponibles en `publicarVenta` (`demo.servicios`? verificar columnas reales de `demo_negocios`; usar las que existan: zona/barrio, horarios, teléfono).
- Produces: misma firma pública `generarDescripcionCorta(d)` / `generarDescripcionLarga(d)` con `DatosDescripcion` extendido: `servicios?: string[] | null; horarios?: unknown; semilla?: string`.

- [ ] **Step 1: Test primero (`tests/unitarias/sync-descripciones.test.ts`)**

Casos mínimos (estilo de los tests existentes del repo):
```ts
import { describe, expect, it } from "vitest";
import { generarDescripcionCorta, generarDescripcionLarga } from "@/lib/sync/descripciones";

const base = {
  nombre: "Cerrajería El Candado",
  categoriaNombre: "Cerrajería",
  zonaNombre: "Kennedy",
  ciudad: "Bogotá",
  direccion: "Cra 78 # 35-20 Sur",
  barrio: "Timiza",
  servicios: ["Apertura de puertas", "Cambio de guardas"],
  semilla: "a1b2c3",
};

describe("generarDescripcionCorta", () => {
  it("respeta el máximo de 160 caracteres", () => {
    expect(generarDescripcionCorta(base).length).toBeLessThanOrEqual(160);
  });
  it("menciona el nombre y la zona o el barrio", () => {
    const corta = generarDescripcionCorta(base);
    expect(corta).toContain("Cerrajería El Candado");
    expect(corta.includes("Kennedy") || corta.includes("Timiza")).toBe(true);
  });
});

describe("generarDescripcionLarga", () => {
  it("incluye los servicios cuando existen", () => {
    expect(generarDescripcionLarga(base)).toContain("Apertura de puertas");
  });
  it("varía la estructura según la semilla", () => {
    const a = generarDescripcionLarga({ ...base, semilla: "aaaa" });
    const b = generarDescripcionLarga({ ...base, semilla: "zzzz" });
    expect(a).not.toEqual(b);
  });
  it("sin servicios ni barrio no rompe", () => {
    const texto = generarDescripcionLarga({ ...base, servicios: null, barrio: null, semilla: "x" });
    expect(texto.length).toBeGreaterThan(100);
  });
});
```
Correr: `npm run test -- tests/unitarias/sync-descripciones.test.ts` → Expected: FAIL (funciones aún sin los campos nuevos).

- [ ] **Step 2: Implementar la variación en `descripciones.ts`**

Diseño: 3 plantillas de apertura + 2 de cierre; elegir por hash simple de la `semilla` (p. ej. suma de charCodes % n). Interpolar servicios (máx 3, en frase natural), barrio y ciudad. La corta mantiene el recorte a 160. Mantener las funciones puras (sin IO). Ejemplo de esqueleto:

```ts
function indicePorSemilla(semilla: string | undefined, n: number): number {
  if (!semilla) return 0;
  let suma = 0;
  for (const ch of semilla) suma += ch.charCodeAt(0);
  return suma % n;
}
```
Las plantillas se escriben completas en es-CO (redacción natural, sin keyword stuffing). El texto largo termina siempre con la línea de contacto del directorio y la invitación al propietario (una sola vez, no en cada párrafo).

- [ ] **Step 3: Pasar los datos nuevos desde `publicarVenta`**

En `src/lib/sync/publicar.ts`, al armar `textos`, añadir `servicios: demo.servicios ?? null` (verificar el nombre real de la columna en `demo_negocios` con un select; si no existe columna de servicios, usar solo barrio+horarios y ajustar el test) y `semilla: demo.id`.

- [ ] **Step 4: Verificar**

```bash
npm run test && npx tsc --noEmit && npm run lint
```
Expected: verde, incluidos los tests nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sync/descripciones.ts src/lib/sync/publicar.ts tests/unitarias/sync-descripciones.test.ts
git commit -m "feat(sync): descripciones con datos del demo y variacion por semilla"
```

---

## Task 4: Merge a main (GATE: OK de Nelson) 

- [ ] **Step 1: Pedir OK a Nelson** mostrando: captura/URL local de la página con el bloque nuevo (la fila piloto de cerrajerías×kennedy queda en la BD y se verá en prod al desplegar).
- [ ] **Step 2: Merge + push**
```bash
git checkout main && git merge --no-ff feat/seo-contenido && git push
```
- [ ] **Step 3: Verificar en prod** (navegador, no curl en loop): `https://directorio.webconstruye.com/kennedy/cerrajerias` muestra el bloque; validar FAQ schema en https://search.google.com/test/rich-results con esa URL.

---

## Task 5: Lote piloto de contenido zonal (15 páginas) — GATE de muestreo

**Files:** solo BD (`contenido_zonal`).

- [ ] **Step 1: Elegir 15 combinaciones** variadas (mezcla Kennedy/Soacha; categorías de servicio, comida y comercio; incluir las de más búsqueda esperable: cerrajerías, plomería no existe→ferreterías, asaderos, droguerías, peluquerías, talleres, fumigación, lavanderías…). La piloto de cerrajerías×kennedy ya existe (Task 2) — cuenta como 1.
- [ ] **Step 2: Generar e insertar las 14 restantes.** Reglas de calidad POR TEXTO:
  - 150-250 palabras de intro en 2-3 `<p>` (+ un `<h2>` inicial), es-CO natural.
  - Datos locales VEROSÍMILES y prudentes: barrios reales de la zona (Kennedy: Kennedy Central, Timiza, Castilla, Patio Bonito, Banderas, Class, Tintal, Américas; Soacha: Soacha Centro, San Mateo, León XIII, Compartir, Ciudad Verde, La Despensa); rangos de precio solo donde sean estables y conocidos, con "aproximado"/"suele".
  - PROHIBIDO: repetir frases entre páginas (cada texto se redacta desde cero), inventar negocios concretos, superlativos vacíos ("el mejor de Bogotá").
  - 3-4 FAQs por página con respuestas útiles de 2-3 frases.
  - Insertar por `execute_sql` en lotes de 5; al final `revalidatePath` no está disponible por SQL → tocar el revalidate llamando las URLs una vez (ISR 3600 se refresca solo; para verlas ya, una visita con el navegador basta tras expirar; aceptable esperar).
- [ ] **Step 3: Presentar a Nelson** la lista de 15 URLs para que muestree y apruebe el tono. **NO CONTINUAR sin su OK.**

---

## Task 6: Resto del contenido zonal (~157 páginas)

- [ ] **Step 1:** Obtener todas las combinaciones activas sin fila en `contenido_zonal` (query con left join). 
- [ ] **Step 2:** Generar e insertar por lotes de ~20, mismas reglas de calidad de la Task 5. Registrar el avance (conteo por lote) en el reporte.
- [ ] **Step 3:** Verificación final: `select count(*) from contenido_zonal;` ≈ combinaciones activas; muestrear 3 URLs al azar en prod.

---

## Task 7: Fichas de ejemplo únicas (87) — con gate

- [ ] **Step 1: Lote piloto de 15 fichas.** Reescribir `descripcion_corta` (≤160, única) y `descripcion_larga` (3 párrafos únicos con servicios/barrio/horarios de la fila) de 15 negocios de ejemplo variados. UPDATE por `execute_sql`. Sin tocar la frase de "Ejemplo" del UI (el badge sale de `es_ejemplo`, no del texto).
- [ ] **Step 2: Muestreo de Nelson** (lista de las 15 URLs de ficha). **NO CONTINUAR sin OK.**
- [ ] **Step 3: Resto (72)** por lotes de ~20 con las mismas reglas.
- [ ] **Step 4:** Verificación: ninguna `descripcion_larga` contiene la frase plantilla "hace parte del Directorio Webconstruye, la guía" duplicada — `select count(*) from negocios where descripcion_larga like '%guía de negocios locales verificados%';` debe bajar a 0 en ejemplos.

---

## Task 8: Paquetes GBP (agencia + kit cliente)

**Files:**
- Create: `docs/gbp-agencia.md`
- Create: `docs/kit-gbp-cliente.md`

- [ ] **Step 1: `docs/gbp-agencia.md`** — paquete listo-para-pegar: nombre ("Webconstruye — Páginas web para negocios"), categoría GBP ("Diseñador de sitios web"), descripción ≤750 chars optimizada, lista de servicios, sitio web (webconstruye.com), enlaces adicionales (directorio, demos), horario, zona de servicio (Bogotá/Kennedy/Soacha), y pasos numerados de creación+verificación en business.google.com. Nota explícita: la creación la hace Nelson con su cuenta.
- [ ] **Step 2: `docs/kit-gbp-cliente.md`** — checklist por venta: reclamar/crear perfil del cliente, categoría correcta (tabla de equivalencias categoría directorio→categoría GBP para las 20+ comunes), descripción única (usar la de su ficha como base), enlazar SU web nueva como sitio principal y su ficha del directorio en enlaces, subir mínimo 5 fotos, primer post, y pedir la primera reseña. Referenciar `docs/proceso-venta-a-directorio.md`.
- [ ] **Step 3: Commit + push (docs a main directo — con OK de Nelson del texto).**

```bash
git add docs/gbp-agencia.md docs/kit-gbp-cliente.md
git commit -m "docs(seo): paquete GBP de la agencia y kit GBP por cliente"
git push
```

---

## Self-Review (hecha)

- **Cobertura del spec:** A1→Tasks 1,2,5,6 · A2→Task 7 · A3→Task 8 · B1→Task 3 · B2→Task 8. Gates de muestreo en Tasks 5 y 7; gate de merge en Task 4. ✔
- **Placeholders:** el código de queries/render indica explícitamente "copiar el patrón real del repo" donde el snippet depende de él — es instrucción de adaptación, no placeholder; la DDL, el JSON-LD, los tests y la fila piloto van completos. ✔
- **Consistencia:** `FaqZonal` definido en Task 1, consumido en Task 2; firma de descripciones extendida en Task 3 y usada en publicar.ts. Contenido aditivo garantizado (null → render actual). ✔
