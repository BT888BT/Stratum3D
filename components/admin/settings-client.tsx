"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  pickupEnabled: boolean;
  orderingEnabled: boolean;
}

function Toggle({
  enabled,
  onToggle,
  saving,
}: {
  enabled: boolean;
  onToggle: () => void;
  saving: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={saving}
      style={{
        flexShrink: 0,
        width: 52,
        height: 28,
        borderRadius: 14,
        border: "none",
        cursor: saving ? "default" : "pointer",
        background: enabled ? "var(--green)" : "var(--border)",
        position: "relative",
        transition: "background 0.2s",
        opacity: saving ? 0.6 : 1,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: enabled ? 27 : 3,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

export default function SettingsClient({ pickupEnabled: initialPickup, orderingEnabled: initialOrdering }: Props) {
  const [pickupEnabled, setPickupEnabled] = useState(initialPickup);
  const [orderingEnabled, setOrderingEnabled] = useState(initialOrdering);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const router = useRouter();

  async function save(key: string, value: boolean) {
    setSaving(key);
    setSaved(null);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: String(value) }),
    });
    setSaving(null);
    setSaved(key);
    router.refresh();
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Ordering enabled */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Website Ordering</p>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              When disabled, the homepage shows a professional "Be Back Soon" page and the quote form is inaccessible.
            </p>
          </div>
          <Toggle
            enabled={orderingEnabled}
            saving={saving === "ordering_enabled"}
            onToggle={() => {
              const next = !orderingEnabled;
              setOrderingEnabled(next);
              save("ordering_enabled", next);
            }}
          />
        </div>
        <p style={{ fontSize: 12, marginTop: 8, color: orderingEnabled ? "var(--green)" : "var(--orange)" }}>
          {orderingEnabled ? "Ordering is live" : "Site is in maintenance mode — orders paused"}
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Pickup enabled */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Local Pickup</p>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Allow customers to choose parcel locker pickup at Stirling Central.
              When disabled, only shipping is shown.
            </p>
          </div>
          <Toggle
            enabled={pickupEnabled}
            saving={saving === "pickup_enabled"}
            onToggle={() => {
              const next = !pickupEnabled;
              setPickupEnabled(next);
              save("pickup_enabled", next);
            }}
          />
        </div>
        <p style={{ fontSize: 12, marginTop: 8, color: pickupEnabled ? "var(--green)" : "var(--muted)" }}>
          {pickupEnabled ? "Pickup is currently enabled" : "Pickup is disabled — customers will only see shipping"}
        </p>
      </div>

      {saved && (
        <p style={{ fontSize: 12, color: "var(--green)" }}>Saved.</p>
      )}
    </div>
  );
}
