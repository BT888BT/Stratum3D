import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  const body = await request.json();
  const supabase = createAdminClient();

  for (const [key, value] of Object.entries(body)) {
    await supabase
      .from("site_settings")
      .upsert({ key, value: String(value), updated_at: new Date().toISOString() });
  }

  return NextResponse.json({ success: true });
}
