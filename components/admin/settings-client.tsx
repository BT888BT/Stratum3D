"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  pickupEnabled: boolean;
  orderingEnabled: boolean;
  awayEnabled: boolean;
  awayResumeDate: string;
  awayMessage: string;
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

export default function SettingsClient({
  pickupEnabled: initialPickup,
  orderingEnabled: initialOrdering,
  awayEnabled: initialAway,
  awayResumeDate: initialAwayDate,
  awayMessage: initialAwayMessage,
}: Props) {
  const [pickupEnabled, setPickupEnabled] = useState(initialPickup);
  const [orderingEnabled, setOrderingEnabled] = useState(initialOrdering);
  const [awayEnabled, setAwayEnabled] = useState(initialAway);
  const [awayResumeDate, setAwayResumeDate] = useState(initialAwayDate);
  const [awayMessage, setAwayMessage] = useState(initialAwayMessage);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const router = useRouter();

  async function save(key: string, value: boolean | string) {
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

  async function saveAwayDetails() {
    setSaving("away_details");
    setSaved(null);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        away_resume_date: awayResumeDate,
        away_message: awayMessage,
      }),
    });
    setSaving(null);
    setSaved("away_details");
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

      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Away notice */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Away Notice</p>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Shows a one-time popup on the order page telling customers you&apos;re away and when
              printing resumes. The site stays fully usable — orders are queued for your return.
            </p>
          </div>
          <Toggle
            enabled={awayEnabled}
            saving={saving === "away_enabled"}
            onToggle={() => {
              const next = !awayEnabled;
              setAwayEnabled(next);
              save("away_enabled", next);
            }}
          />
        </div>

        {awayEnabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <label style={{ display: "block" }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>
                Printing resumes on
              </span>
              <input
                type="date"
                className="input-field"
                value={awayResumeDate}
                onChange={(e) => setAwayResumeDate(e.target.value)}
                style={{ maxWidth: 200 }}
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)", display: "block", marginBottom: 6 }}>
                Custom message <span style={{ color: "var(--muted)" }}>(optional)</span>
              </span>
              <textarea
                className="input-field"
                value={awayMessage}
                onChange={(e) => setAwayMessage(e.target.value)}
                rows={3}
                placeholder="Leave blank to use the default message."
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="btn-ghost"
                onClick={saveAwayDetails}
                disabled={saving === "away_details" || !awayResumeDate}
                style={{ fontSize: 12, opacity: !awayResumeDate ? 0.5 : 1 }}
              >
                {saving === "away_details" ? "Saving…" : "Save away details"}
              </button>
              {!awayResumeDate && (
                <span style={{ fontSize: 12, color: "var(--orange)" }}>Set a resume date to show the notice.</span>
              )}
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, marginTop: 12, color: awayEnabled ? "var(--orange)" : "var(--muted)" }}>
          {awayEnabled
            ? awayResumeDate
              ? "Away notice is active on the order page"
              : "Enabled, but no resume date set yet"
            : "Away notice is off"}
        </p>
      </div>

      {saved && (
        <p style={{ fontSize: 12, color: "var(--green)" }}>Saved.</p>
      )}
    </div>
  );
}
