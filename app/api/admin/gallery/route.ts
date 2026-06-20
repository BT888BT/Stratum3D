import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Sharp needs the Node.js runtime (not the Edge runtime).
export const runtime = "nodejs";

// Web-optimized display copy: capped width, WebP. The original full-quality
// upload is kept untouched; this is just what the gallery grid loads.
const DISPLAY_MAX_WIDTH = 1280;
const DISPLAY_QUALITY = 80;
// Tiny blur placeholder, inlined as a data URI for instant first paint.
const BLUR_WIDTH = 24;

// GET — list all gallery images for admin (including hidden)
export async function GET() {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const supabase = createAdminClient();
  const { data: images, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Always use signed URLs — getPublicUrl() returns a non-null string even for
  // private buckets, so the URL looks valid but fails at load time.
  const withUrls = await Promise.all(
    (images ?? []).map(async (img) => {
      const { data: signedData } = await supabase.storage
        .from("gallery")
        .createSignedUrl(img.storage_path, 3600);
      return { ...img, url: signedData?.signedUrl ?? null };
    })
  );

  return NextResponse.json(withUrls);
}

// POST — upload a new gallery image
export async function POST(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";
  const material = (formData.get("material") as string) ?? "";
  const category = (formData.get("category") as string) ?? "";

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  // Validate file type
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG and WebP images are accepted." }, { status: 400 });
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const originalBuf = Buffer.from(arrayBuf);
  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(storagePath, originalBuf, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Auto-generate a web-optimized display copy + a tiny inline blur placeholder.
  // If any of this fails we fall back to the original — the upload still works.
  let displayPath: string | null = null;
  let blurData: string | null = null;
  try {
    const base = sharp(originalBuf).rotate(); // honour EXIF orientation

    const displayBuf = await base
      .clone()
      .resize({ width: DISPLAY_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: DISPLAY_QUALITY })
      .toBuffer();

    const candidatePath = `display/${storagePath.replace(/\.[^.]+$/, "")}.webp`;
    const { error: displayErr } = await supabase.storage
      .from("gallery")
      .upload(candidatePath, displayBuf, { contentType: "image/webp", upsert: false });
    if (!displayErr) displayPath = candidatePath;

    const blurBuf = await base
      .clone()
      .resize({ width: BLUR_WIDTH })
      .webp({ quality: 40 })
      .toBuffer();
    blurData = `data:image/webp;base64,${blurBuf.toString("base64")}`;
  } catch (e) {
    console.error("[gallery] image processing failed, using original:", e);
  }

  // Get current max sort_order
  const { data: maxRow } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error: insertError } = await supabase.from("gallery_images").insert({
    storage_path: storagePath,
    display_path: displayPath,
    blur_data: blurData,
    caption: caption || null,
    name: name || null,
    material: material || null,
    category: category || null,
    sort_order: (maxRow?.sort_order ?? 0) + 1,
    visible: true,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH — toggle visibility
export async function PATCH(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id, visible } = await request.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from("gallery_images").update({ visible }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — remove image from storage and database
export async function DELETE(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await request.json();
  const supabase = createAdminClient();

  // Get storage paths first
  const { data: img } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("id", id)
    .single();

  if (img) {
    const paths = [img.storage_path, img.display_path].filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("gallery").remove(paths);
  }

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
