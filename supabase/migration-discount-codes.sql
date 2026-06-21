-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Discount Codes Migration
-- Single-use discount codes applied to the PARTS SUBTOTAL only (never GST or
-- shipping). Safe to run on a live database — all operations are idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Pre-fix: repair the auto-RLS event trigger ────────────────────────────
-- An earlier version of auto_enable_rls_on_new_tables() double-qualified the
-- table name (alter table public."public.discount_codes" …) which made EVERY
-- new CREATE TABLE fail. Patch it here first so the create below succeeds.
-- (This is the same fixed definition now in migration-rls-enforcement.sql.)
create or replace function public.auto_enable_rls_on_new_tables()
returns event_trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  obj record;
begin
  for obj in
    select *
    from pg_catalog.pg_event_trigger_ddl_commands()
    where command_tag = 'CREATE TABLE'
      and schema_name = 'public'
  loop
    -- object_identity is already schema-qualified and correctly quoted, so
    -- pass it through with %s — %I would double-qualify it.
    execute format('alter table %s enable row level security',
      obj.object_identity);
  end loop;
end;
$fn$;

-- ─── Discount codes table ──────────────────────────────────────────────────
-- Codes are stored and compared in UPPERCASE (the app uppercases on the way in).
create table if not exists public.discount_codes (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  discount_type       text not null default 'percent'
                        check (discount_type in ('percent', 'fixed')),
  -- percent: a whole-number percentage 1-100
  -- fixed:   an amount in cents
  discount_value      integer not null check (discount_value > 0),
  active              boolean not null default true,
  expires_at          timestamptz,
  -- minimum parts subtotal (cents) required before the code can be applied
  min_subtotal_cents  integer not null default 0,
  -- optional cap (cents) on how much a percent code can take off
  max_discount_cents  integer,
  -- single-use bookkeeping
  used                boolean not null default false,
  redeemed_order_id   uuid references public.orders(id) on delete set null,
  redeemed_at         timestamptz,
  created_at          timestamptz not null default now()
);

-- Case-insensitive safety: codes are uppercased by the app, but enforce it here
-- too so a lowercase manual insert can't create a duplicate.
create unique index if not exists discount_codes_code_upper_idx
  on public.discount_codes (upper(code));

-- ─── Order columns ─────────────────────────────────────────────────────────
alter table public.orders add column if not exists discount_code  text;
alter table public.orders add column if not exists discount_cents integer not null default 0;

-- ─── Row Level Security ────────────────────────────────────────────────────
-- The enforce_rls_on_new_public_tables event trigger auto-enables RLS on new
-- tables, but we make it explicit + idempotent here regardless.
alter table if exists public.discount_codes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'discount_codes' and policyname = 'deny all') then
    create policy "deny all" on public.discount_codes for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO APPLY:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste the entire contents of this file and run it
--   All access happens via the service_role key (admin client), so no anon
--   grants are needed.
-- ═══════════════════════════════════════════════════════════════════════════
