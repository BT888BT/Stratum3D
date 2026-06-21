import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { discountCodeSchema } from "@/lib/validation";

// Create a new discount code
export async function POST(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const body = await request.json();
  const {
    code,
    discountType,
    discountValue,
    minSubtotalCents,
    maxDiscountCents,
    expiresAt,
  } = body as Record<string, unknown>;

  const parsedCode = discountCodeSchema.safeParse(code);
  if (!parsedCode.success) {
    return NextResponse.json(
      { error: "Code must be 3-32 characters: letters, numbers and dashes only." },
      { status: 400 }
    );
  }

  if (discountType !== "percent" && discountType !== "fixed") {
    return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
  }

  const value = Number(discountValue);
  if (!Number.isInteger(value) || value <= 0) {
    return NextResponse.json({ error: "Discount value must be a positive whole number." }, { status: 400 });
  }
  if (discountType === "percent" && value > 100) {
    return NextResponse.json({ error: "A percentage discount can't exceed 100%." }, { status: 400 });
  }

  const minSubtotal = Number(minSubtotalCents ?? 0);
  if (!Number.isInteger(minSubtotal) || minSubtotal < 0) {
    return NextResponse.json({ error: "Minimum subtotal is invalid." }, { status: 400 });
  }

  let maxDiscount: number | null = null;
  if (maxDiscountCents != null && maxDiscountCents !== "") {
    maxDiscount = Number(maxDiscountCents);
    if (!Number.isInteger(maxDiscount) || maxDiscount <= 0) {
      return NextResponse.json({ error: "Maximum discount cap is invalid." }, { status: 400 });
    }
  }

  let expiresIso: string | null = null;
  if (expiresAt) {
    const d = new Date(expiresAt as string);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Expiry date is invalid." }, { status: 400 });
    }
    expiresIso = d.toISOString();
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("discount_codes").insert({
    code: parsedCode.data,
    discount_type: discountType,
    discount_value: value,
    min_subtotal_cents: minSubtotal,
    max_discount_cents: discountType === "percent" ? maxDiscount : null,
    expires_at: expiresIso,
    active: true,
  });

  if (error) {
    // Unique violation → friendly message
    if (error.code === "23505") {
      return NextResponse.json({ error: "A code with that name already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Toggle active state
export async function PATCH(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id, active } = await request.json();
  if (!id || typeof active !== "boolean") {
    return NextResponse.json({ error: "id and active are required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("discount_codes").update({ active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Delete a code
export async function DELETE(request: Request) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
