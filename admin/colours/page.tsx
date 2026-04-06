import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import ColourManager from "@/components/admin/colour-manager";

export const dynamic = "force-dynamic";

export default async function AdminColoursPage() {
  const supabase = createAdminClient();
  const { data: colours, error } = await supabase
    .from("colours")
    .select("*")
    .order("sort_order");

  if (error) return <div className="error-box">Failed to load colours: {error.message}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin/orders" style={{ fontSize: 12, color: "var(--text-dim)", display: "inline-block", marginBottom: 10 }}>← Orders</Link>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Inventory</p>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Colour Management</h1>
        </div>
      </div>
      <ColourManager initialColours={colours ?? []} />
    </div>
  );
}
