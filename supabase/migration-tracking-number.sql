-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — add a single tracking number per order
-- Safe to run on the live database: only adds a nullable column if missing.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.orders
  add column if not exists tracking_number text;
