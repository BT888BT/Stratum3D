import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  // Use admin client because the gallery bucket is private —
  // the anon key cannot generate signed URLs for private storage.
  const supabase = createAdminClient();
  // select("*") so the route keeps working even if the name/material/category
  // columns haven't been migrated in yet — missing columns are simply absent.
  const { data: images, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("visible", true)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[gallery] DB error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!images?.length) {
    return NextResponse.json([]);
  }

  // Sign the web-optimized display copy when it exists, otherwise the original.
  // (display_path may be absent for older rows / before the migration is run.)
  const paths = images.map(i => i.display_path || i.storage_path);
  const { data: signedUrls, error: signError } = await supabase.storage
    .from("gallery")
    .createSignedUrls(paths, 86400);

  if (signError) {
    console.error("[gallery] Signed URL error:", signError.message);
    return NextResponse.json({ error: "Failed to load images." }, { status: 500 });
  }

  const result = images.map((img, i) => ({
    id: img.id,
    caption: img.caption,
    name: img.name ?? null,
    material: img.material ?? null,
    category: img.category ?? null,
    // blurData: tiny inline placeholder that paints instantly (no extra request)
    blurData: img.blur_data ?? null,
    url: signedUrls?.[i]?.signedUrl ?? null,
  })).filter(i => i.url);

  return NextResponse.json(result);
}
