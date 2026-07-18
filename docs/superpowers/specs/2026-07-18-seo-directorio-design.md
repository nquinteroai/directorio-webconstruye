# SEO del Directorio — contenido único, FAQ schema y GBP

**Fecha:** 2026-07-18
**Estado:** diseño aprobado por Nelson; pendiente de plan de implementación.

## Objetivo

Doble (decisión de Nelson):
- **Fase A — leads para la agencia:** que las páginas de categoría×zona del
  directorio posicionen en búsquedas locales ("cerrajería en Kennedy",
  "asadero en Soacha") y el tráfico llegue a fichas de ejemplo que canalizan
  el contacto hacia la agencia.
- **Fase B — infraestructura para clientes reales:** que cada cliente que
  compre web nazca con contenido único y un kit GBP que refuerce su SEO local.

## Contexto verificado (18-jul)

- Base técnica SEO ya lista: sitemap, robots, canónicas, JSON-LD
  (`src/lib/seo/jsonld.tsx`), OG images, ISR 3600 + revalidatePath, dominio
  `directorio.webconstruye.com` live, Search Console verificado con sitemap
  enviado.
- 87 negocios activos — TODOS de ejemplo, 0 reales — en 86 categorías, 2 zonas
  (Kennedy, Soacha). ~190 páginas estáticas.
- Las descripciones actuales son plantillas (`src/lib/sync/descripciones.ts`
  para el sync; los seeds usan fórmulas similares): contenido duplicado a
  escala, que Google trata mal.
- Rutas públicas: `/[zona]/[categoria]` (listado) y ficha de negocio.

## Decisiones de Nelson

1. Objetivo doble (A+B) por fases.
2. Producción de contenido: **Claude genera todo → Nelson muestrea 10-15
   páginas y aprueba el lote** (no revisión pieza por pieza).
3. GBP: **agencia ahora + kit documentado para cada cliente real**. Nunca
   crear GBP para negocios de ejemplo (política de Google).
4. Alcance = **Opción 1**: enriquecer páginas existentes. NO páginas por
   barrio, NO blog (riesgo de thin content / fase futura).

## Fase A

### A1. Contenido único por categoría×zona (~172 páginas)

- **Nueva tabla `contenido_zonal`**:
  - `id uuid pk`, `categoria_id uuid fk`, `zona_id uuid fk`,
    `unique(categoria_id, zona_id)`
  - `intro_html text` — 2-3 párrafos únicos es-CO (150-250 palabras): qué
    ofrece la categoría en esa zona, barrios que cubre, qué mirar al elegir,
    rangos de precio típicos cuando aplique. Sin relleno, sin keyword
    stuffing; útil para un vecino real.
  - `faqs jsonb` — array de 3-4 `{pregunta, respuesta}` específicas de la
    categoría en esa zona.
  - RLS: lectura pública, escritura solo admin (mismo patrón del resto).
- **Render**: la página `/[zona]/[categoria]` muestra `intro_html` en un
  bloque editorial debajo del listado y las FAQs al final (HTML accesible,
  `<details>` o headings — decisión de implementación).
- **Schema**: agregar **FAQPage** al JSON-LD de la página cuando hay faqs.
- **Aditivo**: sin fila en `contenido_zonal`, la página se renderiza como hoy.
- **Generación**: Claude produce las ~172 entradas por lotes (SQL directo a la
  BD), revalida ISR por lote; Nelson muestrea 10-15 páginas y aprueba el tono.
  Los textos deben variar de verdad entre zonas (no la misma frase con la
  zona cambiada).

### A2. Fichas de ejemplo únicas (87)

- Reescribir `descripcion_corta` (≤160) y `descripcion_larga` de los 87
  negocios de ejemplo: texto único por negocio usando sus datos reales de la
  BD (servicios, barrio, horarios). Sin la fórmula repetida "hace parte del
  Directorio Webconstruye…" en todas.
- Mismo flujo de lotes + muestreo.

### A3. GBP de la agencia

- Claude entrega un **paquete listo para pegar** (documento en `docs/`):
  nombre, categoría GBP, descripción optimizada (750 chars), lista de
  servicios, enlaces (webconstruye.com + directorio.webconstruye.com),
  horario, y pasos de creación/verificación.
- La creación y verificación del perfil la hace Nelson (cuenta Google
  propia); Claude no maneja esas credenciales.

## Fase B

### B1. Generador de descripciones del sync mejorado

- `src/lib/sync/descripciones.ts`: en vez de plantilla fija, componer el
  texto con los datos ricos del demo matcheado (servicios, barrio, horarios,
  zona) con variación estructural (varias plantillas base + ensamblado por
  datos) para que dos clientes de la misma categoría no queden con el mismo
  texto. Marcar en la ficha (campo existente o nota) que el texto es
  generado, para pulirlo desde /admin.
- Con test unitario (el repo ya tiene vitest y tests del sync).

### B2. Kit GBP por cliente

- Documento `docs/kit-gbp-cliente.md` (junto a
  `proceso-venta-a-directorio.md`): checklist por venta — crear/reclamar GBP
  del cliente, categoría correcta, descripción única, enlazar su web nueva Y su ficha
  del directorio (backlink de ida y vuelta), fotos mínimas, primer post.
  Parte del entregable de cada venta.

## Fuera de alcance

- Páginas por barrio (thin content con 0 negocios reales).
- Blog / guías (fase futura cuando haya datos de Search Console).
- GBP para negocios de ejemplo (prohibido por políticas de Google).
- Link building externo.

## Verificación

- Muestreo de Nelson (10-15 páginas por lote) antes de dar por bueno el tono.
- Rich Results Test de Google sobre 2-3 URLs con FAQPage.
- tsc + lint + tests existentes en verde; test nuevo para B1.
- Search Console (ya montado) para monitorear indexación — se revisa en
  sesiones futuras, no bloquea esta entrega.
