# FASE 0 — Sincronización Ventas → Directorio Local

> **Documento de arquitectura (Fase 0) — pendiente de decisión sobre las
> preguntas abiertas de §2.4 antes de implementar.** No se escribe código de
> integración hasta resolverlas.

## Contexto

Cuando un vendedor cierra una venta en el CRM (webconstruye-ventas), el negocio
se convierte en cliente pagador de Webconstruye y debería aparecer en el
Directorio Local automáticamente, reusando los datos que la Fábrica de Demos ya
capturó (nombre, sector, foto, geolocalización) en vez de pedirlos otra vez.
Hoy no existe ningún puente entre los tres sistemas.

---

## Paso 1 — Hallazgos (verificados contra código y contra la cuenta de Supabase)

### 1.0 Topología real de Supabase — corrección importante a la premisa

La premisa era "Directorio usa un proyecto de Supabase separado del central".
Lo verificado (MCP de Supabase, `list_projects` + `list_tables`) es:

| Proyecto Supabase | Ref | Quién lo usa | Tablas relevantes |
|---|---|---|---|
| **Directorio-Webconstruye** (sa-east-1) | `ncfzuzcjkzkkbjrxdrgy` | **Directorio Y Fábrica de Demos** (y Publica) | `negocios`, `zonas`, `categorias`, `clicks`, `resenas` **+** `demo_negocios`, `demo_sectores`, `demo_vendedores`… |
| **Webconstruye** (us-west-1) | `kospwxjkbrblowxzqydf` | **webconstruye-ventas** (CRM) | `negocios` (OSM), `visitas`, `vendedores`, `calles`, `rutas_diarias` |

Consecuencias de diseño:

- **Los datos de Fábrica de Demos NO cruzan ninguna frontera**: viven en la
  misma base que el Directorio. El endpoint puede leer `demo_negocios` y el
  bucket `demo-fachadas` directamente con el service role que ya usa.
- **La única frontera real es CRM → Directorio** (dos proyectos Supabase
  distintos, sin acceso directo entre bases). Ahí sí aplica el endpoint interno
  con clave compartida.

### 1.1 Fábrica de Demos (`C:\proyectos\fabrica-demos`) — dónde están los datos del negocio

Todo en la tabla **`demo_negocios`** (tipos en `src/types/supabase.gen.ts:160-252`;
escritura en `crearDemo()`, `src/app/vendedor/acciones.ts:100-163`):

| Dato | Columna | Notas |
|---|---|---|
| Nombre | `nombre` (not null) | |
| Sector/rubro | `sector_id` → FK a `demo_sectores` | 26 sectores (`panaderia`, `restaurante`, `peluqueria`…) |
| Foto | `foto_fachada_url` | Bucket **`demo-fachadas`**, ruta `{negocioId}/{uuid}.webp`, ya comprimida a WebP ≤300KB (`src/lib/imagenes.ts:23-39`) |
| Logo | `logo_url` | Columna existe; subida no implementada aún |
| Geolocalización | `latitud`, `longitud` (nullables), `direccion` (not null), `ciudad`, `zona` | lat/lng pueden faltar |
| Contacto | `whatsapp` (obligatorio en el form, `^57\d{10}$`), `telefono` | Sin columna de sitio web propio |
| Estado comercial propio | `estado`: `demo → mostrado → interesado → vendido → descartado` | Pipeline interno de Demos, distinto al del CRM |

### 1.2 CRM de ventas (`C:\Users\Nelson\Documents\webconstruye-ventas`) — el evento disparador

- **Pipeline de 7 estados** (enum `estado_visita` en `supabase/schema.sql:8-12`,
  UI en `lib/estados.ts`): `no_visitado`, `visitado`, `seguimiento`,
  `cotizacion_enviada`, **`venta`**, `no_interesado`, `cerrado_no_aplica`.
- **El evento que dispara el MRR es `estado = 'venta'`**. No es una transición
  modelada: es un INSERT en la tabla `visitas` con `estado='venta'`, que por el
  constraint `visitas_venta_con_montos` (`schema.sql:69-70`) obliga a traer
  `monto_setup` (pago inicial) y `monto_mensual` (mensualidad = MRR). El MRR se
  calcula en cliente filtrando `v.estado === "venta"` (`hooks/useMetricas.ts:92-106`).
- **Punto exacto en código**: `registrarVisita()` en
  `context/DatosProvider.tsx:238-263` — un insert de supabase-js **desde el
  navegador del vendedor** (UI: `guardar()` en `components/mapa/FichaNegocio.tsx:66-84`).
  ⚠️ **No existe ningún server action, API route ni Edge Function en el CRM**:
  no hay hoy ningún punto de servidor donde colgar la sincronización.
- Datos del negocio en el CRM (tabla `negocios` del proyecto `kospwxjk…`):
  `osm_id` (id de OpenStreetMap, único), `nombre`, `categoria` (valor OSM crudo),
  `lat`, `lng`, `calle`, `direccion`, `telefono`, `zona`. Sin plan contratado
  (solo montos libres en la visita), sin fotos, sin WhatsApp.

