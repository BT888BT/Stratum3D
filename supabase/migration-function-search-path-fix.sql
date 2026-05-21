-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Fix mutable search_path on existing functions
-- Fixes Supabase Security Advisor warnings:
--   - function_search_path_mutable (check_rate_limit_atomic, cleanup_expired)
-- Safe to run on a live database — replaces functions in-place.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Fix: check_rate_limit_atomic ─────────────────────────────────────────
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

-- ─── Fix: cleanup_expired ─────────────────────────────────────────────────
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

-- ═══════════════════════════════════════════════════════════════════════════
-- HOW TO APPLY:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste the entire contents of this file and run it
--   3. Refresh the Security Advisor — the warnings should clear
-- ═══════════════════════════════════════════════════════════════════════════
