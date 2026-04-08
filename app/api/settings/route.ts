import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — returns non-sensitive site settings for the storefront
export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("key", "pickup_enabled")
    .single();

  return NextResponse.json({
    pickupEnabled: data?.value !== "false",
  });
}
