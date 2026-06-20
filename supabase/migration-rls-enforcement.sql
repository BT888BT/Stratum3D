-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — RLS Enforcement Migration
-- Safe to run on a live database — all operations are idempotent.
-- Run this to fix the Supabase security alert: "rls_disabled_in_public"
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Ensure RLS is enabled on every known table ───────────────────────────
-- These are no-ops if RLS is already enabled.
alter table if exists public.orders                    enable row level security;
alter table if exists public.order_files               enable row level security;
alter table if exists public.quote_inputs              enable row level security;
alter table if exists public.order_status_history      enable row level security;
alter table if exists public.colours                   enable row level security;
alter table if exists public.pending_uploads           enable row level security;
alter table if exists public.admin_sessions            enable row level security;
alter table if exists public.rate_limits               enable row level security;
alter table if exists public.site_settings             enable row level security;
alter table if exists public.gallery_images            enable row level security;
alter table if exists public.processed_webhook_events  enable row level security;

-- ─── Add deny-all policies where missing ──────────────────────────────────
-- Each block is a no-op if the policy already exists.

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'deny all') then
    create policy "deny all" on public.orders for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'order_files' and policyname = 'deny all') then
    create policy "deny all" on public.order_files for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'quote_inputs' and policyname = 'deny all') then
    create policy "deny all" on public.quote_inputs for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'order_status_history' and policyname = 'deny all') then
    create policy "deny all" on public.order_status_history for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'colours' and policyname = 'deny all') then
    create policy "deny all" on public.colours for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'pending_uploads' and policyname = 'deny all') then
    create policy "deny all" on public.pending_uploads for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'admin_sessions' and policyname = 'deny all') then
    create policy "deny all" on public.admin_sessions for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'rate_limits' and policyname = 'deny all') then
    create policy "deny all" on public.rate_limits for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'deny all') then
    create policy "deny all" on public.site_settings for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'processed_webhook_events' and policyname = 'deny all') then
    create policy "deny all" on public.processed_webhook_events for all to anon, authenticated using (false) with check (false);
  end if;
end $$;

-- gallery_images uses a selective public-read policy instead of deny-all
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'gallery_images' and policyname = 'deny all') then
    create policy "deny all" on public.gallery_images for all to anon, authenticated using (false) with check (false);
  end if;
end $$;


-- ─── Auto-enable RLS on any new table created in public schema ────────────
-- Supabase recommends this pattern (added to their 2025 security playbook).
-- Prevents future tables from ever being created without RLS.

create or replace function public.auto_enable_rls_on_new_tables()
returns event_trigger
language plpgsql
security definer
-- Fixed search_path prevents search-path injection attacks
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

-- Revoke public execute — this is an internal event trigger, not a public API
revoke execute on function public.auto_enable_rls_on_new_tables() from anon, authenticated;

-- Drop and recreate so this migration is safe to re-run
drop event trigger if exists enforce_rls_on_new_public_tables;

create event trigger enforce_rls_on_new_public_tables
  on ddl_command_end
  when tag in ('CREATE TABLE')
  execute function public.auto_enable_rls_on_new_tables();


-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO APPLY:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste the entire contents of this file and run it
--   3. Refresh the Security Advisor — the alert should clear
--
-- SUPABASE MAY 30, 2026 CHANGE:
--   New tables will no longer be exposed to the Data API by default.
--   Your existing code is unaffected (uses service_role key).
--   For any new table you want public API access to, run:
--     grant select on public.<table> to anon;
-- ═══════════════════════════════════════════════════════════════════════════
