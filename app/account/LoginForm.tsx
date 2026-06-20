"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { DEMO_LOGINS } from "@/lib/mock-data";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span className="eyebrow" style={{ marginBottom: 10 }}>Your account</span>
        <h1 className="font-display" style={{ fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1 }}>TRACK YOUR ORDER</h1>
        <p style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 12 }}>
          Sign in with the email you ordered with and your order code. You&apos;ll only ever see your own orders.
        </p>
      </div>

      <form action={formAction} className="card-lg">
        <label className="stat-label" style={{ display: "block", marginBottom: 6 }}>Email address</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="input-field"
          style={{ marginBottom: 16 }}
        />

        <label className="stat-label" style={{ display: "block", marginBottom: 6 }}>Order code</label>
        <input
          type="text"
          name="code"
          required
          placeholder="STR-XXXXX"
          className="input-field font-mono"
          style={{ marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}
        />

        {state.error && (
          <div
            style={{
              fontSize: 13, color: "var(--red)", background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 12px", marginBottom: 16,
            }}
          >
            {state.error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={pending} style={{ width: "100%", fontSize: 16, padding: "12px" }}>
          {pending ? "Checking…" : "Sign in →"}
        </button>
      </form>

      {/* Demo credentials helper */}
      <div className="card" style={{ marginTop: 18, background: "var(--bg2)" }}>
        <div className="font-mono" style={{ fontSize: 10, color: "var(--orange)", letterSpacing: "0.14em", marginBottom: 10 }}>
          ● DEMO — TRY A LOGIN
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {DEMO_LOGINS.map((d) => (
            <div key={d.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12.5 }}>
              <span style={{ color: "var(--text-dim)" }}>{d.email}</span>
              <span className="font-mono" style={{ color: "var(--text)", letterSpacing: "0.08em" }}>{d.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
