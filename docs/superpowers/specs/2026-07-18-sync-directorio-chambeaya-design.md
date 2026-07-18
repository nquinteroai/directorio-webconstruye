# Sync Directorio → Chambeaya (auto-publicar servicios vendidos)

**Fecha:** 2026-07-18
**Estado:** aprobado por Nelson (diseño); pendiente de plan de implementación.

## Objetivo

Cuando se vende una web a un negocio **de servicio** (plomero, fumigador,
fisioterapeuta a domicilio, etc.), además de publicarse su ficha en el
Directorio, el negocio debe **quedar registrado como trabajador en Chambeaya**
para poder ser encontrado/matcheado por WhatsApp. Nelson revisa y aprueba cada
uno antes de que sea matchable, avisado por un correo con bandera amarilla.

## Decisiones tomadas (Nelson, 2026-07-18)

1. **Elegibilidad depende del negocio**: entran categorías que pueden atender a
   domicilio o son puro-servicio; las tiendas/locales fijos no. (Mapa cerrado
   abajo.)
2. **Entra en `pendiente`, no matchable** hasta que Nelson lo apruebe en el
   admin de Chambeaya. El correo 🟡 es el disparador de esa revisión.
3. **Dos correos separados**: el de venta que ya manda el CRM (intacto) + uno
   nuevo 🟡 que manda Chambeaya al auto-publicar.
4. **Contador/Abogado**: primero se **separa** la categoría del Directorio
   "Contadores y abogados" en dos ("Contadores" y "Abogados"); luego cada una
   mapea 1-a-1 a su categoría de Chambeaya (que ya existen).

## Contexto verificado

- Chambeaya (`C:\proyectos\chambeaya`, Supabase `ydmjepzqeljmdjpmbjlj`, deploy a
  mano `npx vercel --prod`, branch master, sin remoto git). Taxonomía ampliada a
  33 categorías el 2026-07-18 (ya en prod).
- Directorio (`C:\Users\Nelson\Documents\directorio-webconstruye`, Supabase
  `ncfzuzcjkzkkbjrxdrgy`, deploy auto por GitHub main).
- Son **dos proyectos Supabase distintos** → la comunicación es por HTTP, no BD.
- El sync CRM→Directorio ya existe y funciona: `POST /api/internal/businesses`
  → `publicarVenta` (`src/lib/sync/publicar.ts`). Ahí, tras publicar, ya se
  conocen la **categoría final** (`categoriaSlug`), el **teléfono**, el
  **nombre** y la **zona** del negocio. Es el punto de enganche.
- Chambeaya guarda oficios en código (`lib/content/categorias.ts`); `workers`
  tiene `categorias text[]` libre (sin FK ni enum) y **`telefono` único**.
- El admin de Chambeaya (`app/admin/(panel)/page.tsx`) lista TODOS los workers
  con un form inline (`actualizarTrabajador`) para cambiar `estado_verificacion`
  + `disponible`. La página "Verificaciones" es SOLO para revisar cédulas
  (lee `verifications`), así que un negocio-desde-venta (sin cédula) **no**
  aparece ahí — aparece en la tabla de Trabajadores del panel principal.
- Chambeaya ya tiene correo cableado: `lib/notificaciones.ts` (`notificarAdmin`,
  `filaHtml`) vía Resend, con envs `RESEND_API_KEY` + `NOTIFICACIONES_EMAIL`.

## Arquitectura

```
Venta CRM ──► POST /api/internal/businesses (Directorio)
                    │  publicarVenta(): publica la ficha (como hoy)
                    │  si categoriaSlug ∈ MAPA_CHAMBEAYA y hay teléfono:
                    ▼
             POST {CHAMBEAYA_SYNC_URL} (Chambeaya, Bearer CHAMBEAYA_SYNC_KEY)
                    │  inserta worker estado='pendiente', disponible=false
                    ▼
             📧 notificarAdmin() → correo 🟡 "Revisar en Chambeaya"
```

