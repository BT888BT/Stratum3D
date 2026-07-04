import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import CampaignManager from "@/components/admin/campaign-manager";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const supabase = createAdminClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) return <div className="error-box">Failed to load campaigns: {error.message}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin/settings" style={{ fontSize: 12, color: "var(--text-dim)", display: "inline-block", marginBottom: 10 }}>← Settings</Link>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Seasonal</p>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Campaigns</h1>
        </div>
      </div>
      <CampaignManager initialCampaigns={campaigns ?? []} />
    </div>
  );
}
