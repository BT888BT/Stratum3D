import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { orderByCodeForEmail, STATUS_FLOW } from "@/lib/mock-data";
import { getMaterial, aud } from "@/lib/catalog";

export default async function OrderDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const email = verifySessionToken(token);

  // Not signed in → back to login.
  if (!email) redirect("/account");

  // Lockdown: an order is only returned if it belongs to THIS email.
  const order = orderByCodeForEmail(email, code);
  if (!order) notFound();

  const stepIdx = STATUS_FLOW.findIndex((s) => s.key === order.status);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <Link href="/account" className="btn-ghost" style={{ marginBottom: 22 }}>← All orders</Link>

      <div className="card-lg" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
          <div>
            <span className="eyebrow" style={{ marginBottom: 8 }}>Order</span>
            <h1 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", letterSpacing: "0.08em", lineHeight: 1 }}>{order.code}</h1>
          </div>
          <span className={`badge badge-${order.status}`} style={{ marginTop: 6 }}>
            {STATUS_FLOW[stepIdx]?.label}
          </span>
        </div>
        <p className="font-mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
          Placed {new Date(order.placedAt).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
          {" · "}{order.shippingMethod === "pickup" ? "Local pickup" : "Shipping"}
        </p>

        {order.trackingNote && (
          <div className="card" style={{ background: "var(--bg2)", marginTop: 18, borderLeft: "2px solid var(--orange)" }}>
            <div className="font-mono" style={{ fontSize: 10, color: "var(--orange)", letterSpacing: "0.12em", marginBottom: 6 }}>● LATEST UPDATE</div>
            <p style={{ fontSize: 14, color: "var(--text)" }}>{order.trackingNote}</p>
            <p style={{ fontSize: 13, color: "var(--orange)", marginTop: 8 }}>{order.eta}</p>
          </div>
        )}
      </div>

      {/* Status timeline */}
      <div className="card-lg" style={{ marginBottom: 16 }}>
        <span className="eyebrow" style={{ marginBottom: 18 }}>Progress</span>
        <div className="timeline">
          {STATUS_FLOW.map((s, i) => {
            const cls = i < stepIdx ? "done" : i === stepIdx ? "current" : "";
            return (
              <div key={s.key} className={`timeline-step ${cls}`}>
                <div className="timeline-dot" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: i <= stepIdx ? "var(--text)" : "var(--muted)" }}>{s.label}</div>
                  {i === stepIdx && <div className="font-mono" style={{ fontSize: 11, color: "var(--orange)", marginTop: 2 }}>In progress</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="card-lg">
        <span className="eyebrow" style={{ marginBottom: 16 }}>Items</span>
        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          {order.items.map((it, idx) => {
            const mat = getMaterial(it.material);
            return (
              <div key={idx} className="card" style={{ background: "var(--bg2)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{it.name}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, letterSpacing: "0.04em" }}>
                    <span style={{ color: mat.accent }}>{it.material}</span> · {it.colour} · {it.quality} · {it.infill}% infill
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, color: "var(--text)" }}>{aud(it.lineTotal)}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{it.quantity} × {aud(it.unitPrice)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "grid", gap: 8 }}>
          <Row label="Subtotal" value={aud(order.subtotal)} />
          <Row label={order.shippingMethod === "pickup" ? "Pickup" : "Shipping"} value={order.shipping === 0 ? "Free" : aud(order.shipping)} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
            <span className="font-display" style={{ fontSize: 28, color: "var(--orange)" }}>{aud(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 13.5, color: "var(--text)" }}>{value}</span>
    </div>
  );
}
