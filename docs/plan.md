# Plan — Directorio Webconstruye

## Contexto

Directorio local de negocios para una agencia de desarrollo web de Bogotá. Los negocios listados son clientes de la agencia; el directorio es su vitrina pública (SEO local en Kennedy y Soacha), registra cada clic de contacto (WhatsApp, llamada, sitio web, cómo llegar) para reportes mensuales que justifican la suscripción, y debe verse tan premium que sirva como argumento de venta puerta a puerta. La spec completa fue provista por el usuario (modelo de datos, páginas, admin, SEO, fases 1–8 y criterio de terminado); este plan la traduce a decisiones ejecutables.

**Entorno verificado:** Windows 11 + PowerShell, Node v22.23.1, npm 10.9.8, git 2.55. Carpeta `C:\Users\Nelson\directorio-webconstruye` contiene solo un `package.json` stub de `npm init` (se reemplaza al hacer scaffold). No es repo git aún.

## Stack (pineado)

- **Next.js 15** (App Router) — `create-next-app@15`, NO Next 16. React 19, TypeScript estricto, Tailwind CSS v4, ESLint.
- **shadcn/ui** (CLI `shadcn@latest`), íconos lucide-react.
- **Supabase**: `@supabase/supabase-js` + `@supabase/ssr` (Postgres, Auth, Storage). Proyecto nuevo e independiente.
- **Leaflet + OpenStreetMap** vía `react-leaflet@5` (compatible React 19). Sin API keys.
- **Deploy**: Vercel. Todo en español de Colombia (`lang="es-CO"`, zona horaria America/Bogota).

## Decisiones técnicas clave (lo que la spec dejaba abierto)

1. **Scaffold en dir no vacío**: `create-next-app@15` en subcarpeta temporal → mover contenido a la raíz (el package.json stub se reemplaza).
2. **Config editable**: `config/site.ts` = marca, dominio placeholder `https://DOMINIO-PENDIENTE.com`, WhatsApp de la agencia (placeholder `573000000000`), textos base. Zonas y categorías viven en la BD (CRUD admin → expandir sin tocar código).
3. **Tracking compatible con ISR** (punto crítico): las páginas públicas son estáticas → `vista_ficha` NO puede registrarse en el render del servidor. Solución: beacon cliente (`navigator.sendBeacon` → `POST /api/track`, 1 por visita). Botones de contacto → `/ir/[tipo]/[slug]` (route handler: INSERT en `clicks` + redirect 302, `rel="nofollow"`, bloqueado en robots).
4. **"Abierto ahora"**: componente cliente con `Intl` y timeZone `America/Bogota` (render inicial neutro para evitar hydration mismatch). Testeado con Vitest.
5. **Búsqueda**: Postgres full-text español (`websearch_to_tsquery('spanish')`) + `unaccent` (wrapper IMMUTABLE) + `pg_trgm`; columna generada tsvector con índice GIN; función RPC `buscar_negocios(q)`. Autocompletado: fetch con debounce a `/api/buscar` (usa la misma RPC). `/buscar?q=` server-side.
6. **RLS**: SELECT público solo registros `activo/aprobada=true`; INSERT anónimo SOLO en `clicks` (insert-only) y `resenas` (fuerza `aprobada=false` vía policy/trigger); escrituras totales solo rol autenticado (único usuario = admin; signups deshabilitados — documentado). Service role solo en server (estadísticas y tracking).
7. **Mapas**: import dinámico `ssr:false` + montaje perezoso con IntersectionObserver (Leaflet no entra en el bundle inicial ni bloquea LCP). Clustering con `leaflet.markercluster` activo solo si la zona supera ~25 pines.
8. **Imágenes admin**: compresión en cliente con `browser-image-compression` → WebP → Supabase Storage (bucket público `negocios`, subcarpetas logos/portadas/galeria). Render con `next/image` (remotePatterns → dominio Supabase).
9. **OG images**: `next/og` (`ImageResponse`) vía `opengraph-image.tsx` en ficha, zona y zona×categoría + imagen default.
10. **Gráficos admin**: Recharts vía componente Chart de shadcn (solo carga en /admin; no pesa en público). Diseño según skill `dataviz`.
11. **Revalidación**: `revalidate = 3600` en públicas + `revalidatePath` (ficha, listados, home, sitemap) desde las server actions del admin.
12. **Tests**: Vitest (utilidades: horarios/abierto-ahora, slug, link WhatsApp, texto de reporte) + Playwright smoke (home, zona, categoría, ficha, buscar, 404) contra build de producción.
13. **Diseño**: paleta cálida y confiable (crema/ámbar/terracota + verde reservado para WhatsApp/abierto), tipografía con carácter vía `next/font` (candidata: Fraunces display + Plus Jakarta Sans texto; se valida con skill frontend-design en Fase 2). Modo claro único. Mobile-first real: barra de contacto fija inferior en la ficha.
14. **Usuario admin**: no se puede crear vía SQL Editor de forma soportada → instrucciones exactas (Dashboard → Authentication → Add user) en `supabase/README.md` + README raíz, incluyendo cómo cambiar contraseña y cómo deshabilitar signups.

