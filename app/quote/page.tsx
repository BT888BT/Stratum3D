"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MATERIALS,
  COLOURS,
  QUALITIES,
  INFILLS,
  SIZE_PRESETS,
  estimatePrice,
  aud,
  SHIPPING_AUD,
  PICKUP_AUD,
  FREE_SHIP_THRESHOLD_AUD,
  type MaterialKey,
  type Quality,
} from "@/lib/catalog";

type Step = "configure" | "review" | "done";

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `STR-${s}`;
}

export default function QuotePage() {
  const [material, setMaterial] = useState<MaterialKey>("PLA");
  const [colour, setColour] = useState(COLOURS[0].name);
  const [quality, setQuality] = useState<Quality["key"]>("standard");
  const [infill, setInfill] = useState(25);
  const [sizeKey, setSizeKey] = useState("small");
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<"shipping" | "pickup">("shipping");

  const [step, setStep] = useState<Step>("configure");
  const [email, setEmail] = useState("");
  const [orderCode, setOrderCode] = useState("");

  const size = SIZE_PRESETS.find((s) => s.key === sizeKey) ?? SIZE_PRESETS[1];

  const breakdown = useMemo(
    () =>
      estimatePrice({
        dims: size.dims,
        material,
        infillPercent: infill,
        quality,
        quantity,
      }),
    [size, material, infill, quality, quantity]
  );

  const shipping = method === "pickup" ? PICKUP_AUD : breakdown.lineSubtotal >= FREE_SHIP_THRESHOLD_AUD ? 0 : SHIPPING_AUD;
  const total = breakdown.lineSubtotal + shipping;
  const mat = MATERIALS.find((m) => m.key === material)!;
  const selColour = COLOURS.find((c) => c.name === colour)!;

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrderCode(genCode());
    setStep("done");
  }

  // ── Confirmation screen ──────────────────────────────────
  if (step === "done") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div className="card-orange fade-up" style={{ padding: "clamp(28px, 5vw, 44px)" }}>
          <div
            style={{
              width: 56, height: 56, margin: "0 auto 18px", borderRadius: "50%",
              background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span className="eyebrow" style={{ marginBottom: 8 }}>Order received</span>
          <h1 className="font-display" style={{ fontSize: "clamp(30px, 6vw, 44px)", marginBottom: 12 }}>YOU&apos;RE ON THE PLATE</h1>
          <p style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 24 }}>
            Thanks! We&apos;ve logged your print. Save your order code — you&apos;ll use it with your email to track progress in your account.
          </p>
          <div className="card" style={{ background: "var(--bg2)", marginBottom: 24 }}>
            <div className="stat-label" style={{ marginBottom: 6 }}>Your order code</div>
            <div className="font-display" style={{ fontSize: 34, color: "var(--orange)", letterSpacing: "0.12em" }}>{orderCode}</div>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>{email}</div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/account" className="btn-primary">Go to my account</Link>
            <Link href="/" className="btn-ghost">Back home</Link>
          </div>
          <p className="font-mono" style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 22, letterSpacing: "0.06em", lineHeight: 1.6 }}>
            Demo note: this is a test checkout with no payment. To explore a populated account,
            log in with the demo credentials shown on the account page.
          </p>
        </div>
      </div>
    );
  }

  // ── Review / contact screen ──────────────────────────────
  if (step === "review") {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <button onClick={() => setStep("configure")} className="btn-ghost" style={{ marginBottom: 20 }}>← Edit configuration</button>
        <div className="card-lg fade-up">
          <span className="eyebrow" style={{ marginBottom: 8 }}>Review &amp; place order</span>
          <h1 className="font-display" style={{ fontSize: "clamp(26px, 5vw, 38px)", marginBottom: 20 }}>ALMOST THERE</h1>

          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            <SummaryRow label="Material" value={`${mat.name} · ${colour}`} />
            <SummaryRow label="Quality" value={QUALITIES.find((q) => q.key === quality)!.name + " (" + QUALITIES.find((q) => q.key === quality)!.layer + ")"} />
            <SummaryRow label="Infill" value={`${infill}%`} />
            <SummaryRow label="Size" value={size.name} />
            <SummaryRow label="Quantity" value={`× ${quantity}`} />
            <SummaryRow label="Fulfilment" value={method === "pickup" ? "Local pickup (Perth)" : "Shipping (Australia-wide)"} />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 20 }}>
            <SummaryRow label="Subtotal" value={aud(breakdown.lineSubtotal)} />
            <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : aud(shipping)} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
              <span className="font-display" style={{ fontSize: 30, color: "var(--orange)" }}>{aud(total)}</span>
            </div>
          </div>

          <form onSubmit={placeOrder}>
            <label className="stat-label" style={{ display: "block", marginBottom: 6 }}>Email for order updates</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              style={{ marginBottom: 16 }}
            />
            <button type="submit" className="btn-primary" style={{ width: "100%", fontSize: 17, padding: "13px" }}>
              Place order · {aud(total)}
            </button>
            <p className="font-mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", marginTop: 12, letterSpacing: "0.05em" }}>
              Test checkout — no payment is taken.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── Configurator ─────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow" style={{ marginBottom: 10 }}>Instant quote</span>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 6vw, 56px)", lineHeight: 1 }}>CONFIGURE YOUR PRINT</h1>
        <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 540, marginTop: 10 }}>
          Set your options and watch the price update live. Got an STL? Mention it after ordering — we&apos;ll
          confirm the exact volume before printing.
        </p>
      </div>

      <div className="quote-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        {/* Options */}
        <div style={{ display: "grid", gap: 22 }}>
          {/* Material */}
          <Field title="Material">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {MATERIALS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMaterial(m.key)}
                  className="card"
                  style={{
                    textAlign: "left", cursor: "pointer", padding: 14,
                    borderColor: material === m.key ? m.accent : "var(--border)",
                    background: material === m.key ? "rgba(249,115,22,0.06)" : "var(--surface)",
                  }}
                >
                  <div className="font-display" style={{ fontSize: 22, color: m.accent }}>{m.name}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em", marginTop: 2 }}>{m.tagline}</div>
                </button>
              ))}
            </div>
          </Field>

          {/* Colour */}
          <Field title="Colour">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {COLOURS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColour(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  style={{
                    width: 34, height: 34, borderRadius: 8, cursor: "pointer",
                    background: c.hex,
                    border: colour === c.name ? "2px solid var(--orange)" : "1px solid var(--border-hi)",
                    boxShadow: colour === c.name ? "0 0 0 3px rgba(249,115,22,0.2)" : "none",
                  }}
                />
              ))}
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>
              Selected: <span style={{ color: "var(--text)" }}>{colour}</span>
            </div>
          </Field>

          {/* Quality */}
          <Field title="Quality">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {QUALITIES.map((q) => (
                <button
                  key={q.key}
                  onClick={() => setQuality(q.key)}
                  className="card"
                  style={{
                    textAlign: "left", cursor: "pointer", padding: 14,
                    borderColor: quality === q.key ? "var(--orange)" : "var(--border)",
                    background: quality === q.key ? "rgba(249,115,22,0.06)" : "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{q.name}</span>
                    <span className="font-mono" style={{ fontSize: 10, color: "var(--orange)" }}>{q.layer}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4 }}>{q.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          {/* Infill */}
          <Field title="Infill / strength">
            <select className="input-field" value={infill} onChange={(e) => setInfill(Number(e.target.value))}>
              {INFILLS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </Field>

          {/* Size */}
          <Field title="Approximate size">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSizeKey(s.key)}
                  className="card"
                  style={{
                    textAlign: "left", cursor: "pointer", padding: 14,
                    borderColor: sizeKey === s.key ? "var(--orange)" : "var(--border)",
                    background: sizeKey === s.key ? "rgba(249,115,22,0.06)" : "var(--surface)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.name}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{s.desc} · {s.dims.join("×")}mm</div>
                </button>
              ))}
            </div>
          </Field>

          {/* Quantity + method */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field title="Quantity">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="font-display" style={{ fontSize: 26, minWidth: 36, textAlign: "center" }}>{quantity}</span>
                <button className="btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setQuantity((q) => Math.min(99, q + 1))}>+</button>
              </div>
            </Field>
            <Field title="Fulfilment">
              <div style={{ display: "grid", gap: 8 }}>
                {(["shipping", "pickup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className="card"
                    style={{
                      padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderColor: method === m ? "var(--orange)" : "var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{m === "shipping" ? "Ship Australia-wide" : "Pickup in Perth"}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{m === "shipping" ? `${aud(SHIPPING_AUD)}` : "Free"}</span>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* Live price summary (sticky) */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card-orange">
            <span className="eyebrow" style={{ marginBottom: 14 }}>Your quote</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: selColour.hex, border: "1px solid var(--border-hi)" }} />
              <span style={{ fontSize: 14, color: "var(--text)" }}>{mat.name} · {colour}</span>
            </div>

            <div style={{ display: "grid", gap: 9, marginBottom: 16 }}>
              <PriceRow label="Unit price" value={aud(breakdown.unitPrice)} />
              <PriceRow label="Est. weight" value={`~${breakdown.unitWeightG.toFixed(0)} g`} muted />
              <PriceRow label="Est. print time" value={`~${Math.round(breakdown.unitPrintMinutes)} min`} muted />
              <PriceRow label="Quantity" value={`× ${quantity}`} />
              <PriceRow label="Shipping" value={shipping === 0 ? "Free" : aud(shipping)} />
            </div>

            <div style={{ borderTop: "1px solid rgba(249,115,22,0.25)", paddingTop: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Total</span>
                <span className="font-display" style={{ fontSize: 38, color: "var(--orange)" }}>{aud(total)}</span>
              </div>
              {method === "shipping" && breakdown.lineSubtotal < FREE_SHIP_THRESHOLD_AUD && (
                <div className="font-mono" style={{ fontSize: 10, color: "var(--amber)", marginTop: 6 }}>
                  Add {aud(FREE_SHIP_THRESHOLD_AUD - breakdown.lineSubtotal)} for free shipping
                </div>
              )}
            </div>

            <button className="btn-primary" style={{ width: "100%", fontSize: 17, padding: "13px" }} onClick={() => setStep("review")}>
              Continue →
            </button>
            <p className="font-mono" style={{ fontSize: 9.5, color: "var(--muted)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              Estimate based on a {size.dims.join("×")}mm bounding box. Final price confirmed against your STL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="stat-label" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function PriceRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 13, color: muted ? "var(--text-dim)" : "var(--text)" }}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 13.5, color: "var(--text)", textAlign: "right" }}>{value}</span>
    </div>
  );
}
