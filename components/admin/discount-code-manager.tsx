"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatAud } from "@/lib/utils";

type DiscountCode = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
  used: boolean;
  single_use: boolean;
  expires_at: string | null;
  min_subtotal_cents: number;
  max_discount_cents: number | null;
  redeemed_at: string | null;
  created_at: string;
};

export default function DiscountCodeManager({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [singleUse, setSingleUse] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function addCode() {
    if (!newCode.trim()) { setError("Code is required."); return; }
    const numValue = parseInt(value, 10);
    if (!numValue || numValue <= 0) { setError("Enter a discount value."); return; }
    setLoading("add");
    setError("");
    const res = await fetch("/api/admin/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newCode.trim(),
        discountType,
        // percent → whole number; fixed → dollars converted to cents
        discountValue: discountType === "percent" ? numValue : Math.round(parseFloat(value) * 100),
        minSubtotalCents: minSubtotal ? Math.round(parseFloat(minSubtotal) * 100) : 0,
        maxDiscountCents: discountType === "percent" && maxDiscount ? Math.round(parseFloat(maxDiscount) * 100) : null,
        expiresAt: expiresAt || null,
        singleUse,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) { setError(data?.error || "Failed to add code."); }
    else {
      setNewCode(""); setValue("10"); setMinSubtotal(""); setMaxDiscount(""); setExpiresAt(""); setSingleUse(true);
      router.refresh();
    }
    setLoading(null);
  }

  async function toggleActive(id: string, active: boolean) {
    setLoading(id);
    setError("");
    const res = await fetch("/api/admin/discount-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    if (!res.ok) { setError("Failed to update."); }
    else { setCodes(c => c.map(x => x.id === id ? { ...x, active: !active } : x)); }
    setLoading(null);
  }

  async function deleteCode(id: string) {
    if (!confirm("Delete this discount code?")) return;
    setLoading(id + "-del");
    const res = await fetch("/api/admin/discount-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { setError("Failed to delete."); }
    else { setCodes(c => c.filter(x => x.id !== id)); }
    setLoading(null);
  }

  function formatValue(c: DiscountCode) {
    return c.discount_type === "percent" ? `${c.discount_value}% off` : `${formatAud(c.discount_value)} off`;
  }

  function statusLabel(c: DiscountCode): { text: string; color: string } {
    if (c.used) return { text: "● Used", color: "var(--muted)" };
    if (!c.active) return { text: "○ Disabled", color: "var(--red)" };
    if (c.expires_at && new Date(c.expires_at) <= new Date()) return { text: "○ Expired", color: "var(--red)" };
    return { text: "● Active", color: "var(--green)" };
  }

  const cols = "150px 110px 1fr 90px 130px 110px 70px";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && <div className="error-box">{error}</div>}

      <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0 }}>
        Codes apply to the parts subtotal only (not GST or shipping). A single-use code is burned after its first redemption; a reusable code stays valid until it expires or is disabled. Disable a code to stop it being used without deleting its history.
      </p>

      {/* Code list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: cols,
          gap: 12, padding: "12px 20px",
          background: "var(--bg2)", borderBottom: "1px solid var(--border)"
        }}>
          {["Code", "Discount", "Conditions", "Usage", "Expires", "Status", ""].map((h, i) => (
            <span key={i} className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {codes.map(c => {
          const status = statusLabel(c);
          return (
            <div key={c.id} style={{
              display: "grid", gridTemplateColumns: cols,
              gap: 12, padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
              opacity: loading === c.id ? 0.5 : 1
            }}>
              <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>{c.code}</span>
              <span style={{ fontSize: 13 }}>{formatValue(c)}</span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {c.min_subtotal_cents > 0 && `Min spend ${formatAud(c.min_subtotal_cents)}`}
                {c.min_subtotal_cents > 0 && c.max_discount_cents ? " · " : ""}
                {c.max_discount_cents && `Cap ${formatAud(c.max_discount_cents)}`}
                {c.min_subtotal_cents === 0 && !c.max_discount_cents && "—"}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {c.single_use ? "Single use" : "Reusable"}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-AU") : "Never"}
              </span>
              <button onClick={() => toggleActive(c.id, c.active)} disabled={loading === c.id || c.used}
                style={{
                  background: "transparent", border: `1px solid ${status.color === "var(--green)" ? "rgba(0,229,160,0.3)" : "var(--border)"}`,
                  borderRadius: 6, padding: "4px 10px", cursor: c.used ? "default" : "pointer",
                  color: status.color, fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                  textAlign: "left",
                }}
                title={c.used ? "This code has been redeemed" : "Toggle active"}
              >
                {status.text}
              </button>
              {(c.used || c.redeemed_at) ? (
                // Redeemed codes keep their history — disable instead of deleting.
                <span style={{ color: "var(--muted)", fontSize: 11, padding: "4px 8px", opacity: 0.6, cursor: "help" }}
                  title="This code has been redeemed, so it can't be deleted (that would lose its usage history). Use the status button to disable it instead.">
                  Redeemed
                </span>
              ) : (
                <button onClick={() => deleteCode(c.id)} disabled={!!loading}
                  style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 12, padding: "4px 8px", borderRadius: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                  title="Delete this unused code"
                >Delete</button>
              )}
            </div>
          );
        })}

        {codes.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
            No discount codes yet. Create one below.
          </div>
        )}
      </div>

      {/* Add new */}
      <div className="card">
        <p className="eyebrow" style={{ marginBottom: 16 }}>Create New Code</p>
        <div className="discount-form-row">
          <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1.4 1 130px" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Code</span>
            <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="input-field"
              placeholder="e.g. WELCOME10" style={{ width: "100%", textTransform: "uppercase", fontFamily: "monospace" }}
              maxLength={32} onKeyDown={e => e.key === "Enter" && addCode()} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 110px" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Type</span>
            <select value={discountType} onChange={e => setDiscountType(e.target.value as "percent" | "fixed")} className="input-field" style={{ width: "100%" }}>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "0.8 1 90px" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{discountType === "percent" ? "Percent off (%)" : "Amount off ($)"}</span>
            <input value={value} onChange={e => setValue(e.target.value)} className="input-field" type="number" min="0"
              step={discountType === "percent" ? "1" : "0.01"} style={{ width: "100%" }}
              placeholder={discountType === "percent" ? "10" : "5.00"} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 110px" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Min spend ($, optional)</span>
            <input value={minSubtotal} onChange={e => setMinSubtotal(e.target.value)} className="input-field" type="number" min="0" step="0.01"
              style={{ width: "100%" }} placeholder="0.00" />
          </label>

          {discountType === "percent" && (
            <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 110px" }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Max discount ($, optional)</span>
              <input value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} className="input-field" type="number" min="0" step="0.01"
                style={{ width: "100%" }} placeholder="No cap" />
            </label>
          )}

          <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 130px" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Expires (optional)</span>
            <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="input-field" type="date"
              style={{ width: "100%" }} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto", height: 42, cursor: "pointer", whiteSpace: "nowrap" }}
            title="Single-use codes are burned after their first redemption; leave unchecked for a reusable code.">
            <input type="checkbox" checked={singleUse} onChange={e => setSingleUse(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--orange)", cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Single use</span>
          </label>

          <button onClick={addCode} disabled={loading === "add"} className="btn-primary" style={{ flex: "0 0 auto" }}>
            {loading === "add" ? "Creating..." : "Create Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
