import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrackingNumberEmail } from "@/lib/email";

// Adds (or corrects) the single tracking number on an order after it has
// already been marked shipped — for the case where it was forgotten at the
// time. Emails the customer the tracking number. One number per order.
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

    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, email")
      .eq("id", orderId)
      .single();

    console.log(`[update-tracking] Order ${orderId} tracking → ${tracking}`);

    let emailSent = false;
    let emailError: string | null = null;

    if (!order) {
      emailError = "Tracking saved, but could not load order details for the email.";
    } else {
      const result = await sendTrackingNumberEmail({
        id: order.id,
        orderNumber: order.order_number ?? undefined,
        customerName: order.customer_name,
        email: order.email,
        trackingNumber: tracking
      });
      emailSent = result.sent;
      emailError = result.reason ?? null;
    }

    return NextResponse.json({
      success: true,
      trackingNumber: tracking,
      emailSent,
      emailError: emailError ?? undefined
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
