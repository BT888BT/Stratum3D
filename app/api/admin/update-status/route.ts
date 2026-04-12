import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStatusUpdateEmail } from "@/lib/email";

const allowedStatuses = [
  "draft",
  "checkout_pending",
  "order_received",
  "printing",
  "order_shipped",
  "completed",
  "cancelled",
  "refunded",
  // legacy — existing paid orders can still be moved
  "paid",
] as const;

export async function POST(request: Request) {
  try {
    if (!await isAdminAuthed()) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const { orderId, status, note } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status,
        note: note || "Manual admin update"
      });

    if (historyError) {
      throw new Error(historyError.message);
    }

    // Send customer status update email
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, email")
      .eq("id", orderId)
      .single();

    console.log(`[update-status] Order ${orderId} → ${status}${note ? ` (note: ${note})` : ""}`);

    let emailSent = false;
    let emailError: string | null = null;

    if (!order) {
      emailError = "Could not load order details for email.";
    } else {
      const result = await sendStatusUpdateEmail({
        id: order.id,
        orderNumber: order.order_number ?? undefined,
        customerName: order.customer_name,
        email: order.email,
        status,
        note: note || null
      });
      emailSent = result.sent;
      emailError = result.reason ?? null;
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailError: emailError ?? undefined,
      // Include debug info so you can see exactly what happened
      emailDebug: {
        from: process.env.EMAIL_FROM ?? "orders@stratum3d.com",
        to: order?.email ?? "unknown",
        status,
        hasApiKey: !!process.env.RESEND_API_KEY,
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update order."
      },
      { status: 500 }
    );
  }
}
