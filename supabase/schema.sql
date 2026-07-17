-- ============================================================================
-- DIRECTORIO WEBCONSTRUYE — ESQUEMA DE BASE DE DATOS
-- ============================================================================
-- Pegar este archivo COMPLETO en el SQL Editor de Supabase y ejecutarlo UNA
-- vez, ANTES de seed.sql. Instrucciones detalladas en supabase/README.md.
--
-- Modelo de seguridad:
--   · Lectura pública (anon): solo registros activos/aprobados.
--   · Escritura: únicamente el administrador (tabla `admins` + es_admin()).
--   · clicks y resenas se insertan SOLO desde el servidor (service_role);
--     no existe ninguna política de escritura para anon.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONES
-- ----------------------------------------------------------------------------
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Wrapper IMMUTABLE de unaccent (requerido para columnas generadas e índices).
create or replace function public.f_unaccent(texto text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, texto)
$$;

comment on function public.f_unaccent(text) is
  'unaccent marcado IMMUTABLE para usarlo en columnas generadas e índices.';

-- ----------------------------------------------------------------------------
-- 2. UTILIDADES
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. ADMINISTRADORES
-- ----------------------------------------------------------------------------
-- Autorización real: no basta con "estar autenticado", hay que estar en esta
-- tabla. El usuario admin se crea en el Dashboard (Authentication → Add user)
-- y luego se registra aquí (ver supabase/README.md, paso 4).
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nota       text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Cada admin puede verificar su propia membresía (lo usa es_admin()).
create policy "admins: leer propia membresia"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ¿El usuario autenticado actual es administrador?
create or replace function public.es_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid())
  )
$$;