### 1.3 Vacíos detectados (afectan el diseño)

1. **No existe ningún id que vincule** el negocio del CRM (`osm_id`) con el de
   Demos (`demo_negocios.id`). El único puente es `demo_negocios.directorio_url`
   (texto libre, opcional). El emparejamiento CRM↔Demo tendrá que ser difuso
   (nombre normalizado + cercanía geográfica) o requerir un campo de enlace nuevo.
2. **El CRM no tiene superficie de servidor** donde disparar el POST de forma
   fiable (todo es cliente + RLS).
3. **El Directorio exige campos que nadie captura hoy**: `descripcion_corta`
   (≤160, es la meta description), `descripcion_larga`, `horarios`, `servicios`,
   `categoria_id`/`zona_id` propios (UUIDs de su taxonomía). Un listado creado
   solo con datos de CRM+Demo quedaría incompleto para SEO.

---

## Paso 2 — Propuesta de arquitectura

### 2.1 Flujo propuesto

```
CRM (Supabase kospwxjk…)                    Directorio (Vercel + Supabase ncfzuz…)
─────────────────────────                   ──────────────────────────────────────
INSERT en visitas                            POST /api/internal/businesses
  estado='venta'                               1. valida clave compartida
       │                                       2. valida payload (zod)
       ▼                                       3. idempotencia (evento_id)
trigger AFTER INSERT                           4. dedupe contra negocios existentes
  WHEN estado='venta'                          5. enriquece desde demo_negocios
       │                                          (misma BD: match por nombre
       ▼                                           normalizado + distancia lat/lng)
pg_net.http_post ──── HTTPS + secreto ────►   6. copia foto demo-fachadas → negocios
(Database Webhook)                             7. INSERT en negocios
                                               8. revalidatePath si publica
```

**Quién hace el POST: el proyecto Supabase del CRM, no su frontend.**
Recomendación: **Database Webhook** (trigger `AFTER INSERT ON visitas WHEN
(NEW.estado = 'venta')` + `pg_net.http_post`, secreto guardado en Vault de
Supabase). Razones frente a la alternativa de tocar `registrarVisita()` en el
cliente: (a) el CRM no tiene código de servidor y no habría que crearlo, (b) no
depende del navegador del vendedor (red móvil en campo), (c) sobrevive a
cambios de UI, (d) captura también ventas insertadas por scripts. Contra: el
reintento de pg_net es limitado — se mitiga con el diseño idempotente del
endpoint (reintentar es siempre seguro) y un log de sincronización consultable.

### 2.2 Contrato del endpoint (en el Directorio)

`POST /api/internal/businesses` — route handler Next.js, mismo patrón que
[src/app/api/track/route.ts](src/app/api/track/route.ts) (`clienteServicio()`
de `@/lib/supabase/admin`, `force-dynamic`). Coherente con la regla de
arquitectura existente: escrituras solo desde el servidor con service role,
cero políticas anon nuevas.

**Auth:** header `Authorization: Bearer <SYNC_INTERNAL_KEY>` — env var nueva en
Vercel (Directorio) y en Vault (CRM). Comparación con `crypto.timingSafeEqual`.
Sin clave o clave errónea → `401` sin cuerpo.

**Payload** (todo lo que el CRM sabe; el resto se enriquece del lado del Directorio):

```jsonc
{
  "evento_id": "uuid",            // id de la fila de visitas → clave de idempotencia
  "origen": "webconstruye-ventas",
  "negocio": {
    "osm_id": "node/123…",        // id externo estable del CRM
    "nombre": "…",                // requerido
    "categoria_osm": "bakery",    // valor crudo OSM; el Directorio lo mapea
    "lat": 4.6, "lng": -74.15,    // requeridos
    "direccion": "…",
    "telefono": "…",              // opcional
    "zona": "Kennedy"             // texto del CRM; el Directorio resuelve zona_id
  },
  "venta": {
    "fecha": "2026-07-12",
    "monto_setup": 250000,
    "monto_mensual": 60000
  }
}
```

**Validación:** zod estricto (tipos, rangos lat/lng, longitudes). Payload
inválido → `422` con detalle. **Idempotencia:** tabla nueva
`sync_eventos (evento_id uuid primary key, negocio_id, payload jsonb, resultado, created_at)`
en la BD del Directorio; `evento_id` repetido → `200` con el resultado original
(reintentos de pg_net inofensivos). **Dedupe de negocio:** si ya existe un
`negocios` con mismo `osm_id` registrado en `sync_eventos`, o nombre normalizado
(`f_unaccent`, ya existe en el schema) + distancia < ~150 m → no duplica; responde
`200 { "resultado": "ya_existia", "negocio_id": … }`.

**Respuestas:** `201 { negocio_id, slug, estado: "pendiente_revision" | "publicado" }`
· `200` (duplicado/idempotente) · `401` · `422` · `500` (con registro en `sync_eventos`).

