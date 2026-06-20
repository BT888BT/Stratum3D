import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderRejectedEmail } from "@/lib/email";

// Stripe card authorisations expire (and are silently voided) ~7 days after
// they're created. We release them proactively at 6 days so we're cancelling a
// still-valid authorisation — and, crucially, can notify the customer — rather
// than letting Stripe void it behind everyone's back.
const APPROVAL_EXPIRY_DAYS = 6;

/**
 * Finds orders left in `pending_approval` longer than APPROVAL_EXPIRY_DAYS,
 * releases their Stripe authorisation (no charge), marks them cancelled, writes
 * an order_status_history row, and emails the customer. Never silent.
 *
 * Safe to call repeatedly (idempotent: only acts on still-pending orders) and
 * from multiple triggers (cron + webhook backstop).
 */
export async function expireStaleApprovals(): Promise<{ expired: number }> {
  const supabase = createAdminClient();
  const cutoff = new Date(
    Date.now() - APPROVAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: stale } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending_approval")
    .lt("created_at", cutoff)
    .limit(20);

  if (!stale?.length) return { expired: 0 };

  let expired = 0;

  for (const order of stale) {
    // 1. Release the Stripe authorisation — releases the hold, no charge.
    if (order.stripe_payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id, {
          cancellation_reason: "abandoned",
        });
      } catch (err) {
        // If Stripe has already voided the auth (past ~7 days) the intent may
        // be uncancelable — log and still close out the order on our side.
        console.error(
          `[expire-approvals] Stripe cancel failed for order ${order.id}:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    // 2. Mark cancelled + record why (visible in admin + customer tracking).
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "cancelled",
      note: `Auto-cancelled — not approved within ${APPROVAL_EXPIRY_DAYS} days. Payment authorisation released; no charge made.`,
    });

    // 3. Notify the customer — this is what makes it NOT silent.
    await sendOrderRejectedEmail({
      id: order.id,
      orderNumber: order.order_number ?? undefined,
      customerName: order.customer_name,
      email: order.email,
      totalCents: order.total_cents,
      rejectNote:
        "We weren't able to review your order in time, so the payment authorisation has expired and been released — no charge was made to your card. You're welcome to place the order again whenever you're ready.",
    }).catch((err) =>
      console.error(
        `[expire-approvals] notification email failed for order ${order.id}:`,
        err
      )
    );

    expired++;
    console.log(
      `[expire-approvals] Auto-cancelled stale order ${order.id} (>${APPROVAL_EXPIRY_DAYS} days in pending_approval)`
    );
  }

  return { expired };
}