## Skills — inventario y asignación

Encontradas: **~240 skills de usuario** (`~/.claude/skills`) + **13 plugins oficiales** (superpowers, frontend-design, supabase, vercel, playwright/context7, code-review, etc.). No hay skills de proyecto. **"Taste" e "Impeccable" NO existen** en este entorno → su rol (vara de calidad visual) lo cubren: `frontend-design` (oficial), `ui-ux-pro-max`, `motion-design` y `dataviz`.

| Fase | Skills a invocar/releer |
|---|---|
| Proceso (todo el proyecto) | superpowers:brainstorming (hecho), superpowers:writing-plans (este plan), superpowers:executing-plans, superpowers:verification-before-completion, superpowers:systematic-debugging (si hay bugs), tdd (utilidades), TaskCreate para seguimiento |
| F1 Base | vercel:nextjs, vercel:shadcn, supabase:supabase, supabase:supabase-postgres-best-practices |
| F2 Fichas | frontend-design, ui-ux-pro-max, vercel:react-best-practices |
| F3 Listados/búsqueda | programmatic-seo, site-architecture, seo-content-writer (textos únicos es-CO), copywriting |
| F4 Mapas | context7 (docs react-leaflet v5 / leaflet) |
| F5 Tracking | supabase (policies insert-only) |
| F6 Admin | supabase (auth/storage), dataviz (gráficas), vercel:shadcn (tablas/forms), motion-design |
| F7 SEO | seo-audit, technical-seo-audit, schema + schema-markup-generator (JSON-LD), performance-diagnosis, llms-txt (bonus AEO) |
| F8 Pulido/deploy | frontend-design (relectura crítica), qa, webapp-testing + playwright, github-readme (README es), vercel:deploy, verification-before-completion |

No aplican (se descartan en bloque): marketing pagado (ads/google-ads/facebook-ads/…), email/CRM (emails, klaviyo, braze…), ventas/prospección, documentos office (pptx/docx/xlsx), three.js, figma, notion, shopify, remotion/video, etc.

## Modelo de datos (`supabase/schema.sql`)

Tablas según spec: `zonas`, `categorias`, `negocios`, `resenas`, `clicks` — con FKs, CHECKs (calificación 1–5, plan `web|mantenimiento|premium`, tipo de click), trigger `updated_at`, extensiones `unaccent` + `pg_trgm`, columna generada de búsqueda + GIN, RPC `buscar_negocios`, RLS completa (según decisión 6) y policies de Storage. `supabase/seed.sql`: 2 zonas (Kennedy ~4.63,-74.152 zoom 14; Soacha ~4.579,-74.217 zoom 14), 25 categorías de barrio con ícono lucide y orden, 10 negocios realistas (5 Kennedy + 5 Soacha: restaurante, barbería, ferretería, droguería, taller de motos / panadería, peluquería, papelería, veterinaria, odontología — coords dentro de cada zona, horarios jsonb `{lun:{abre,cierra}|null,…}`, descripciones largas únicas ≥300 chars, servicios, palabras clave, 3 destacados, reseñas aprobadas de muestra).

## Mapa de rutas

