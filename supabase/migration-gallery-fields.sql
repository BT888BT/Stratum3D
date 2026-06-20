-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Gallery metadata fields (run on existing database)
-- Adds name / material / category to gallery_images.
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.gallery_images add column if not exists name     text;
alter table public.gallery_images add column if not exists material text;
alter table public.gallery_images add column if not exists category text;

-- Progressive (blur-up / LQIP) loading support:
--   display_path — storage path of an auto-generated, web-optimized WebP that
--                  the grid actually loads (original full upload is kept too).
--   blur_data    — tiny base64 data-URI placeholder, inlined in the API response
--                  so it renders instantly with no extra network request.
alter table public.gallery_images add column if not exists display_path text;
alter table public.gallery_images add column if not exists blur_data    text;
