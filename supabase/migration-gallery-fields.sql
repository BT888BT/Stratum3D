-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Gallery metadata fields (run on existing database)
-- Adds name / material / category to gallery_images.
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.gallery_images add column if not exists name     text;
alter table public.gallery_images add column if not exists material text;
alter table public.gallery_images add column if not exists category text;

-- Progressive (blur-up / LQIP) loading support — three visible tiers:
--   blur_data    — tier 1: tiny base64 data-URI placeholder, inlined in the API
--                  response so it renders instantly with no extra request.
--   preview_path — tier 2: small low-quality WebP that loads fast for every image
--                  so the whole grid looks "done" almost immediately.
--   display_path — tier 3: high-quality web-optimized WebP swapped in afterwards.
-- (The original full-quality upload is always kept untouched too.)
alter table public.gallery_images add column if not exists display_path text;
alter table public.gallery_images add column if not exists preview_path text;
alter table public.gallery_images add column if not exists blur_data    text;
