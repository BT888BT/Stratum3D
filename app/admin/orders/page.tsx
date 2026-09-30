import { createAdminClient } from "@/lib/supabase/admin";
import { formatAud } from "@/lib/utils";
import Link from "next/link";
import OrderRowActions from "@/components/admin/order-row-actions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status}`}>{status.replace(/_/g, " ")}</span>
  );
}

// Payment state, not just "has a Stripe payment". Checkout only places a hold;
// money is captured when the order is approved (→ order_received).
function PaidBadge({ order, captured }: { order: { status: string; stripe_payment_intent_id: string | null }; captured: boolean }) {
  if (order.status === "refunded") {
    return <span className="badge badge-refunded">refunded</span>;
  }
  if (!order.stripe_payment_intent_id) {
    return <span className="badge" style={{ color: "var(--muted)" }}>unpaid</span>;
  }
  if (order.status === "pending_approval") {
    return <span className="badge badge-pending_approval" title="Card on hold — not charged until approved">authorised</span>;
  }
  if (order.status === "cancelled") {
    // Captured then cancelled without a refund — money is still held; needs refunding in Stripe.
    return captured
      ? <span className="badge badge-cancelled" title="Payment was captured and has not been refunded">charged</span>
      : <span className="badge badge-draft" title="Hold released — customer was not charged">not charged</span>;
  }
  return <span className="badge badge-paid">paid</span>;
}

function orderLabel(order: { order_number?: number; id: string }) {
  return order.order_number
    ? `S3D-${String(order.order_number).padStart(4, "0")}`
    : `#${order.id.slice(0, 8).toUpperCase()}`;
}

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .not("status", "in", '("draft","checkout_pending")')
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="error-box">Failed to load orders: {error.message}</div>;
  }

  // Cancelled orders that were approved first had their payment captured.
  const cancelledIds = (orders ?? []).filter(o => o.status === "cancelled" && o.stripe_payment_intent_id).map(o => o.id);
  const capturedIds = new Set<string>();
  if (cancelledIds.length) {
    const { data: history } = await supabase
      .from("order_status_history")
      .select("order_id")
      .in("order_id", cancelledIds)
      .eq("status", "order_received");
    for (const h of history ?? []) capturedIds.add(h.order_id);
  }

  const counts = {
    total: orders?.filter(o => !["draft", "checkout_pending"].includes(o.status)).length ?? 0,
    pendingApproval: orders?.filter(o => o.status === "pending_approval").length ?? 0,
    awaitingPrint: orders?.filter(o => o.status === "order_received" || o.status === "paid").length ?? 0,
    printing: orders?.filter(o => o.status === "printing").length ?? 0,
    completed: orders?.filter(o => o.status === "completed").length ?? 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Header — admin nav controls now live in the site header (see HeaderNav) */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Dashboard</p>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Orders</h1>
        </div>
        <Link href="/admin/stats" className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>View stats →</Link>
      </div>

      {/* Stats */}
      <div className="hidden-mobile" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: "Total Orders",     value: counts.total,           color: "var(--text)" },
          { label: "Pending Approval", value: counts.pendingApproval, color: "var(--accent)" },
          { label: "Awaiting Print",   value: counts.awaitingPrint,   color: "var(--accent)" },
          { label: "Printing",         value: counts.printing,        color: "var(--amber)" },
          { label: "Completed",        value: counts.completed,       color: "var(--green)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <p className="font-display" style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div className="order-table-header" style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr 1fr 140px 80px 90px 140px 90px 44px",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)"
        }}>
          {["Order", "Customer", "Email", "Status", "Paid", "Total", "Date", "", ""].map((h, i) => (
            <span key={i} className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        <div>
          {orders?.map((order) => (
            <div key={order.id} className="order-row">
              <span className="font-mono" style={{ fontSize: 12, color: "var(--accent)" }}>{orderLabel(order)}</span>
              <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.customer_name}</span>
              <span style={{ fontSize: 12, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.email}</span>
              <StatusBadge status={order.status} />
              <PaidBadge order={order} captured={capturedIds.has(order.id)} />
              <span className="font-mono" style={{ fontSize: 13 }}>{formatAud(order.total_cents)}</span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{new Date(order.created_at).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}</span>
              <Link href={`/admin/orders/${order.id}`} style={{
                fontSize: 12,
                color: "var(--accent)",
                border: "1px solid var(--accent-dim)",
                borderRadius: 6,
                padding: "4px 10px",
                display: "inline-block",
                transition: "background 0.15s"
              }}>
                View →
              </Link>
              <OrderRowActions orderId={order.id} isPaid={order.stripe_payment_intent_id != null || order.status === "refunded"} />
            </div>
          ))}

          {!orders?.length && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