```
src/app/
  (publico)/ layout (header+footer con enlaces zona×categoría)
    page.tsx                      → Home (buscador+autocomplete, zonas, categorías, destacados, CTA agencia, texto SEO)
    [zona]/page.tsx               → Landing zona (H1, texto único, mapa, filtros, tarjetas)
    [zona]/[categoria]/page.tsx   → Landing nicho zona×categoría (corazón SEO)
    negocio/[slug]/page.tsx       → Ficha completa + opengraph-image.tsx
    categorias/ | buscar/ | terminos/ | privacidad/
  admin/login + admin/(panel)/ → dashboard, negocios (CRUD+preview+mapa picker+imágenes), resenas, estadisticas por negocio (+ botón "Copiar reporte" WhatsApp), zonas, categorias
  ir/[tipo]/[slug]/route.ts     → tracking 302
  api/track (beacon vistas) | api/buscar (autocomplete)
  sitemap.ts | robots.ts | not-found.tsx (404 con buscador)
middleware.ts                    → protege /admin (Supabase SSR session)
src/lib/ supabase/{server,client,admin} · queries/ · seo/{jsonld,metadata} · utils/{horarios,slug,whatsapp,reporte}
config/site.ts · supabase/{schema.sql,seed.sql,README.md}
```

JSON-LD: `LocalBusiness` (con mapping categoría→@type específico: Restaurant, HairSalon, Dentist…, fallback LocalBusiness), `BreadcrumbList` en todas, `WebSite+SearchAction` en home, `ItemList` en listados. `generateStaticParams` + `dynamicParams=true` (zonas/categorías nuevas funcionan sin redeploy gracias a ISR).

## Fases (ejecución en orden y de corrido; al final de cada una: `npm run build` limpio + commit git + resumen corto en español)

1. **Base** — `git init` + scaffold pineado a Next 15 + Tailwind v4 + shadcn init, estructura de carpetas, `config/site.ts`, `schema.sql` + `seed.sql` completos + `supabase/README.md` (qué pegar en el SQL Editor, crear admin, deshabilitar signups), `.env.example`, tipos TS del dominio. **Al cerrar esta fase aviso al usuario para que cree el proyecto en supabase.com, pegue los 2 SQL y pase URL + anon key + service_role para `.env.local`** (la construcción de F2–F3 puede avanzar en paralelo mientras tanto).
2. **Datos y fichas** — clientes Supabase (server/client/admin), queries tipadas, ficha `/negocio/[slug]` completa (portada, badges, rating, horarios "Abierto ahora", servicios, galería lightbox, reseñas + formulario, compartir, barra móvil fija) con datos del seed.
3. **Listados y búsqueda** — home, `/[zona]`, `/[zona]/[categoria]`, `/categorias`, `/buscar` + autocomplete, textos SEO únicos, breadcrumbs, "Negocios similares".
4. **Mapas** — Leaflet perezoso en zona/categoría/ficha, picker en admin (F6), clusters condicionales.
5. **Tracking** — `/ir/[tipo]/[slug]` + beacon de vistas + fuente (`ficha|listado|busqueda`).
6. **Admin** — auth + middleware, dashboard, CRUD negocios (upload comprimido WebP, mapa picker, horarios amigables, slug auto, preview, toggles), reseñas, estadísticas + "Copiar reporte", CRUD zonas/categorías, revalidación on-demand.
7. **SEO** — generateMetadata en todo, JSON-LD, sitemap dinámico, robots, OG images, llms.txt, auditoría Lighthouse móvil ≥95×4 y corrección.
8. **Pulido y deploy** — revisión de diseño con ojo crítico (releer frontend-design), estados vacíos, 404 con buscador, Vitest + Playwright smoke, README completo en español, deploy Vercel + checklist post-lanzamiento (dominio, Search Console, sitemap).

## Verificación end-to-end (criterio de terminado)

`npm run build` limpio · seed carga 10 negocios visibles en el sitio · crear negocio desde admin con fotos → visible publicado (revalidación) · JSON-LD válido (validator.schema.org) · sitemap.xml generado · Lighthouse móvil ≥95 en Performance/Accessibility/Best Practices/SEO (contra `next start` de producción, `npx lighthouse` emulación móvil) · README permite el deploy sin ayuda. Smoke tests Playwright verdes.

## Decisiones del usuario (confirmadas)

- **Supabase**: el usuario crea el proyecto en supabase.com; pega `schema.sql` + `seed.sql` en el SQL Editor siguiendo mis instrucciones y entrega URL + anon key + service_role para `.env.local`. Yo verifico todo en vivo con esas credenciales.
- **Git**: sí — `git init` en Fase 1 y un commit limpio al cerrar cada fase (autorizado explícitamente).
- **Ritmo**: ejecución continua con resumen por fase (opción recomendada, asumida); solo me detengo si necesito algo del usuario (credenciales) o ante un fallo que no pueda arreglar.
