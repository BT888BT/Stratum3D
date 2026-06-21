import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import DiscountCodeManager from "@/components/admin/discount-code-manager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCodesPage() {
  const supabase = createAdminClient();
  const { data: codes, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <div className="error-box">Failed to load discount codes: {error.message}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin/orders" style={{ fontSize: 12, color: "var(--text-dim)", display: "inline-block", marginBottom: 10 }}>← Orders</Link>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Promotions</p>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Discount Codes</h1>
        </div>
      </div>
      <DiscountCodeManager initialCodes={codes ?? []} />
    </div>
  );
}
