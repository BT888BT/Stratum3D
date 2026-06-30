-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Customer reviews migration (run on existing database)
-- Safe to run multiple times
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Customers leave a review by entering their order code (S3D-0001). We look the
-- order up to pull their FIRST name only (never the full name), store the review
-- as 'pending', and it only appears publicly once an admin approves it.
--   • body is capped at 100 characters and cannot be blank
--   • one review per order (unique order_id)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  order_number integer,
  first_name   text not null,
  body         text not null check (char_length(btrim(body)) between 1 and 100),
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now(),
  unique (order_id)
);

-- RLS: deny all to anon/authenticated. Every read/write goes through the
-- service-role API routes, matching the rest of the schema.
alter table public.reviews enable row level security;

drop policy if exists "deny all" on public.reviews;
create policy "deny all" on public.reviews
  for all to anon, authenticated using (false) with check (false);

-- Public reviews page lists approved reviews newest-first.
create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);
