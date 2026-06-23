-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — FULL DATABASE RESET (consolidated)
-- ⚠️  This DELETES all existing data.
--
-- This single file is the complete, current setup. It already includes
-- everything that used to live in the separate migration-*.sql files:
--   • gallery_images (+ name/material/category, blur/preview/display tiers)
--   • processed_webhook_events (Stripe idempotency)
--   • orders.delivery_method, quote_inputs.remove_supports
--   • colours.materials (per-material availability)
--   • check_rate_limit_atomic() + cleanup_expired() (search_path-hardened)
--   • anon read policies for colours + gallery
--   • auto-enable-RLS event trigger for any future tables
--
-- Run the WHOLE file once in Supabase → SQL Editor.
-- After running, see the STORAGE + CRON notes at the very bottom.
-- ═══════════════════════════════════════════════════════════════════════════

drop event trigger if exists enforce_rls_on_new_public_tables;

drop table if exists public.processed_webhook_events cascade;
drop table if exists public.gallery_images cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.rate_limits cascade;
drop table if exists public.admin_sessions cascade;
drop table if exists public.pending_uploads cascade;
drop table if exists public.order_status_history cascade;
drop table if exists public.quote_inputs cascade;
drop table if exists public.order_files cascade;
drop table if exists public.orders cascade;
drop table if exists public.colours cascade;
drop sequence if exists public.orders_order_number_seq;

create extension if not exists "pgcrypto";

-- ─── Orders ────────────────────────────────────────────────────────────────
create table public.orders (
  id                          uuid primary key default gen_random_uuid(),
  order_number                serial unique,
  created_at                  timestamptz not null default now(),
  customer_name               text not null,
  email                       text not null,
  phone                       text,
  status                      text not null default 'draft',
  currency                    text not null default 'AUD',
  subtotal_cents              integer not null default 0,
  shipping_cents              integer not null default 0,
  gst_cents                   integer not null default 0,
  total_cents                 integer not null default 0,
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  notes                       text,
  checkout_token              text unique,
  delivery_method             text default 'shipping',
  shipping_address_line1      text,
  shipping_address_line2      text,
  shipping_city               text,
  shipping_state              text,
  shipping_postcode           text,
  shipping_country            text default 'AU',
  tracking_number             text
);

-- ─── Order files ───────────────────────────────────────────────────────────
create table public.order_files (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references public.orders(id) on delete cascade,
  created_at         timestamptz not null default now(),
  original_filename  text not null,
  storage_path       text not null,
  mime_type          text,
  file_size_bytes    bigint not null,
  validation_status  text not null default 'pending'
);

-- ─── Quote inputs (one per file per order) ─────────────────────────────────
create table public.quote_inputs (
  id                           uuid primary key default gen_random_uuid(),
  order_id                     uuid not null references public.orders(id) on delete cascade,
  file_id                      uuid references public.order_files(id) on delete set null,
  original_filename            text,
  material                     text not null,
  colour                       text,
  wall_layers                  integer,
  infill_percent               integer,
  quantity                     integer not null default 1,
  bounding_box_x_mm            numeric(10,2),
  bounding_box_y_mm            numeric(10,2),
  bounding_box_z_mm            numeric(10,2),
  estimated_volume_cm3         numeric(10,2),
  estimated_print_time_minutes integer,
  shipping_method              text,
  remove_supports              boolean default false,
  line_total_cents             integer
);

-- ─── Order status history ──────────────────────────────────────────────────
create table public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  created_at timestamptz not null default now()
);

-- ─── Colours ───────────────────────────────────────────────────────────────
-- materials: NULL = available for every material; e.g. '{"PLA","PETG"}' limits it.
create table public.colours (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  hex        text not null default '#888888',
  available  boolean not null default true,
  sort_order integer not null default 0,
  materials  text[] default null,
  created_at timestamptz not null default now()
);

-- ─── Pending uploads (tracks batches before they become orders) ────────────
create table public.pending_uploads (
  id                uuid primary key default gen_random_uuid(),
  batch_id          uuid not null,
  storage_path      text not null unique,
  original_filename text not null,
  file_size_bytes   bigint,
  uploaded          boolean not null default false,
  consumed          boolean not null default false,
  ip_address        text,
  created_at        timestamptz not null default now(),
  expires_at        timestamptz not null default (now() + interval '1 hour')
);

create index idx_pending_uploads_batch on public.pending_uploads(batch_id);

