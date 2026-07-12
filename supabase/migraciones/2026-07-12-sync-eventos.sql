-- ============================================================================
-- MIGRACIÓN: tabla sync_eventos (sincronización CRM → Directorio)
-- Para instalaciones existentes. En instalaciones nuevas ya viene incluida
-- en schema.sql (sección 11).
-- ============================================================================

-- Registro de cada venta que reporta webconstruye-ventas. Cumple tres roles:
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
