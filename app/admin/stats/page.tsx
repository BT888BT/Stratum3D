import { createAdminClient } from "@/lib/supabase/admin";
import StatsChart, { type StatsOrder } from "@/components/admin/stats-chart";

export const dynamic = "force-dynamic";

// Paid orders only: a Stripe payment exists and it hasn't been refunded or
// cancelled since. Drafts / checkout_pending never have a payment intent.
export default async function AdminStatsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("created_at, total_cents, shipping_cents")
    .not("stripe_payment_intent_id", "is", null)
    .not("status", "in", '("refunded","cancelled")')
    .order("created_at", { ascending: true });

  if (error) {
    return <div className="error-box">Failed to load stats: {error.message}</div>;
  }

  // Gross excludes shipping — it's passed straight through to the courier.
  const orders: StatsOrder[] = (data ?? []).map((o) => ({
    createdAt: o.created_at,
    grossCents: Math.max(0, (o.total_cents ?? 0) - (o.shipping_cents ?? 0)),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Dashboard</p>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Stats</h1>
      </div>
      <StatsChart orders={orders} />
    </div>
  );
}
