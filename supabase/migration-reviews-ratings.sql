-- ═══════════════════════════════════════════════════════════════════════════
-- STRATUM3D — Add star rating + printed-model label to reviews, and seed 20
-- temporary fill-in reviews (until real reviews start coming in).
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) New columns -------------------------------------------------------------
--    rating : 1–5 stars (defaults to 5 for any existing rows)
--    model  : short 1–2 word label of what they printed (e.g. "Dragon bust")
alter table public.reviews
  add column if not exists rating smallint not null default 5
    check (rating between 1 and 5),
  add column if not exists model text
    check (model is null or char_length(btrim(model)) <= 40);

-- 2) Allow seed reviews with no real order attached.
--    (Multiple NULLs are allowed under the existing unique(order_id).)
alter table public.reviews alter column order_id drop not null;

-- 3) Seed 20 fill-in reviews, already approved so they show on the public page.
--    created_at is staggered over the last ~2 months so they don't all share a
--    timestamp. Every body is under the 100-char CHECK limit.
insert into public.reviews (first_name, body, status, rating, model, created_at) values
  ('Jess',   'Great print quality and the colour was exactly what I wanted. Will order again.', 'approved', 5, 'Dragon bust',    now() - interval '2 days'),
  ('Tom',    'Fast turnaround and the part fit perfectly. Really happy with it.',              'approved', 5, 'Pi case',        now() - interval '4 days'),
  ('Aisha',  'Super helpful with my files and the finish was clean. Highly recommend.',        'approved', 5, 'Phone stand',    now() - interval '6 days'),
  ('Liam',   'Ordered a replacement bracket, came out solid and on time. Cheers.',             'approved', 4, 'Bracket',        now() - interval '8 days'),
  ('Mia',    'Lovely detail on a small figurine. Better than I expected.',                     'approved', 5, 'Figurine',       now() - interval '10 days'),
  ('Noah',   'Good price and quick delivery to Brisbane. No complaints.',                      'approved', 4, 'Desk organiser', now() - interval '12 days'),
  ('Chloe',  'They got back to me fast with a quote and the print was spot on.',               'approved', 5, 'Keychain set',   now() - interval '14 days'),
  ('Ethan',  'Strong PETG part, exactly the spec I needed for my drone.',                      'approved', 5, 'Drone frame',    now() - interval '16 days'),
  ('Sophie', 'Smooth layers and a tidy finish. Easy to deal with.',                            'approved', 4, 'Vase',           now() - interval '18 days'),
  ('Jack',   'Reprinted a broken clip and it works perfectly now. Thanks.',                    'approved', 5, 'Cable clips',    now() - interval '20 days'),
  ('Olivia', 'Beautiful matte black finish, looks professional.',                              'approved', 5, 'Enclosure',      now() - interval '23 days'),
  ('Lucas',  'Quick, friendly and the quality was great. Recommend to anyone.',                'approved', 5, 'GoPro mount',    now() - interval '26 days'),
  ('Grace',  'Nice work on a tricky model with fine detail. Very pleased.',                    'approved', 4, 'Miniatures',     now() - interval '29 days'),
  ('Henry',  'Solid prototype turnaround, helped me hit my deadline.',                         'approved', 5, 'Prototype',      now() - interval '33 days'),
  ('Ruby',   'Colour match was perfect and shipping was quick.',                               'approved', 5, 'Planter',        now() - interval '37 days'),
  ('Oscar',  'Good communication and a clean print. Will be back.',                            'approved', 3, 'Wall hook',      now() - interval '41 days'),
  ('Ava',    'Really impressed with the strength of the part. Top job.',                       'approved', 5, 'Gear',           now() - interval '45 days'),
  ('Leo',    'Easy ordering and the result looked exactly like the render.',                   'approved', 4, 'Controller stand', now() - interval '50 days'),
  ('Isla',   'Friendly service and a great finish on my keychain batch.',                      'approved', 5, 'Keychains',      now() - interval '55 days'),
  ('Max',    'Fair pricing and reliable quality. My go-to for prints now.',                    'approved', 3, 'Coaster set',    now() - interval '60 days');

-- ═══════════════════════════════════════════════════════════════════════════
-- LATER, once real reviews come in, remove the fill-ins:
--   delete from public.reviews where order_id is null;
-- Optional: re-tighten the schema afterwards (only if no real review is null):
--   alter table public.reviews alter column order_id set not null;
-- ═══════════════════════════════════════════════════════════════════════════
