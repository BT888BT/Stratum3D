import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { ordersForEmail, STATUS_FLOW, type Order } from "@/lib/mock-data";
import { aud } from "@/lib/catalog";
import LoginForm from "./LoginForm";
import { logout } from "./actions";

export const metadata = {
  title: "My Account — Stratum3D",
  description: "Track your 3D printing orders with Stratum3D.",
};

export default async function AccountPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const email = verifySessionToken(token);

  if (!email) {
    return <LoginForm />;
  }

  const orders = ordersForEmail(email);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <span className="eyebrow" style={{ marginBottom: 8 }}>Your orders</span>
          <h1 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1 }}>WELCOME BACK</h1>
          <p className="font-mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>{email}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-ghost" style={{ fontSize: 13 }}>Sign out</button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="card-lg" style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 18 }}>No orders on this account yet.</p>
          <Link href="/quote" className="btn-primary">Start a print →</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((o) => (
            <OrderCard key={o.code} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const stepIdx = STATUS_FLOW.findIndex((s) => s.key === order.status);
  const statusLabel = STATUS_FLOW[stepIdx]?.label ?? order.status;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Link href={`/account/${order.code}`} className="card" style={{ display: "block", textDecoration: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div>
          <div className="font-display" style={{ fontSize: 22, color: "var(--text)", letterSpacing: "0.08em" }}>{order.code}</div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
            {new Date(order.placedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}{itemCount} item{itemCount !== 1 ? "s" : ""}
          </div>
        </div>
        <span className={`badge badge-${order.status}`}>{statusLabel}</span>
      </div>

      {/* Mini progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {STATUS_FLOW.map((s, i) => (
          <div
            key={s.key}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= stepIdx ? "var(--orange)" : "var(--border)",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, color: "var(--orange)" }}>{order.eta}</span>
        <span style={{ fontSize: 14, color: "var(--text)" }}>
          <span style={{ color: "var(--muted)", fontSize: 12, marginRight: 6 }}>Total</span>{aud(order.total)}
        </span>
      </div>
    </Link>
  );
}