El **Directorio orquesta** (sabe la categoría real y que la venta se publicó).
Chambeaya solo expone un endpoint interno que crea el worker — mismo molde que
`/api/internal/businesses`: clave compartida, apagado (503) sin la env.

## Fase 0 — Prerequisito: separar Contadores / Abogados (Directorio)

- BD `categorias` (`ncfzuzcjkzkkbjrxdrgy`):
  - `UPDATE` la fila `contadores-y-abogados` → `slug='contadores'`,
    `nombre='Contadores'`, ícono y `descripcion_seo` ajustados.
  - `INSERT` nueva fila `slug='abogados'`, `nombre='Abogados'`, ícono lucide
    (p. ej. `Scale`), `orden=86`, `descripcion_seo`.
- `src/lib/iconos.ts`: agregar el ícono de `abogados`; confirmar el de
  `contadores`.
- Negocio de ejemplo: el ejemplo actual de "Contadores y abogados" queda bajo
  "Contadores" (su `categoria_id` no cambia porque solo se renombró el slug);
  ajustar su nombre/descripción si menciona abogados. Crear **un negocio de
  ejemplo nuevo para "Abogados"** con foto de Pexels **curada viéndola** (Read
  del .jpg antes de subir) → bucket `negocios`, con `es_ejemplo=true`,
  `verificado=false`.
- Revisar `src/lib/sync/mapeos.ts` (`categoriaDeSector`): si algún sector de
  demo apuntaba a `contadores-y-abogados`, repuntarlo a `contadores` o
  `abogados` según corresponda.
- Verificar en local que ambas categorías salen bien antes de desplegar; el
  deploy del Directorio es auto por GitHub.

## Fase 1 — El sync + correo

### 1. Mapa (Directorio) — `src/lib/sync/chambeaya.ts`

`MAPA_CHAMBEAYA: Record<string, string[]>` (slug-directorio → ids-Chambeaya):

| Directorio | Chambeaya |
|---|---|
| `cerrajerias` | `cerrajeria` |
| `servicio-tecnico` | `electrodomesticos` |
| `sastrerias` | `costura` |
| `constructoras` | `construccion` |
| `peluquerias-y-barberias` | `belleza` |
| `fumigacion` | `fumigacion` |
| `vidrieria` | `vidrieria` |
| `lavanderias` | `lavanderia` |
| `alquiler-lavadoras` | `alquiler-lavadoras` |
| `chatarrerias` | `reciclaje` |
| `montallantas` | `montallantas` |
| `talleres` | `mecanico` |
| `veterinarias` | `veterinario` |
| `fisioterapia` | `fisioterapia` |
| `laboratorios-clinicos` | `toma-muestras` |
| `estudios-fotograficos` | `fotografia` |
| `tramites-gestoria` | `tramites` |
| `publicidad` | `publicidad` |
| `contadores` | `contador` |
| `abogados` | `abogado` |

Los slugs de Chambeaya deben coincidir exactamente con los `id` de
`lib/content/categorias.ts` de Chambeaya (validado contra esa lista).

### 2. Forward (Directorio) — helper `reenviarAChambeaya()`

Helper nuevo en `src/lib/sync/chambeaya.ts`, invocado desde `publicarVenta`
tras el `INSERT` exitoso del negocio (justo antes del `return` de `publicado`):

- Si `categoriaSlug ∉ MAPA_CHAMBEAYA` → no hacer nada (ni correo).
- Teléfono: preferir `whatsapp` (ya viene `57XXXXXXXXXX`), si no `telefono`;
  quedarse con los dígitos y normalizar a `57`+10 dígitos (misma regla que el
  registro de Chambeaya: si son 10 dígitos, anteponer `57`). Si el resultado no
  cumple `^57\d{10}$` → **no** forwardear, anotar aviso en `detalle`
  ("sin teléfono válido para Chambeaya").
- Zona Chambeaya: `soacha` si `zona.ciudad` es Soacha, si no `bogota`.
- `POST {CHAMBEAYA_SYNC_URL}` con Bearer `CHAMBEAYA_SYNC_KEY`, cuerpo:
  `{ evento_id, nombre, telefono, categorias: string[], zona, venta_fecha }`.
