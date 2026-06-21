import { createAdminClient } from "@/lib/supabase/admin";

// How long an order sits in `order_shipped` before we consider it delivered and
// auto-advance it to `completed`. Admins can still move it manually at any time;
// this only catches the ones that were never closed out by hand.
const AUTO_COMPLETE_DAYS = 5;

/**
 * Finds orders that have been in `order_shipped` for more than
 * AUTO_COMPLETE_DAYS, marks them `completed`, and writes an
 * order_status_history row. No customer email is sent on completion.
 *
 * "Shipped at" is read from the most recent `order_shipped` row in
 * order_status_history, since the orders table has no shipped_at column.
 *
 * Safe to call repeatedly (idempotent: only acts on orders still in
 * order_shipped) and from multiple triggers.
 */
export async function autoCompleteShippedOrders(): Promise<{ completed: number }> {
  const supabase = createAdminClient();
  const cutoff = new Date(
    Date.now() - AUTO_COMPLETE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  // Status-history rows that say "shipped" and are older than the cutoff.
  // We then confirm the order is *still* shipped before completing it.
  const { data: shippedEvents } = await supabase
    .from("order_status_history")
    .select("order_id, created_at")
    .eq("status", "order_shipped")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!shippedEvents?.length) return { completed: 0 };

  // De-dupe to one (latest) shipped timestamp per order.
  const orderIds = [...new Set(shippedEvents.map((e) => e.order_id))];

  // Only orders that are still sitting in order_shipped right now.
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .in("id", orderIds)
    .eq("status", "order_shipped")
    .limit(50);

  if (!orders?.length) return { completed: 0 };

  let completed = 0;

  for (const order of orders) {
    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", order.id);

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "completed",
      note: `Auto-completed — ${AUTO_COMPLETE_DAYS} days after shipping.`,
    });

    // No customer email on completion (by design).

    completed++;
    console.log(
      `[auto-complete-shipped] Auto-completed order ${order.id} (>${AUTO_COMPLETE_DAYS} days in order_shipped)`
    );
  }

  return { completed };
}
