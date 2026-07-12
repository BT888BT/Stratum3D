"use client";

import { useEffect, useState } from "react";

interface Props {
  /** ISO date (YYYY-MM-DD) printing resumes. */
  resumeDate: string;
  /** Optional custom message shown under the heading. */
  message?: string;
}

function formatResume(iso: string): string {
  // Parse as a plain calendar date (avoid UTC shifting the day).
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function AwayOverlay({ resumeDate, message }: Props) {
  // Shows on every page open/refresh — no persistence.
  const [open, setOpen] = useState(true);

  function close() {
    setOpen(false);
  }

  // Lock body scroll + allow Escape to close while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="away-title"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(5, 3, 1, 0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "awayFade 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "linear-gradient(160deg, var(--surface2) 0%, var(--surface) 100%)",
          border: "1px solid var(--border-hi)",
          borderRadius: 18,
          padding: "36px 32px 32px",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "awayPop 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-dim)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.borderColor = "var(--border-hi)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-dim)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          ×
        </button>

        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "color-mix(in srgb, var(--orange) 14%, transparent)",
            border: "1px solid color-mix(in srgb, var(--orange) 30%, transparent)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <span className="eyebrow" style={{ display: "block", marginBottom: 10 }}>Currently Away</span>
        <h2 id="away-title" className="font-display" style={{ fontSize: 30, marginBottom: 12, lineHeight: 1.1 }}>
          PRINTING PAUSED
        </h2>

        <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {message?.trim()
            ? message
            : "We're away for a short break. You can still browse and place an order — it'll be queued and printed as soon as we're back."}
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 12,
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Printing resumes
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--orange)" }}>
            {formatResume(resumeDate)}
          </span>
        </div>

        <button onClick={close} className="btn-primary" style={{ width: "100%" }}>
          Continue to the site
        </button>
      </div>
    </div>
  );
}
