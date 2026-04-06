"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect password.");
      router.push("/admin/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card-orange" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: 24 }}>
          <span className="eyebrow" style={{ marginBottom: 10 }}>Secure Access</span>
          <h1 className="font-display" style={{ fontSize: 40 }}>LOGIN</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" autoFocus />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Verifying..." : "Sign In →"}
          </button>
        </form>
      </div>
    </div>
  );
}
