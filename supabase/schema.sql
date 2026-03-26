create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  phone text,
  status text not null default 'draft',
  currency text not null default 'AUD',
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  gst_cents integer not null default 0,
  total_cents integer not null default 0,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  notes text
);

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  original_filename text not null,
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint not null,
  validation_status text not null default 'pending'
);

create table if not exists public.quote_inputs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  material text not null,
  colour text,
  layer_height_mm numeric(4,2),
  infill_percent integer,
  quantity integer not null default 1,
  bounding_box_x_mm numeric(10,2),
  bounding_box_y_mm numeric(10,2),
  bounding_box_z_mm numeric(10,2),
  estimated_volume_cm3 numeric(10,2),
  estimated_print_time_minutes integer,
  shipping_method text
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_files enable row level security;
alter table public.quote_inputs enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "deny all orders" on public.orders;
create policy "deny all orders"
on public.orders
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny all order_files" on public.order_files;
create policy "deny all order_files"
on public.order_files
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny all quote_inputs" on public.quote_inputs;
create policy "deny all quote_inputs"
on public.quote_inputs
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny all order_status_history" on public.order_status_history;
create policy "deny all order_status_history"
on public.order_status_history
for all
to anon, authenticated
using (false)
with check (false);

-- Add shipping address fields to orders
alter table public.orders
  add column if not exists shipping_address_line1 text,
  add column if not exists shipping_address_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postcode text,
  add column if not exists shipping_country text default 'AU';

-- Colour inventory managed by admin
create table if not exists public.colours (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hex text not null default '#888888',
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.colours enable row level security;

drop policy if exists "deny all colours" on public.colours;
create policy "deny all colours"
on public.colours for all to anon, authenticated
using (false) with check (false);

-- Seed default colours
insert into public.colours (name, hex, available, sort_order) values
  ('Black',   '#1a1a1a', true,  1),
  ('White',   '#f5f5f5', true,  2),
  ('Grey',    '#888888', true,  3),
  ('Red',     '#dc2626', true,  4),
  ('Blue',    '#2563eb', true,  5),
  ('Green',   '#16a34a', true,  6),
  ('Yellow',  '#eab308', true,  7),
  ('Orange',  '#ea580c', true,  8),
  ('Natural', '#d4c5a9', true,  9)
on conflict (name) do nothing;
