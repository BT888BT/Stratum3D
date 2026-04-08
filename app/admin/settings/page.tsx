import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import SettingsClient from "@/components/admin/settings-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));

  const pickupEnabled = settings["pickup_enabled"] !== "false";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin/orders" style={{ fontSize: 12, color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            ← Back to orders
          </Link>
          <p className="eyebrow" style={{ marginBottom: 8 }}>Admin</p>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700 }}>Settings</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>Delivery Options</p>
        <SettingsClient pickupEnabled={pickupEnabled} />
      </div>
    </div>
  );
}