- **Fire-and-forget**: cualquier error de red/HTTP hacia Chambeaya se captura y
  se anota en `detalle.chambeaya`; **nunca** cambia el resultado de la
  publicación en el Directorio (el cliente ya quedó publicado).
- Si `CHAMBEAYA_SYNC_URL`/`KEY` no están en el entorno → feature apagada (no
  forward, sin error).

### 3. Endpoint (Chambeaya) — `app/api/internal/workers/route.ts`

- Apagado (503) si falta `SYNC_INTERNAL_KEY`. Bearer con `timingSafeEqual`
  (mismo patrón que el endpoint del Directorio).
- Valida el cuerpo (zod): nombre (2–120), telefono (`^57\d{10}$` tras
  normalizar), categorias (array no vacío de strings), zona, venta_fecha.
- `INSERT` en `workers`: `{ nombre, telefono, categorias, zonas: [zona],
  estado_verificacion: 'pendiente', disponible: false, notas: "Cliente del
  Directorio — venta {venta_fecha}, sin verificación de cédula" }`.
- **Idempotencia**: si el `INSERT` choca con la unicidad de `telefono`
  (código `23505`) → responder `200 { resultado: 'ya_existe' }` **sin** enviar
  correo (no duplica ni re-notifica).
- En inserción nueva → `after(() => notificarAdmin(...))` con el correo 🟡.
  También un `INSERT` en `audit_log` (evento `worker_desde_venta`) por
  trazabilidad, consistente con el resto de Chambeaya.

### 4. Correo 🟡 (Chambeaya)

- Asunto: `🟡 Revisar en Chambeaya: {nombre}`.
- Cuerpo (`filaHtml`): Nombre, Teléfono, Categorías (nombres, no ids), Origen
  ("Venta del Directorio — {fecha}"), y un enlace a
  `https://chambeaya.com/admin`.
- Texto que deje claro: "Se registró en **pendiente**; apruébalo y ponlo
  Disponible cuando confirmes que aplica a domicilio/servicio."

## Aprobación y estado

- El worker entra `pendiente` + `disponible=false` → aparece arriba de la tabla
  "Trabajadores" en `/admin`. Nelson lo pasa a `Aprobado` + `Disponible` y ya
  es matchable. No aparece en "Verificaciones" (solo cédulas).

## Envs nuevas

- **Chambeaya (Vercel `chambeaya`)**: `SYNC_INTERNAL_KEY` (gate del endpoint).
- **Directorio (Vercel `directorio-webconstruye`)**: `CHAMBEAYA_SYNC_URL`
  (`https://chambeaya.com/api/internal/workers`) + `CHAMBEAYA_SYNC_KEY`
  (mismo valor que `SYNC_INTERNAL_KEY` de Chambeaya). Setear por CLI con
  `printf` sin newline (lección aprendida: el pipe de PowerShell malforma la
  env). Sin ellas, la feature queda inerte.

## Fuera de alcance (YAGNI)

- No se toca el CRM ni el correo de venta existente.
- No se toca el flujo de cédula/selfie.
- No se construye el matching automático de Fase 1 de Chambeaya (aún no existe).
- No se hace UI nueva en el admin — se reutiliza la tabla de Trabajadores.
- No entran categorías tienda/local fijo (restaurante, droguería, odontología…).

## Casos borde

- Negocio sin teléfono válido → no se forwardea; queda anotado en el evento.
- Reproceso de la misma venta (`sync_directorio_reintentar`) → el Directorio
  solo forwardea en `publicado` (primera vez); si aun así reintenta, la
  unicidad de `telefono` en Chambeaya evita el duplicado y el segundo correo.
- Chambeaya caído/lento → publicación del Directorio intacta; el forward falla
  en silencio con aviso en `detalle`. (Sin reintento automático en v1; se puede
  reprocesar la venta manualmente.)
- Categoría vendida no elegible → no pasa nada en Chambeaya (correcto).
