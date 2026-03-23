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
