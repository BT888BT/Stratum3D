-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Gallery metadata fields (run on existing database)
-- Adds name / material / category to gallery_images.
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.gallery_images add column if not exists name     text;
alter table public.gallery_images add column if not exists material text;
alter table public.gallery_images add column if not exists category text;
