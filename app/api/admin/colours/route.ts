import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function isAuthed() {
  const cookieStore = await cookies();
  const val = cookieStore.get("stratum3d_admin")?.value;
  return !!process.env.ADMIN_PASSWORD && val === process.env.ADMIN_PASSWORD;
}

// Toggle availability
export async function PATCH(request: Request) {
  if (!await isAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  const { id, available } = await request.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from("colours").update({ available }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Add new colour
export async function POST(request: Request) {
  if (!await isAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  const { name, hex } = await request.json();
  if (!name || !hex) return NextResponse.json({ error: "name and hex required." }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from("colours").insert({ name, hex, available: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Delete colour
export async function DELETE(request: Request) {
  if (!await isAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  const { id } = await request.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from("colours").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
