# Directorio Webconstruye

Directorio local de negocios de **Kennedy (Bogotá)** y **Soacha (Cundinamarca)**.
Es la vitrina pública de los clientes de la agencia: cada negocio tiene una
ficha profesional pensada para aparecer en Google y convertir búsquedas en
contactos reales (WhatsApp, llamadas, visitas al sitio web y rutas de llegada),
todos registrados para los reportes mensuales de la agencia.

**Características**

- 🔎 Búsqueda instantánea con autocompletado (full-text en español, sin tildes)
- 📍 Landings SEO por zona (`/kennedy`) y por zona×categoría (`/kennedy/restaurantes`)
- 📄 Fichas completas: fotos, horarios con "Abierto ahora", mapa, reseñas moderadas
- 💬 Botones de contacto con tracking (WhatsApp, llamar, sitio web, cómo llegar)
- 🛠️ Panel `/admin`: CRUD de negocios con fotos comprimidas a WebP, estadísticas
  por negocio y botón "Copiar reporte" listo para WhatsApp
- 🥇 SEO técnico: JSON-LD (LocalBusiness), sitemap dinámico, OG images, Lighthouse móvil ≥95
- 🧩 Zonas y categorías se administran desde el panel: **expandir no requiere tocar código**

**Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Supabase (Postgres, Auth, Storage) · Leaflet + OpenStreetMap · Vercel.

---

## Requisitos

- Node.js 20 o superior (probado con Node 22)
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- Una cuenta gratuita en [vercel.com](https://vercel.com) (para publicar)

## 1. Configurar Supabase (~10 minutos)

Sigue la guía paso a paso: **[`supabase/README.md`](./supabase/README.md)**.
En resumen:

1. Crea un proyecto nuevo (región São Paulo).
2. Pega y ejecuta [`supabase/schema.sql`](./supabase/schema.sql) en el SQL Editor.
3. Pega y ejecuta [`supabase/seed.sql`](./supabase/seed.sql) (2 zonas, 25
   categorías y 10 negocios de ejemplo).
4. Crea el usuario administrador (Authentication → Add user) y regístralo en la
   tabla `admins` con el SQL del paso 4 de la guía.
5. Desactiva el registro público de usuarios ("Allow new users to sign up").
6. Copia la URL del proyecto, la clave `anon` y la `service_role`.

## 2. Correr en local

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno: copia .env.example a .env.local
#    (en PowerShell)
Copy-Item .env.example .env.local
#    y completa los 3 valores de Supabase del paso anterior.

# 3. Levantar el sitio
npm run dev
```

Abre <http://localhost:3000>. El panel está en <http://localhost:3000/admin>
(entra con el correo y contraseña del usuario admin que creaste).

> Sin `.env.local` el sitio también compila y corre, pero mostrará estados
> vacíos hasta que conectes Supabase.

## 3. Pruebas

```bash
npm test          # pruebas unitarias (horarios, slugs, WhatsApp, reportes)
npm run build     # build de producción (obligatorio antes del e2e)
npm run test:e2e  # smoke tests con Playwright
                  # (la primera vez: npx playwright install chromium)
```

Los smoke tests de rutas con datos (zona, categoría, ficha) se activan
automáticamente cuando existe `.env.local`.

## 4. Publicar en Vercel

### Opción A — con GitHub (recomendada)

1. Sube el repositorio a GitHub (privado está bien).
2. En [vercel.com](https://vercel.com): **Add New → Project → importa el repo**.
   Vercel detecta Next.js solo; no cambies nada del build.
3. En **Environment Variables** agrega las 4 variables de `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SITE_URL`
   (por ahora usa la URL `*.vercel.app` que te asignen).
4. Clic en **Deploy**.

### Opción B — desde la terminal

```powershell
npx vercel login
npx vercel          # primer deploy (preview)
npx vercel --prod   # producción
```

Agrega las variables con `npx vercel env add NOMBRE` o desde el dashboard.

### Conectar el dominio definitivo

1. En Vercel: **Settings → Domains → Add** y sigue las instrucciones de DNS.
2. Actualiza `NEXT_PUBLIC_SITE_URL` con el dominio final (ej.
   `https://directorio.tudominio.com`) y haz **Redeploy**. Esto corrige
   canónicas, sitemap, OG images y JSON-LD de una sola vez.

## 5. Checklist post-lanzamiento

- [ ] Dominio conectado y `NEXT_PUBLIC_SITE_URL` actualizado + redeploy
- [ ] Reemplazar el WhatsApp placeholder de la agencia en
      [`config/site.ts`](./config/site.ts) (`agenciaWhatsapp`)
- [ ] [Google Search Console](https://search.google.com/search-console):
      verificar la propiedad del dominio
- [ ] Enviar el sitemap: `https://TU-DOMINIO/sitemap.xml`
- [ ] Validar una ficha en <https://validator.schema.org> y en
      <https://search.google.com/test/rich-results>
- [ ] Cargar los negocios reales desde `/admin` y desactivar los 10 de ejemplo
- [ ] Confirmar en Supabase que el registro público sigue desactivado
- [ ] Probar en un celular real: buscar → ficha → botón WhatsApp → verificar
      que el clic queda en las estadísticas del panel

## Operación diaria (equipo de la agencia)

| Tarea | Dónde |
|---|---|
| Crear/editar un negocio (fotos, horarios, mapa) | `/admin/negocios` |
| Aprobar o rechazar reseñas | `/admin/resenas` |
| Ver estadísticas y **copiar el reporte mensual** para el cliente | `/admin/negocios/{id}/estadisticas` |
| Agregar una zona o categoría nueva | `/admin/zonas` · `/admin/categorias` |
| Cambiar nombre del directorio / WhatsApp de la agencia | [`config/site.ts`](./config/site.ts) |

Al guardar cualquier cambio en el panel, el sitio público se regenera al
instante (revalidación on-demand).

## Estructura del proyecto

```
config/site.ts          → marca, dominio, WhatsApp de la agencia
supabase/               → schema.sql, seed.sql y guía de configuración
src/app/(publico)/      → home, zonas, categorías, fichas, búsqueda, legales
src/app/admin/          → panel (login + gestión completa)
src/app/ir/             → redirecciones 302 con registro de clics
src/app/api/            → autocompletado y beacon de vistas
src/components/         → publico/ · negocio/ · admin/ · mapas/ · ui/ (shadcn)
src/lib/                → queries, supabase (3 clientes), seo, utils
tests/                  → unitarias (Vitest) y e2e (Playwright)
docs/                   → plan de construcción y sistema de diseño
```

---

Hecho por **Webconstruye** · Bogotá, Colombia.