-- ----------------------------------------------------------------------------
-- 4. ZONAS
-- ----------------------------------------------------------------------------
create table public.zonas (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre          text not null,
  ciudad          text not null,
  departamento    text not null,
  descripcion_seo text not null,
  lat             double precision not null,
  lng             double precision not null,
  zoom            integer not null default 14 check (zoom between 3 and 19),
  activa          boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.zonas enable row level security;

create policy "zonas: lectura publica de activas"
  on public.zonas for select
  to anon
  using (activa);

create policy "zonas: admin lee todas"
  on public.zonas for select
  to authenticated
  using ((select public.es_admin()));

create policy "zonas: admin inserta"
  on public.zonas for insert
  to authenticated
  with check ((select public.es_admin()));

create policy "zonas: admin actualiza"
  on public.zonas for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create policy "zonas: admin elimina"
  on public.zonas for delete
  to authenticated
  using ((select public.es_admin()));

-- ----------------------------------------------------------------------------
-- 5. CATEGORÍAS
-- ----------------------------------------------------------------------------
create table public.categorias (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre          text not null,
  icono           text not null default 'Store', -- nombre de ícono lucide
  descripcion_seo text not null default '',
  orden           integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.categorias enable row level security;

create policy "categorias: lectura publica"
  on public.categorias for select
  to anon
  using (true);

create policy "categorias: admin lee todas"
  on public.categorias for select
  to authenticated
  using ((select public.es_admin()));

create policy "categorias: admin inserta"
  on public.categorias for insert
  to authenticated
  with check ((select public.es_admin()));

create policy "categorias: admin actualiza"
  on public.categorias for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create policy "categorias: admin elimina"
  on public.categorias for delete
  to authenticated
  using ((select public.es_admin()));

create index idx_categorias_orden on public.categorias (orden, nombre);

-- ----------------------------------------------------------------------------
-- 6. NEGOCIOS
-- ----------------------------------------------------------------------------
create table public.negocios (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre            text not null,
  categoria_id      uuid not null references public.categorias (id) on delete restrict,
  zona_id           uuid not null references public.zonas (id) on delete restrict,
  -- Máx. 160 caracteres: se usa como meta description de la ficha.
  descripcion_corta text not null check (char_length(descripcion_corta) <= 160),
  descripcion_larga text not null,
  direccion         text not null,
  barrio            text,
  lat               double precision not null,
  lng               double precision not null,
  telefono          text,
  -- Formato internacional colombiano: 57 + 10 dígitos (ej. 573001234567).
  whatsapp          text check (whatsapp is null or whatsapp ~ '^57[0-9]{10}$'),
  sitio_web         text check (sitio_web is null or sitio_web ~* '^https?://'),
  email             text,
  instagram         text,
  facebook          text,
  -- {"lun":{"abre":"08:00","cierra":"18:00"}, ..., "dom":null}
  horarios          jsonb not null default '{}'::jsonb,
  logo_url          text,
  foto_portada_url  text,
  galeria           text[] not null default '{}',
  servicios         text[] not null default '{}',
  palabras_clave    text[] not null default '{}',
  destacado         boolean not null default false,
  verificado        boolean not null default false,
  -- true = ficha de ejemplo (no cliente real): se muestra etiquetada y su
  -- contacto va a la agencia. Las fichas reales del sync quedan en false.
  es_ejemplo        boolean not null default false,
  activo            boolean not null default true,
  plan              text not null default 'web'
                    check (plan in ('web', 'mantenimiento', 'premium')),
  fecha_ingreso     date not null default current_date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Vector de búsqueda full-text en español, sin tildes. NO es una columna
  -- generada: to_tsvector() está marcada STABLE (no IMMUTABLE) en Postgres
  -- porque los diccionarios de búsqueda se pueden alterar en caliente, y una
  -- columna GENERATED exige que toda la expresión sea IMMUTABLE. Se recalcula
  -- con el trigger trg_negocios_actualizar_busqueda de abajo (patrón oficial
  -- de la documentación de Postgres para búsqueda de texto completo).
  busqueda          tsvector
);

create trigger trg_negocios_updated_at
  before update on public.negocios
  for each row execute function public.set_updated_at();

-- Recalcula `busqueda` en cada insert/update (reemplaza la columna generada;
-- ver comentario en la definición de la columna más arriba).
create or replace function public.negocios_actualizar_busqueda()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.busqueda :=
    setweight(to_tsvector('spanish'::regconfig, public.f_unaccent(coalesce(new.nombre, ''))), 'A') ||
    setweight(to_tsvector('spanish'::regconfig, public.f_unaccent(coalesce(array_to_string(new.servicios, ' '), '') || ' ' || coalesce(array_to_string(new.palabras_clave, ' '), ''))), 'B') ||
    setweight(to_tsvector('spanish'::regconfig, public.f_unaccent(coalesce(new.descripcion_corta, '') || ' ' || coalesce(new.descripcion_larga, '') || ' ' || coalesce(new.barrio, ''))), 'C');
  return new;
end;
$$;

create trigger trg_negocios_actualizar_busqueda
  before insert or update on public.negocios
  for each row execute function public.negocios_actualizar_busqueda();

alter table public.negocios enable row level security;

create policy "negocios: lectura publica de activos"
  on public.negocios for select
  to anon
  using (activo);

create policy "negocios: admin lee todos"
  on public.negocios for select
  to authenticated
  using ((select public.es_admin()));

create policy "negocios: admin inserta"
  on public.negocios for insert
  to authenticated
  with check ((select public.es_admin()));

create policy "negocios: admin actualiza"
  on public.negocios for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create policy "negocios: admin elimina"
  on public.negocios for delete
  to authenticated
  using ((select public.es_admin()));

-- Índices para listados y búsqueda.
create index idx_negocios_zona_categoria
  on public.negocios (zona_id, categoria_id) where activo;
create index idx_negocios_destacados
  on public.negocios (destacado desc, nombre) where activo;
create index idx_negocios_busqueda
  on public.negocios using gin (busqueda);
create index idx_negocios_nombre_trgm
  on public.negocios using gin (public.f_unaccent(nombre) extensions.gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 7. RESEÑAS
-- ----------------------------------------------------------------------------
create table public.resenas (
  id           uuid primary key default gen_random_uuid(),
  negocio_id   uuid not null references public.negocios (id) on delete cascade,
  nombre_autor text not null check (char_length(nombre_autor) between 2 and 80),
  calificacion integer not null check (calificacion between 1 and 5),
  comentario   text check (comentario is null or char_length(comentario) <= 1000),
  -- Solo se muestran públicamente tras aprobación del admin.
  aprobada     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.resenas enable row level security;

-- El público solo ve reseñas aprobadas. La inserción llega por el servidor
-- (service_role, que omite RLS y siempre fuerza aprobada = false).
create policy "resenas: lectura publica de aprobadas"
  on public.resenas for select
  to anon
  using (aprobada);

create policy "resenas: admin lee todas"
  on public.resenas for select
  to authenticated
  using ((select public.es_admin()));

create policy "resenas: admin actualiza"
  on public.resenas for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create policy "resenas: admin elimina"
  on public.resenas for delete
  to authenticated
  using ((select public.es_admin()));

create index idx_resenas_negocio
  on public.resenas (negocio_id, created_at desc) where aprobada;
create index idx_resenas_pendientes
  on public.resenas (created_at desc) where not aprobada;

-- ----------------------------------------------------------------------------
-- 8. CLICKS (tracking de contactos y vistas — sin datos personales)
-- ----------------------------------------------------------------------------
create table public.clicks (
  id         bigint generated always as identity primary key,
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  tipo       text not null
             check (tipo in ('whatsapp', 'llamada', 'sitio_web', 'como_llegar', 'vista_ficha')),
  fuente     text not null default 'ficha'
             check (fuente in ('ficha', 'listado', 'busqueda', 'home')),
  created_at timestamptz not null default now()
);

alter table public.clicks enable row level security;

-- Sin políticas de escritura: los INSERT llegan solo por el servidor con
-- service_role. El admin autenticado puede leer para estadísticas.
create policy "clicks: admin lee"
  on public.clicks for select
  to authenticated
  using ((select public.es_admin()));

create index idx_clicks_negocio_fecha on public.clicks (negocio_id, created_at desc);
create index idx_clicks_fecha on public.clicks (created_at desc);

-- ----------------------------------------------------------------------------
-- 9. BÚSQUEDA (RPC pública)
-- ----------------------------------------------------------------------------
-- Busca en nombre, servicios, palabras clave, descripciones y barrio.
-- Full-text en español (con stemming) + fallback por subcadena para
-- autocompletado ("pelu" → peluquerías). RLS aplica (security invoker):
-- el público solo obtiene negocios activos.
create or replace function public.buscar_negocios(
  q        text,
  p_zona   uuid default null,
  p_limite integer default 20
)
returns table (
  id                uuid,
  slug              text,
  nombre            text,
  descripcion_corta text,
  logo_url          text,
  foto_portada_url  text,
  destacado         boolean,
  verificado        boolean,
  zona_id           uuid,
  categoria_id      uuid,
  relevancia        real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with consulta as (
    select
      websearch_to_tsquery('spanish'::regconfig, public.f_unaccent(btrim(q))) as tsq,
      public.f_unaccent(btrim(q)) as texto
  )
  select
    n.id, n.slug, n.nombre, n.descripcion_corta, n.logo_url,
    n.foto_portada_url, n.destacado, n.verificado, n.zona_id, n.categoria_id,
    (ts_rank(n.busqueda, c.tsq)
      + case when public.f_unaccent(n.nombre) ilike '%' || c.texto || '%' then 0.6 else 0 end
      + case when n.destacado then 0.3 else 0 end)::real as relevancia
  from public.negocios n
  cross join consulta c
  where n.activo
    and char_length(btrim(q)) >= 2
    and (p_zona is null or n.zona_id = p_zona)
    and (
      n.busqueda @@ c.tsq
      or public.f_unaccent(n.nombre) ilike '%' || c.texto || '%'
    )
  order by relevancia desc, n.destacado desc, n.nombre
  limit least(greatest(p_limite, 1), 50)
$$;

-- ----------------------------------------------------------------------------
-- 10. STORAGE (imágenes de negocios)
-- ----------------------------------------------------------------------------
-- Bucket público de solo-lectura para visitantes; escribe únicamente el admin.
insert into storage.buckets (id, name, public)
values ('negocios', 'negocios', true)
on conflict (id) do nothing;

create policy "storage negocios: lectura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'negocios');

-- El upsert necesita INSERT + SELECT + UPDATE (los tres).
create policy "storage negocios: admin sube"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'negocios' and (select public.es_admin()));

create policy "storage negocios: admin actualiza"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'negocios' and (select public.es_admin()))
  with check (bucket_id = 'negocios' and (select public.es_admin()));

create policy "storage negocios: admin elimina"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'negocios' and (select public.es_admin()));

-- ----------------------------------------------------------------------------
-- 11. SYNC CRM → DIRECTORIO (publicación automática de ventas)
-- ----------------------------------------------------------------------------
-- Registro de cada venta que reporta webconstruye-ventas vía
-- POST /api/internal/businesses. Cumple tres roles:
--   1. Idempotencia: el PK evento_id (id de la visita en el CRM) impide que
--      un webhook reintentado duplique negocios.
--   2. Log de excepciones: resultado = 'sin_match' → la venta NO se publicó
--      (el match con su demo no alcanzó el umbral) y espera revisión manual.
--   3. Auditoría: payload y detalle (scores del match, avisos de fotos).
create table public.sync_eventos (
  evento_id  uuid primary key,
  origen     text not null,
  resultado  text not null default 'procesando'
             check (resultado in ('procesando', 'publicado', 'sin_match', 'duplicado', 'error')),
  negocio_id uuid references public.negocios (id) on delete set null,
  payload    jsonb not null,
  detalle    jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_sync_eventos_updated_at
  before update on public.sync_eventos
  for each row execute function public.set_updated_at();

alter table public.sync_eventos enable row level security;

-- Sin políticas de escritura: INSERT/UPDATE solo desde el servidor con
-- service_role (mismo modelo que clicks). El admin lee para revisar
-- excepciones (sin_match / error).
create policy "sync_eventos: admin lee"
  on public.sync_eventos for select
  to authenticated
  using ((select public.es_admin()));

create index idx_sync_eventos_pendientes
  on public.sync_eventos (created_at desc)
  where resultado in ('sin_match', 'error');

-- ============================================================================
-- FIN DEL ESQUEMA — ahora ejecuta seed.sql y sigue supabase/README.md
-- ============================================================================