### 2.3 De dónde sale cada campo del listado (reuso, no re-captura)

| Campo de `negocios` (Directorio) | Fuente | Cómo |
|---|---|---|
| `nombre`, `lat`, `lng`, `direccion`, `telefono` | Payload del CRM | directo (si hay match con demo, la dirección/coords del demo pueden ser más precisas — preferir demo) |
| `whatsapp` | `demo_negocios.whatsapp` | match difuso CRM↔demo en la misma BD (nombre normalizado con `f_unaccent` + distancia); si no hay demo, queda null |
| `foto_portada_url` | `demo_negocios.foto_fachada_url` | copia servidor-a-servidor del bucket `demo-fachadas` al bucket `negocios` (mismo proyecto, mismo service role) — copia, no hot-link, para que el ciclo de vida del demo no rompa la ficha |
| `logo_url` | `demo_negocios.logo_url` | ídem, si existe |
| `categoria_id` | mapeo `demo_sectores.id` → slug de `categorias` (26 sectores ≈ 25 categorías) con fallback al mapeo `categoria_osm` → categoría; tabla/constante de mapeo nueva | pendiente definir el mapeo exacto en implementación |
| `zona_id` | mapeo texto `zona` del CRM → `zonas.slug` (Kennedy, Soacha) | |
| `slug` | `generarSlug(nombre)` — ya existe en [src/lib/utils/slug.ts:7](src/lib/utils/slug.ts) | con sufijo numérico si colisiona |
| `plan` | `'web'` por defecto | el CRM solo tiene montos, no nombre de plan — ver pregunta abierta #3 |
| `fecha_ingreso` | `venta.fecha` | |
| `descripcion_corta`, `descripcion_larga`, `horarios`, `servicios`, `palabras_clave` | **nadie las captura hoy** | placeholder mínimo generado por sector + completar a mano — argumento fuerte para la revisión manual (pregunta abierta #1) |

Si se publica directamente (`activo=true`), el endpoint debe llamar
`revalidatePath` para home, zona, categoría y sitemap (mismo patrón de
`src/app/admin/(panel)/negocios/acciones.ts`).

### 2.4 Preguntas abiertas — para tu decisión (no las decidí)

**#1 — ¿Revisión manual antes de publicar, o publicación automática?**

| | Publicación automática (`activo=true`) | Borrador + revisión (`activo=false` + cola en /admin) |
|---|---|---|
| Pros | El cliente ve su listado minutos después de pagar (efecto "wow" de venta); cero trabajo operativo | Control de calidad de un dato público (nombre mal escrito por el vendedor en campo, foto borrosa, categoría mal mapeada); las descripciones/horarios se completan antes de indexarse; Google nunca ve fichas a medias |
| Contras | Fichas incompletas indexables (descripcion_corta es la meta description; horarios vacíos rompen "Abierto ahora"); un match difuso equivocado publicaría datos de otro negocio | El listado depende de que el admin revise (cuello de botella humano); el cliente no lo ve de inmediato |
| Punto medio posible | — | Auto-crear como borrador + notificación al admin; o publicar automático solo si el match con demo fue exacto y trae foto + WhatsApp |

**#2 — Vínculo CRM↔Demo:** ¿aceptamos match difuso (nombre+geo, con casos
ambiguos a revisión), o añadimos un campo de enlace (ej. `demo_slug` en la tabla
`negocios` del CRM, que el vendedor pega al crear el demo)? El campo explícito
elimina la ambigüedad pero añade un paso manual al vendedor.

**#3 — Campo `plan`:** el CRM no registra nombre de plan, solo montos. ¿Default
`'web'` siempre, o inferirlo por rangos de `monto_mensual`?

---

## Verificación (cuando se implemente — no en esta fase)

1. Unit: validación zod del payload, idempotencia, dedupe, mapeos sector/zona.
2. Integración local: `curl` con clave válida/inválida/payload repetido contra
   `npm run dev`; verificar fila en `negocios` + copia de foto en bucket.
3. E2E real: insertar una visita `estado='venta'` de prueba en el CRM (staging
   o fila marcada) → confirmar webhook disparado (logs pg_net) → listado creado
   en el Directorio → si publica: ficha visible tras revalidación → limpiar dato
   de prueba.

## Archivos que tocaría la implementación futura (referencia)

- **Directorio**: `src/app/api/internal/businesses/route.ts` (nuevo),
  `supabase/schema.sql` (+tabla `sync_eventos`), `src/lib/sync/` (mapeos, match,
  copia de foto), `src/types/database.ts`, `.env.example` (+`SYNC_INTERNAL_KEY`).
- **CRM (webconstruye-ventas)**: migración SQL con trigger + `pg_net.http_post`
  + secreto en Vault. Cero cambios de frontend.
- **Fábrica de Demos**: sin cambios (solo lectura de sus tablas/bucket).
