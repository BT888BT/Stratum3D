import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// ─────────────────────────────────────────────────────────────────────────────
// Seasonal campaigns — appearance only.
// A campaign swaps the site accent colour, themes the announce bar and turns on
// a light decoration layer for the week leading up to a date. It never touches
// checkout, quoting, pricing or discount logic.
// ─────────────────────────────────────────────────────────────────────────────

export type Campaign = {
  id: string;
  slug: string;
  name: string;
  theme_key: string;
  starts_at: string;
  ends_at: string;
  enabled: boolean;
  banner_message: string;
  promo_code: string | null;
  created_at: string;
  updated_at: string;
};

// Decoration styles rendered by <HolidayDecor>. `neon` (sale events) intentionally
// renders no particles — those themes lean on the glowing announce bar instead, so
// the busiest shopping pages stay light. Everyone else gets a small particle count.
export type DecoType = "spark" | "heart" | "egg" | "dot" | "bat" | "snow" | "neon";

type ThemeMeta = { deco: DecoType; count: number };

// theme_key → decoration. Colours for each key live in globals.css (CSP-safe),
// keyed off <html data-campaign="...">. Keep this in sync with the seed data.
export const THEME_REGISTRY: Record<string, ThemeMeta> = {
  newyear:     { deco: "spark", count: 14 },
  australia:   { deco: "spark", count: 12 },
  valentines:  { deco: "heart", count: 12 },
  easter:      { deco: "egg",   count: 10 },
  mothers:     { deco: "heart", count: 12 },
  waday:       { deco: "dot",   count: 12 },
  eofy:        { deco: "neon",  count: 0 },
  midyear:     { deco: "neon",  count: 0 },
  fathers:     { deco: "dot",   count: 12 },
  halloween:   { deco: "bat",   count: 10 },
  blackfriday: { deco: "neon",  count: 0 },
  christmas:   { deco: "snow",  count: 16 },
};

export function themeMeta(themeKey: string): ThemeMeta {
  return THEME_REGISTRY[themeKey] ?? { deco: "neon", count: 0 };
}

// All enabled campaigns, cached. We cache the raw rows (not "what's active now")
// and recompute active-in-JS below so a page rendered from cache still flips at
// the right time. Busted by revalidateTag('campaigns') on any admin mutation and
// on an hourly timer as a safety net.
const getEnabledCampaigns = unstable_cache(
  async (): Promise<Campaign[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("enabled", true);
    if (error || !data) return [];
    return data as Campaign[];
  },
  ["enabled-campaigns"],
  { revalidate: 3600, tags: ["campaigns"] }
);

// The single campaign to show right now, or null. If windows overlap (e.g. New
// Year starting while Christmas is still on), the most imminent one wins — the
// row with the soonest ends_at.
export async function getActiveCampaign(): Promise<Campaign | null> {
  const campaigns = await getEnabledCampaigns();
  const now = Date.now();

  const active = campaigns.filter((c) => {
    const start = new Date(c.starts_at).getTime();
    const end = new Date(c.ends_at).getTime();
    return now >= start && now <= end;
  });

  if (active.length === 0) return null;

  active.sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
  return active[0];
}
