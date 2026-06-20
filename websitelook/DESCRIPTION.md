# Stratum3D — Front Page Look & Layout

Everything in this folder is what produces the look and layout of the **main front page**
(the homepage). It's a Next.js (App Router) + React + TypeScript site. The visual style
is driven almost entirely by **CSS variables and utility classes in `app/globals.css`** —
copy that file and you get 90% of the look; the page files just arrange the content.

---

## File map (what each file does)

| File | Role |
|------|------|
| `app/page.tsx` | **The front page itself.** All the homepage sections (hero, stats, how-it-works, materials, gallery, testimonials, CTA). |
| `app/layout.tsx` | **The shell around every page.** Announce bar, sticky header/nav with hexagon logo, the centered `<main>` container, footer, and SEO/structured-data metadata. |
| `app/globals.css` | **The entire visual system.** Colour palette, fonts, cards, buttons, badges, animations, responsive rules. This is the heart of the "look". |
| `app/components/GalleryArt.tsx` | Generates the on-brand SVG artwork for each gallery tile (no photos needed). |
| `app/components/OrderToast.tsx` | The subtle "someone just ordered…" social-proof toast, bottom-left. |
| `lib/catalog.ts` | Data + types for materials, colours, qualities (the Materials section reads `MATERIALS` and `QUALITIES`). Also contains pricing logic the rest of the site uses. |
| `lib/mock-data.ts` | Fake content: shop stats, testimonials, gallery pieces, order feed. Feeds the homepage sections. |
| `public/favicon.svg`, `public/logo.png` | Brand icon assets referenced by the layout/metadata. |

> **Import alias:** files use `@/lib/...` which means "from the project root". It's set in
> `tsconfig.json` as `"@/*": ["./*"]`. If you copy into another project, either keep that
> alias or change the imports to relative paths.

---

## The visual identity (the "look")

All defined at the top of `app/globals.css` in `:root`.

**Mood:** dark, warm, industrial — a near-black brown background with a single hot-orange
accent. Feels like a workshop / 3D-printer studio.

**Colour palette**
- Backgrounds: `--bg #0e0a06` (page), `--bg2 #140f08`, `--surface #1a130a` (cards)
- Borders: `--border #2a1f12`, `--border-hi #3d2e1a`
- Text: `--text #f0e8dc` (warm off-white), `--text-dim #9e8a6e`, `--muted #6b5a3e`
- **Brand accent: `--orange #f97316`** (with `--orange-hi #fb923c`) — used for the logo,
  buttons, headings highlights, eyebrows, glows.
- Support: `--amber`, `--red`, `--green` (mostly for status badges elsewhere).

**Typography (3 Google Fonts, loaded at top of globals.css)**
- **Bebas Neue** → `.font-display`: tall, condensed, all-caps display font for every big heading.
- **Manrope** → body default: clean modern sans for paragraphs.
- **IBM Plex Mono** → `.font-mono` / `.eyebrow`: small, wide-letter-spaced, uppercase
  "technical" labels (the orange `eyebrow` tags above each section heading).

**Signature details**
- Orange glow on the primary button (`box-shadow` with orange), pulsing on the hero CTA (`.glow-pulse`).
- Section entrances fade up (`.fade-up`, `.fade-up-2`).
- Animated "layer lines" in the hero card mimic a print laying down filament (`.layer-visual` / `.layer-line`).
- Hexagon logo drawn inline as SVG in the header & footer (not an image file).

---

## Reusable building blocks (utility classes in globals.css)

These are the pieces you'd reuse on another site:

- `.eyebrow` — small orange uppercase mono label above a heading.
- `.font-display` — apply to any heading for the tall condensed caps look.
- `.card` — standard surface card (rounded, subtle border, hover lift/shadow).
- `.card-lg` — bigger padded card (used for the stats strip).
- `.card-orange` — gradient + orange-tinted card (hero spec card and the bottom CTA).
- `.btn-primary` — solid orange call-to-action button with glow. `.glow-pulse` adds the pulse.
- `.btn-ghost` — outlined secondary button.
- `.badge` — small mono pill (material strength tags).
- `.nav-link` — header nav item (dims, turns orange on hover).
- `.stat-num` / `.stat-label` — big orange number + mono caption (stats strip).
- `.gallery-grid` / `.gallery-tile` — responsive auto-fill grid of bordered tiles.
- `.announce-bar` — thin orange-tinted banner strip at the very top.
- Also included (used elsewhere on the site, handy to keep): `.input-field`, `.btn-danger`,
  status badges, `.timeline`, `.cube-3d`, `.trust-item`.

---

## Page layout, top to bottom

**Layout shell (`app/layout.tsx`) wraps everything:**
1. **Announce bar** — full-width orange-tinted strip: "Perth-based · Transparent pricing · …".
2. **Sticky header** — translucent blurred bar, max-width 1200px centered. Left: hexagon SVG
   logo + "STRATUM3D" wordmark (the "3D" in orange). Right: nav links + orange "Get Quote" button.
3. **`<main>`** — centered, `max-width: 1200px`, responsive `clamp()` padding. The page content renders here.
4. **Footer** — small logo, link row (Gallery/Guide/Privacy/Terms), copyright line in mono.
5. **OrderToast** — floating social-proof toast, fixed bottom-left.

**Front page sections (`app/page.tsx`), in order:**
1. **Hero** — two-column grid (`.quote-grid`, collapses to one column on mobile). Left: eyebrow,
   huge headline "YOUR DESIGN, PRINTED IN **PERTH.**", subtext, two buttons (primary glowing + ghost).
   Right: an orange "NOW PRINTING" spec card with the animated layer lines and a key/value spec list.
2. **Stats strip** — one `.card-lg` with an auto-fit grid of four big orange numbers (prints, rating, turnaround, repeat %). Pulls from `SHOP_STATS`.
3. **How it works** — centered eyebrow + heading, then three numbered `.card`s (01/02/03), each with an orange top-border.
4. **Materials** — three `.card`s built from `MATERIALS` (PLA/PETG/ABS), each top-bordered in the material's accent colour, with strength badge, tagline, description, and use/temp footer.
5. **Gallery preview** — `.gallery-grid` of the first 4 `GALLERY` pieces, each rendered with `GalleryArt` (generated SVG) + title + material/category caption.
6. **Testimonials** — three `.card`s from `TESTIMONIALS` with amber stars, quote, name, detail.
7. **CTA** — a big centered `.card-orange`: eyebrow, "LET'S PRINT SOMETHING" heading, subtext, primary button.

**Responsiveness:** handled by `@media (max-width: 768px)` in globals.css (`.quote-grid` → single
column, `.hidden-mobile` hides the hero card and some nav links) plus `clamp()` font sizes and gaps
throughout so things scale fluidly.

---

## How to reuse this look on another website

1. **Copy `app/globals.css`** and import it once globally. This alone gives you the palette,
   fonts, and all the component classes.
2. Keep the **three Google Fonts** import (line 1 of globals.css).
3. Use `app/layout.tsx` as the template for your **header/footer/shell**; swap the brand name,
   logo SVG, and nav links.
4. Use `app/page.tsx` as the template for **section structure**; replace the copy and swap
   `lib/catalog.ts` / `lib/mock-data.ts` with your own content (or hard-code text inline).
5. Recolour the brand by changing just `--orange` (and `--orange-hi`) in `:root` — everything
   accent-coloured follows automatically.

> Not React? You can still lift `globals.css` verbatim into any HTML site and reuse the same
> class names (`card`, `btn-primary`, `eyebrow`, `font-display`, etc.) on plain `<div>`s.
