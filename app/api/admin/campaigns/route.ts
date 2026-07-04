import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { THEME_REGISTRY } from "@/lib/campaigns";

// Seasonal campaigns admin API — appearance only. Bust the cached campaign
// lookup after every mutation so the live site reflects changes right away.
function bust() {
  revalidateTag("campaigns");
}

const VALID_THEMES = new Set(Object.keys(THEME_REGISTRY));

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Create a custom campaign (the 12 seasonal ones come from the migration; this
// is for anything extra the admin wants to add).
export async function POST(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await request.json();
  const { name, themeKey, bannerMessage, promoCode, startsAt, endsAt } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof themeKey !== "string" || !VALID_THEMES.has(themeKey)) {
    return NextResponse.json({ error: "Choose a valid theme." }, { status: 400 });
  }
  if (typeof bannerMessage !== "string" || bannerMessage.trim().length < 2) {
    return NextResponse.json({ error: "Banner message is required." }, { status: 400 });
  }
  const start = new Date(startsAt as string);
  const end = new Date(endsAt as string);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Start and end dates are required." }, { status: 400 });
  }
  if (end.getTime() <= start.getTime()) {
    return NextResponse.json({ error: "End must be after start." }, { status: 400 });
  }

  const slug = `${slugify(name)}-${start.getFullYear()}`;

  const supabase = createAdminClient();
  const { error } = await supabase.from("campaigns").insert({
    slug,
    name: name.trim(),
    theme_key: themeKey,
    banner_message: bannerMessage.trim(),
    promo_code: typeof promoCode === "string" && promoCode.trim() ? promoCode.trim() : null,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    enabled: true,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A campaign with that slug already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  bust();
  return NextResponse.json({ success: true });
}

// Toggle enabled, or edit the editable content of a campaign.
export async function PATCH(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await request.json();
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const update: Record<string, unknown> = {};

  if ("enabled" in body) {
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "enabled must be a boolean." }, { status: 400 });
    }
    update.enabled = body.enabled;
  }
  if ("bannerMessage" in body) {
    if (typeof body.bannerMessage !== "string" || body.bannerMessage.trim().length < 2) {
      return NextResponse.json({ error: "Banner message is required." }, { status: 400 });
    }
    update.banner_message = body.bannerMessage.trim();
  }
  if ("promoCode" in body) {
    const p = body.promoCode;
    update.promo_code = typeof p === "string" && p.trim() ? p.trim() : null;
  }
  if ("themeKey" in body) {
    if (typeof body.themeKey !== "string" || !VALID_THEMES.has(body.themeKey)) {
      return NextResponse.json({ error: "Choose a valid theme." }, { status: 400 });
    }
    update.theme_key = body.themeKey;
  }
  if ("startsAt" in body) {
    const d = new Date(body.startsAt);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "Start date is invalid." }, { status: 400 });
    update.starts_at = d.toISOString();
  }
  if ("endsAt" in body) {
    const d = new Date(body.endsAt);
    if (isNaN(d.getTime())) return NextResponse.json({ error: "End date is invalid." }, { status: 400 });
    update.ends_at = d.toISOString();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  update.updated_at = new Date().toISOString();

  const supabase = createAdminClient();
  const { error } = await supabase.from("campaigns").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  bust();
  return NextResponse.json({ success: true });
}

// Delete a campaign.
export async function DELETE(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  bust();
  return NextResponse.json({ success: true });
}
