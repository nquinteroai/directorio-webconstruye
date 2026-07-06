# Directorio Webconstruye

Directorio local de negocios (Kennedy, Bogotá y Soacha) de una agencia web:
los negocios listados son clientes de la agencia. SEO local + tracking de
contactos (WhatsApp/llamada/web/cómo llegar) para reportes mensuales.

**Todo el contenido, UI, slugs y mensajes en español de Colombia (es-CO).**

## Stack (pineado — no subir de versión mayor sin decisión explícita)

- Next.js **15** (App Router) · React 19 · TypeScript estricto · Tailwind **v4**
- shadcn/ui (estilo `base-nova`, componentes en `src/components/ui`)
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`) — schema en `supabase/schema.sql`
- Leaflet + react-leaflet v5 (OpenStreetMap, sin API keys)
- Fuentes: Fraunces (display, `font-heading`) + Plus Jakarta Sans (`font-sans`)

## Comandos

- `npm run dev` — desarrollo (Turbopack)
- `npm run build` — build de producción (webpack; el flag --turbopack se quitó a propósito)
- `npm run lint` — ESLint

## Decisiones de arquitectura (no romper)

- **Páginas públicas = SSG/ISR** (`revalidate = 3600` + `revalidatePath` desde admin).
  Nada de contenido público solo-cliente.
- **Tracking compatible con ISR**: `vista_ficha` vía beacon cliente → `POST /api/track`;
  botones de contacto vía `/ir/[tipo]/[slug]` (302 + INSERT en `clicks`). Nunca
  registrar vistas en el render del servidor (la página está cacheada).
- **RLS**: lectura pública solo de activos/aprobadas; escrituras solo admin
  (tabla `admins` + `es_admin()`); `clicks`/`resenas` se insertan SOLO desde el
  servidor con `SUPABASE_SERVICE_ROLE_KEY` (sin políticas de escritura anon).
- **"Abierto ahora"** se calcula en el cliente con `Intl` y zona `America/Bogota`.
- Config de marca/dominio/WhatsApp agencia: `config/site.ts` (alias `@/config/site`).
  Zonas y categorías viven en la BD (se administran desde /admin).
- Modo claro únicamente. Paleta cálida (crema/ámbar/terracota; verde = WhatsApp).

## Referencias

- Plan de construcción por fases: `docs/plan.md`
- Setup de Supabase paso a paso: `supabase/README.md`
- Tipos de BD (sincronizados a mano con el schema): `src/types/database.ts`
