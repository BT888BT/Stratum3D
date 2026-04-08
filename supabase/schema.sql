-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — FULL DATABASE RESET
-- ⚠️  This DELETES all existing data
-- ═══════════════════════════════════════════════════════════════════════════

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
  shipping_address_line1      text,
  shipping_address_line2      text,
  shipping_city               text,
  shipping_state              text,
  shipping_postcode           text,
  shipping_country            text default 'AU'
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
  layer_height_mm              numeric(4,2),
  infill_percent               integer,
  quantity                     integer not null default 1,
  bounding_box_x_mm            numeric(10,2),
  bounding_box_y_mm            numeric(10,2),
  bounding_box_z_mm            numeric(10,2),
  estimated_volume_cm3         numeric(10,2),
  estimated_print_time_minutes integer,
  shipping_method              text,
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
create table public.colours (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  hex        text not null default '#888888',
  available  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Pending uploads (tracks batches before they become orders) ────────────
-- Enforces that only the original uploader can claim their files
create table public.pending_uploads (
  id              uuid primary key default gen_random_uuid(),
  batch_id        uuid not null,
  storage_path    text not null unique,
  original_filename text not null,
  file_size_bytes bigint,
  uploaded        boolean not null default false,
  consumed        boolean not null default false,
  ip_address      text,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '1 hour')
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

insert into public.site_settings (key, value) values ('pickup_enabled', 'true');

-- ─── RLS ───────────────────────────────────────────────────────────────────
alter table public.orders enable row level security;
alter table public.order_files enable row level security;
alter table public.quote_inputs enable row level security;
alter table public.order_status_history enable row level security;
alter table public.colours enable row level security;
alter table public.pending_uploads enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.rate_limits enable row level security;

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
alter table public.site_settings enable row level security;
create policy "deny all" on public.site_settings
  for all to anon, authenticated using (false) with check (false);

-- ─── Cleanup function for expired data ─────────────────────────────────────
create or replace function public.cleanup_expired()
returns void language sql as $$
  delete from public.pending_uploads where expires_at < now();
  delete from public.admin_sessions where expires_at < now();
  delete from public.rate_limits where window_end < now();
$$;

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
