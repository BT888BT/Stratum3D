-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Seasonal Campaigns Migration
-- Drives the automatic holiday/sale look of the site: a themed announce bar,
-- an accent-colour swap and a light decoration layer. Appearance only — it
-- never touches checkout, quoting, pricing or discount logic.
--
-- Window rule: each campaign shows for the WEEK BEFORE its date, up to and
-- including the day itself. After that day the site is back to normal.
-- All timestamps are Perth time (+08, WA has no daylight saving).
--
-- Safe to run on a live database — every statement is idempotent and the seed
-- rows upsert on their slug, so re-running just refreshes the content.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Pre-fix: repair the auto-RLS event trigger ────────────────────────────
-- Same fix shipped in the discount-codes migration: an old version of this
-- function double-qualified the table name and broke every CREATE TABLE.
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
    execute format('alter table %s enable row level security', obj.object_identity);
  end loop;
end;
$fn$;

-- ─── Campaigns table ───────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  -- stable identifier, e.g. 'christmas-2026' — used for upserts
  slug           text not null unique,
  name           text not null,
  -- which visual theme to apply; the colours + decoration for each key live in
  -- app/globals.css and lib/campaigns.ts, NOT in the DB (keeps it CSP-safe/fast)
  theme_key      text not null,
  -- Perth-time window: [starts_at, ends_at]
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  enabled        boolean not null default true,
  banner_message text not null,
  -- reference text shown in the announce bar (e.g. 'HOPEKLJ'); the real code is
  -- created and managed by the admin in the discount-codes tool. Display only.
  promo_code     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Fast "what's live right now" lookups.
create index if not exists campaigns_window_idx
  on public.campaigns (enabled, starts_at, ends_at);

-- ─── Row Level Security ────────────────────────────────────────────────────
-- All access is via the service_role admin client, so anon/authenticated get
-- nothing. (Public reads happen server-side through the admin client too.)
alter table if exists public.campaigns enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'deny all') then
    create policy "deny all" on public.campaigns for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

