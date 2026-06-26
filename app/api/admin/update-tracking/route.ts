import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Adds (or corrects) the single tracking number on an order — for the case
// where it was forgotten at ship time or needs fixing. This silently saves the
// number and does NOT email the customer; the tracking email only goes out when
// the order is marked shipped. One number per order.
export async function POST(request: Request) {
  try {
    if (!await isAdminAuthed()) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { orderId, trackingNumber } = await request.json();

    const tracking =
      typeof trackingNumber === "string" ? trackingNumber.trim() : "";

    if (!orderId || !tracking) {
      return NextResponse.json(
        { error: "orderId and a tracking number are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ tracking_number: tracking })
      .eq("id", orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    console.log(`[update-tracking] Order ${orderId} tracking → ${tracking} (no email sent)`);

    return NextResponse.json({
      success: true,
      trackingNumber: tracking,
      emailSent: false
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update tracking number."
      },
      { status: 500 }
    );
  }
}