-- ─── Admin sessions (random tokens with expiry) ───────────────────────────
create table public.admin_sessions (
  id         uuid primary key default gen_random_uuid(),
  token      text not null unique,
  ip_address text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index idx_admin_sessions_token on public.admin_sessions(token);

-- ─── Rate limits (persistent across serverless instances) ──────────────────
create table public.rate_limits (
  key        text primary key,
  count      integer not null default 1,
  window_end timestamptz not null
);

-- ─── Site settings (admin-controlled key/value store) ─────────────────────
create table public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('pickup_enabled',   'true'),
  ('ordering_enabled', 'true');

-- ─── Processed webhook events (Stripe idempotency) ────────────────────────
create table public.processed_webhook_events (
  id              uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type      text,
  processed_at    timestamptz not null default now()
);

create index idx_webhook_events_processed_at
  on public.processed_webhook_events(processed_at);

-- ─── Gallery images (3-tier progressive loading) ──────────────────────────
--   blur_data    — tier 1: tiny base64 data-URI, inlined for instant paint.
--   preview_path — tier 2: small low-quality WebP, loads fast for every image.
--   display_path — tier 3: high-quality web-optimized WebP swapped in after.
--   storage_path — the original full-quality upload (always kept).
create table public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  display_path text,
  preview_path text,
  blur_data    text,
  caption      text,
  name         text,
  material     text,
  category     text,
  sort_order   integer not null default 0,
  visible      boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── RLS: enable everywhere ────────────────────────────────────────────────
alter table public.orders                   enable row level security;
alter table public.order_files              enable row level security;
alter table public.quote_inputs             enable row level security;
alter table public.order_status_history     enable row level security;
alter table public.colours                  enable row level security;
alter table public.pending_uploads          enable row level security;
alter table public.admin_sessions           enable row level security;
alter table public.rate_limits              enable row level security;
alter table public.site_settings            enable row level security;
alter table public.processed_webhook_events enable row level security;
alter table public.gallery_images           enable row level security;

-- ─── RLS: deny-all by default (all app access goes through the service role) ─
create policy "deny all" on public.orders
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.order_files
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.quote_inputs
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.order_status_history
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.colours
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.pending_uploads
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.admin_sessions
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.rate_limits
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.site_settings
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.processed_webhook_events
  for all to anon, authenticated using (false) with check (false);
create policy "deny all" on public.gallery_images
  for all to anon, authenticated using (false) with check (false);

-- ─── RLS: targeted public-read policies ───────────────────────────────────
-- Permissive policies combine with OR, so these grant read access on top of
-- deny-all for just the public-facing rows.
create policy "anon_read_colours" on public.colours
  for select to anon using (true);
create policy "anon_read_visible_gallery" on public.gallery_images
  for select to anon using (visible = true);

-- ─── Atomic rate-limit function (search_path hardened) ────────────────────
create or replace function public.check_rate_limit_atomic(
  p_key text,
  p_max_attempts integer,
  p_window_seconds integer
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (key, count, window_end)
  values (p_key, 1, now() + (p_window_seconds || ' seconds')::interval)
  on conflict (key) do update set
    count = case
      when public.rate_limits.window_end < now() then 1
      else public.rate_limits.count + 1
    end,
    window_end = case
      when public.rate_limits.window_end < now() then now() + (p_window_seconds || ' seconds')::interval
      else public.rate_limits.window_end
    end
  returning count into v_count;

  return v_count;
end;
$$;

-- ─── Cleanup function for expired data (search_path hardened) ─────────────
create or replace function public.cleanup_expired()
returns void
language sql
set search_path = ''
as $$
  delete from public.pending_uploads where expires_at < now();
  delete from public.admin_sessions where expires_at < now();
  delete from public.rate_limits where window_end < now();
  delete from public.processed_webhook_events
    where processed_at < now() - interval '7 days';
$$;

-- ─── Auto-enable RLS on any future public table ───────────────────────────
create or replace function public.auto_enable_rls_on_new_tables()
returns event_trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  obj record;
begin
  for obj in
    select *
    from pg_catalog.pg_event_trigger_ddl_commands()
    where command_tag = 'CREATE TABLE'
      and schema_name = 'public'
  loop
    execute format('alter table %I.%I enable row level security',
      obj.schema_name, obj.object_identity);
  end loop;
end;
$$;

revoke execute on function public.auto_enable_rls_on_new_tables() from anon, authenticated;

create event trigger enforce_rls_on_new_public_tables
  on ddl_command_end
  when tag in ('CREATE TABLE')
  execute function public.auto_enable_rls_on_new_tables();

-- ─── Seed colours ──────────────────────────────────────────────────────────
insert into public.colours (name, hex, available, sort_order) values
  ('Black',   '#1a1a1a', true,  1),
  ('White',   '#f5f5f5', true,  2),
  ('Grey',    '#888888', true,  3),
  ('Red',     '#dc2626', true,  4),
  ('Blue',    '#2563eb', true,  5),
  ('Green',   '#16a34a', true,  6),
  ('Yellow',  '#eab308', true,  7),
  ('Orange',  '#ea580c', true,  8),
  ('Natural', '#d4c5a9', true,  9);

-- ═══════════════════════════════════════════════════════════════════════════
-- AFTER RUNNING THIS FILE
--
-- 1. STORAGE BUCKETS (create in Supabase → Storage, both PRIVATE):
--      • gallery       — gallery images
--      • order-files   — customer STL uploads
--    The app signs URLs with the service role key, so keep them private.
--
-- 2. SCHEDULE CLEANUP (optional but recommended):
--      Database → Extensions → enable pg_cron, then run:
--        select cron.schedule(
--          'cleanup-expired-data',
--          '0 * * * *',
--          $$select public.cleanup_expired()$$
--        );
--
-- 3. ENV: the app needs SUPABASE_URL, SUPABASE_ANON_KEY and the
--    SUPABASE_SERVICE_ROLE_KEY for the new project set in your hosting env.
-- ═══════════════════════════════════════════════════════════════════════════
