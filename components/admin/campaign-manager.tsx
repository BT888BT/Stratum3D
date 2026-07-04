"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = {
  id: string;
  slug: string;
  name: string;
  theme_key: string;
  starts_at: string;
  ends_at: string;
  enabled: boolean;
  banner_message: string;
  promo_code: string | null;
  created_at: string;
  updated_at: string;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

// Is the campaign inside its live window right now?
function isLive(c: Campaign): boolean {
  const now = Date.now();
  return c.enabled && now >= new Date(c.starts_at).getTime() && now <= new Date(c.ends_at).getTime();
}

function statusLabel(c: Campaign): { text: string; color: string } {
  if (!c.enabled) return { text: "○ Off", color: "var(--muted)" };
  if (isLive(c)) return { text: "● Live now", color: "var(--green)" };
  if (new Date(c.ends_at).getTime() < Date.now()) return { text: "● Passed", color: "var(--muted)" };
  return { text: "● Scheduled", color: "var(--orange)" };
}

export default function CampaignManager({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [drafts, setDrafts] = useState<Record<string, { banner: string; promo: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  function draftFor(c: Campaign) {
    return drafts[c.id] ?? { banner: c.banner_message, promo: c.promo_code ?? "" };
  }

  function setDraft(id: string, patch: Partial<{ banner: string; promo: string }>) {
    setDrafts(d => ({ ...d, [id]: { ...(d[id] ?? { banner: "", promo: "" }), ...patch } }));
  }

  async function toggleEnabled(c: Campaign) {
    setLoading(c.id);
    setError("");
    const res = await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, enabled: !c.enabled }),
    });
    if (!res.ok) setError("Failed to update.");
    else setCampaigns(list => list.map(x => x.id === c.id ? { ...x, enabled: !c.enabled } : x));
    setLoading(null);
  }

  async function saveCopy(c: Campaign) {
    const d = draftFor(c);
    if (d.banner.trim().length < 2) { setError("Banner message is required."); return; }
    setLoading(c.id + "-save");
    setError("");
    const res = await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, bannerMessage: d.banner, promoCode: d.promo }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) { setError(data?.error || "Failed to save."); }
    else {
      setCampaigns(list => list.map(x => x.id === c.id
        ? { ...x, banner_message: d.banner.trim(), promo_code: d.promo.trim() || null }
        : x));
      setDrafts(prev => {
        const next = { ...prev };
        delete next[c.id];
        return next;
      });
      router.refresh();
    }
    setLoading(null);
  }

  // Newest window first isn't useful here — show them in the order they occur.
  const ordered = [...campaigns].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && <div className="error-box">{error}</div>}

      <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.6 }}>
        These control the site&apos;s <strong>appearance only</strong> — accent colour, announcement bar and light decoration — during the week before each date. Checkout, pricing and quotes never change. A campaign shows on the site only when it&apos;s <strong>On</strong> <em>and</em> the current date is inside its window. The promo code here is <strong>display text</strong>; create the matching code in{" "}
        <a href="/admin/discount-codes" style={{ color: "var(--orange)" }}>Discount Codes</a> for it to work at checkout.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ordered.map(c => {
          const d = draftFor(c);
          const dirty = d.banner !== c.banner_message || d.promo !== (c.promo_code ?? "");
          const status = statusLabel(c);
          return (
            <div key={c.id} className="card" style={{ padding: 18, opacity: loading === c.id ? 0.55 : 1 }}>
              {/* Row header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <span className="font-display" style={{ fontSize: 18, letterSpacing: "0.02em" }}>{c.name}</span>
                <span className="font-mono" style={{
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--text-dim)", border: "1px solid var(--border)",
                  borderRadius: 5, padding: "2px 7px",
                }}>{c.theme_key}</span>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  {fmtDate(c.starts_at)} → {fmtDate(c.ends_at)}
                </span>
                <span className="font-mono" style={{ fontSize: 11, color: status.color, marginLeft: "auto", letterSpacing: "0.05em" }}>
                  {status.text}
                </span>
                <button onClick={() => toggleEnabled(c)} disabled={loading === c.id}
                  style={{
                    background: "transparent",
                    border: `1px solid ${c.enabled ? "rgba(0,229,160,0.3)" : "var(--border)"}`,
                    borderRadius: 6, padding: "4px 12px", cursor: "pointer",
                    color: c.enabled ? "var(--green)" : "var(--muted)",
                    fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                  }}
                  title="Turn this campaign on or off">
                  {c.enabled ? "On" : "Off"}
                </button>
              </div>

              {/* Editable copy */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "3 1 320px" }}>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Announcement message</span>
                  <input value={d.banner} onChange={e => setDraft(c.id, { banner: e.target.value })}
                    className="input-field" style={{ width: "100%" }} maxLength={160} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 130px" }}>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Promo code (display)</span>
                  <input value={d.promo} onChange={e => setDraft(c.id, { promo: e.target.value.toUpperCase() })}
                    className="input-field" placeholder="None"
                    style={{ width: "100%", textTransform: "uppercase", fontFamily: "monospace" }} maxLength={32} />
                </label>
                <button onClick={() => saveCopy(c)} disabled={!dirty || loading === c.id + "-save"}
                  className="btn-primary" style={{ flex: "0 0 auto", opacity: dirty ? 1 : 0.5 }}>
                  {loading === c.id + "-save" ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          );
        })}

        {campaigns.length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
            No campaigns yet. Apply the campaigns migration in Supabase to seed them.
          </div>
        )}
      </div>
    </div>
  );
}
