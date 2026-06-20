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

  // Sign two tiers per image (each falls back gracefully for older rows /
  // before the migration is run):
  //   high    — display copy, else the original
  //   preview — low-quality copy, else the high tier
  const highPaths = images.map(i => i.display_path || i.storage_path);
  const previewPaths = images.map(i => i.preview_path || i.display_path || i.storage_path);

  const [highSigned, previewSigned] = await Promise.all([
    supabase.storage.from("gallery").createSignedUrls(highPaths, 86400),
    supabase.storage.from("gallery").createSignedUrls(previewPaths, 86400),
  ]);

  if (highSigned.error) {
    console.error("[gallery] Signed URL error:", highSigned.error.message);
    return NextResponse.json({ error: "Failed to load images." }, { status: 500 });
  }

  const result = images.map((img, i) => {
    const url = highSigned.data?.[i]?.signedUrl ?? null;
    // previewUrl is only meaningfully different when a real preview exists;
    // null tells the client to skip the low tier and go blur → high.
    const previewSignedUrl = previewSigned.data?.[i]?.signedUrl ?? null;
    return {
      id: img.id,
      caption: img.caption,
      name: img.name ?? null,
      material: img.material ?? null,
      category: img.category ?? null,
      // blurData: tiny inline placeholder that paints instantly (no extra request)
      blurData: img.blur_data ?? null,
      previewUrl: img.preview_path ? previewSignedUrl : null,
      url,
    };
  }).filter(i => i.url);

  return NextResponse.json(result);
}
