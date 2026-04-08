"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsClient({ pickupEnabled: initial }: { pickupEnabled: boolean }) {
  const [pickupEnabled, setPickupEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function toggle() {
    const next = !pickupEnabled;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickup_enabled: String(next) }),
    });
    setPickupEnabled(next);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Local Pickup</p>
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
            Allow customers to choose parcel locker pickup at Stirling Central.
            When disabled, only shipping is shown.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          style={{
            flexShrink: 0,
            width: 52,
            height: 28,
            borderRadius: 14,
            border: "none",
            cursor: saving ? "default" : "pointer",
            background: pickupEnabled ? "var(--green)" : "var(--border)",
            position: "relative",
            transition: "background 0.2s",
            opacity: saving ? 0.6 : 1,
          }}
        >
          <span style={{
            position: "absolute",
            top: 3,
            left: pickupEnabled ? 27 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </button>
      </div>

      <p style={{ fontSize: 12, color: pickupEnabled ? "var(--green)" : "var(--muted)" }}>
        {pickupEnabled ? "Pickup is currently enabled" : "Pickup is currently disabled — customers will only see shipping"}
      </p>

      {saved && (
        <p style={{ fontSize: 12, color: "var(--green)" }}>Saved.</p>
      )}
    </div>
  );
}