-- ─── Seed: 12 events × 2026 & 2027 ─────────────────────────────────────────
-- WA/Australia dates, celebration + sale events only. promo_code is set on
-- every row as reference text; enable the matching code yourself when you want
-- it live. Re-running refreshes name/theme/message/dates but preserves enabled
-- toggles you've changed? No — upsert overwrites enabled too, so set your
-- on/off state in the admin AFTER seeding.
insert into public.campaigns (slug, name, theme_key, banner_message, promo_code, starts_at, ends_at) values
  -- New Year (1 Jan)
  ('newyear-2026',     'New Year 2026',                 'newyear',     'New year, fresh prints · Perth-based · Ships Australia-wide',        'HOPEKLJ', '2025-12-25 00:00:00+08', '2026-01-01 23:59:59+08'),
  ('newyear-2027',     'New Year 2027',                 'newyear',     'New year, fresh prints · Perth-based · Ships Australia-wide',        'HOPEKLJ', '2026-12-25 00:00:00+08', '2027-01-01 23:59:59+08'),
  -- Australia Day (26 Jan)
  ('australia-2026',   'Australia Day 2026',            'australia',   'Celebrate Australia Day · Proudly Perth-printed · Local turnaround', 'HOPEKLJ', '2026-01-19 00:00:00+08', '2026-01-26 23:59:59+08'),
  ('australia-2027',   'Australia Day 2027',            'australia',   'Celebrate Australia Day · Proudly Perth-printed · Local turnaround', 'HOPEKLJ', '2027-01-19 00:00:00+08', '2027-01-26 23:59:59+08'),
  -- Valentine's Day (14 Feb)
  ('valentines-2026',  'Valentine''s Day 2026',         'valentines',  'Print something they''ll love · Made in Perth · Ships Australia-wide','HOPEKLJ', '2026-02-07 00:00:00+08', '2026-02-14 23:59:59+08'),
  ('valentines-2027',  'Valentine''s Day 2027',         'valentines',  'Print something they''ll love · Made in Perth · Ships Australia-wide','HOPEKLJ', '2027-02-07 00:00:00+08', '2027-02-14 23:59:59+08'),
  -- Easter (Easter Sunday: 5 Apr 2026, 28 Mar 2027)
  ('easter-2026',      'Easter 2026',                   'easter',      'Hoppy Easter · Egg-cellent custom prints · Perth-based',             'HOPEKLJ', '2026-03-29 00:00:00+08', '2026-04-05 23:59:59+08'),
  ('easter-2027',      'Easter 2027',                   'easter',      'Hoppy Easter · Egg-cellent custom prints · Perth-based',             'HOPEKLJ', '2027-03-21 00:00:00+08', '2027-03-28 23:59:59+08'),
  -- Mother's Day (2nd Sun May: 10 May 2026, 9 May 2027)
  ('mothers-2026',     'Mother''s Day 2026',            'mothers',     'A gift as unique as she is · Made in Perth · Local turnaround',      'HOPEKLJ', '2026-05-03 00:00:00+08', '2026-05-10 23:59:59+08'),
  ('mothers-2027',     'Mother''s Day 2027',            'mothers',     'A gift as unique as she is · Made in Perth · Local turnaround',      'HOPEKLJ', '2027-05-02 00:00:00+08', '2027-05-09 23:59:59+08'),
  -- WA Day (1st Mon Jun: 1 Jun 2026, 7 Jun 2027)
  ('waday-2026',       'WA Day 2026',                   'waday',       'Happy WA Day · Proudly Perth-based · Ships Australia-wide',          'HOPEKLJ', '2026-05-25 00:00:00+08', '2026-06-01 23:59:59+08'),
  ('waday-2027',       'WA Day 2027',                   'waday',       'Happy WA Day · Proudly Perth-based · Ships Australia-wide',          'HOPEKLJ', '2027-05-31 00:00:00+08', '2027-06-07 23:59:59+08'),
  -- EOFY Sale (30 Jun)
  ('eofy-2026',        'EOFY Sale 2026',                'eofy',        'EOFY Sale · 10% off custom prints',                                 'HOPEKLJ', '2026-06-23 00:00:00+08', '2026-06-30 23:59:59+08'),
  ('eofy-2027',        'EOFY Sale 2027',                'eofy',        'EOFY Sale · 10% off custom prints',                                 'HOPEKLJ', '2027-06-23 00:00:00+08', '2027-06-30 23:59:59+08'),
  -- Mid-Year Sale (anchored mid-July)
  ('midyear-2026',     'Mid-Year Sale 2026',            'midyear',     'Mid-Year Deals · 10% off custom prints',                            'HOPEKLJ', '2026-07-07 00:00:00+08', '2026-07-14 23:59:59+08'),
  ('midyear-2027',     'Mid-Year Sale 2027',            'midyear',     'Mid-Year Deals · 10% off custom prints',                            'HOPEKLJ', '2027-07-07 00:00:00+08', '2027-07-14 23:59:59+08'),
  -- Father's Day (1st Sun Sep: 6 Sep 2026, 5 Sep 2027)
  ('fathers-2026',     'Father''s Day 2026',            'fathers',     'Print him something legendary · Made in Perth · Local turnaround',   'HOPEKLJ', '2026-08-30 00:00:00+08', '2026-09-06 23:59:59+08'),
  ('fathers-2027',     'Father''s Day 2027',            'fathers',     'Print him something legendary · Made in Perth · Local turnaround',   'HOPEKLJ', '2027-08-29 00:00:00+08', '2027-09-05 23:59:59+08'),
  -- Halloween (31 Oct)
  ('halloween-2026',   'Halloween 2026',                'halloween',   'Spooky-good custom prints · Perth-based · Ships Australia-wide',     'HOPEKLJ', '2026-10-24 00:00:00+08', '2026-10-31 23:59:59+08'),
  ('halloween-2027',   'Halloween 2027',                'halloween',   'Spooky-good custom prints · Perth-based · Ships Australia-wide',     'HOPEKLJ', '2027-10-24 00:00:00+08', '2027-10-31 23:59:59+08'),
  -- Black Friday · Cyber Monday (window ends on Cyber Monday: 30 Nov 2026, 29 Nov 2027)
  ('blackfriday-2026', 'Black Friday · Cyber Monday 2026','blackfriday','Black Friday · Cyber Monday · 10% off all custom prints',           'HOPEKLJ', '2026-11-23 00:00:00+08', '2026-11-30 23:59:59+08'),
  ('blackfriday-2027', 'Black Friday · Cyber Monday 2027','blackfriday','Black Friday · Cyber Monday · 10% off all custom prints',           'HOPEKLJ', '2027-11-22 00:00:00+08', '2027-11-29 23:59:59+08'),
  -- Christmas (25 Dec)
  ('christmas-2026',   'Christmas 2026',                'christmas',   'Merry Christmas from Stratum3D · Order early for the holidays',      'HOPEKLJ', '2026-12-18 00:00:00+08', '2026-12-25 23:59:59+08'),
  ('christmas-2027',   'Christmas 2027',                'christmas',   'Merry Christmas from Stratum3D · Order early for the holidays',      'HOPEKLJ', '2027-12-18 00:00:00+08', '2027-12-25 23:59:59+08')
on conflict (slug) do update set
  name           = excluded.name,
  theme_key      = excluded.theme_key,
  banner_message = excluded.banner_message,
  promo_code     = excluded.promo_code,
  starts_at      = excluded.starts_at,
  ends_at        = excluded.ends_at,
  updated_at     = now();

-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO APPLY:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this whole file and Run.
--   3. (Optional) In the admin, create/enable the 'HOPEKLJ' discount code in
--      Discount Codes so the referenced code actually works at checkout.
-- All access is via the service_role key (admin client) — no anon grants needed.
-- ═══════════════════════════════════════════════════════════════════════════
