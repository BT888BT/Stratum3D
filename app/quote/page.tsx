import QuoteForm from "@/components/forms/quote-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote — Stratum3D",
  robots: { index: false, follow: false },
};

function DesignWarnings() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 12,
      marginBottom: "clamp(20px, 3vw, 32px)",
    }}>
      {/* ── Steep Overhangs ── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 18px",
      }}>
        <div style={{
          display: "flex", justifyContent: "center",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "16px 0", marginBottom: 12,
        }}>
          <svg width="100" height="72" viewBox="0 0 100 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Good: shallow overhang ~45° */}
            <g>
              <rect x="6" y="42" width="16" height="20" rx="2" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
              <polygon points="6,42 22,42 34,22 18,22" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
              <rect x="18" y="14" width="16" height="8" rx="1" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
              {/* angle arc */}
              <path d="M22 42 A10 10 0 0 1 28.5 34" stroke="#4ade80" strokeWidth="1" fill="none" strokeDasharray="2 2" />
              <text x="14" y="68" fontSize="8" fill="#4ade80" fontFamily="monospace">~45°  OK</text>
            </g>
            {/* Bad: steep overhang ~70° */}
            <g transform="translate(50,0)">
              <rect x="6" y="42" width="16" height="20" rx="2" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
              <polygon points="6,42 22,42 16,14 0,14" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
              <rect x="0" y="6" width="16" height="8" rx="1" fill="rgba(249,115,22,0.25)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
              {/* angle arc */}
              <path d="M22 42 A10 10 0 0 1 23 31" stroke="#f87171" strokeWidth="1" fill="none" strokeDasharray="2 2" />
              <text x="2" y="68" fontSize="8" fill="#f87171" fontFamily="monospace">&gt;60° WARN</text>
            </g>
          </svg>
        </div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Steep Overhangs</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
          Overhangs beyond ~60° need supports or may print poorly. Redesign with chamfers or splits where possible.
        </p>
      </div>

      {/* ── Warping on Long Parts ── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 18px",
      }}>
        <div style={{
          display: "flex", justifyContent: "center",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "16px 0", marginBottom: 12,
        }}>
          <svg width="110" height="72" viewBox="0 0 110 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Flat base line */}
            <line x1="8" y1="54" x2="102" y2="54" stroke="var(--border-hi)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Warped part — curved path */}
            <path d="M10 52 Q30 44 55 48 Q80 52 100 44"
              stroke="rgba(249,115,22,0.8)" strokeWidth="2" fill="none" />
            <path d="M10 52 Q30 44 55 48 Q80 52 100 44 L100 56 Q80 64 55 60 Q30 56 10 64 Z"
              fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" />
            {/* Lift indicators at corners */}
            <line x1="10" y1="54" x2="10" y2="64" stroke="#f87171" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="100" y1="54" x2="100" y2="44" stroke="#f87171" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="2" y="70" fontSize="7" fill="#f87171" fontFamily="monospace">lifts</text>
            <text x="86" y="42" fontSize="7" fill="#f87171" fontFamily="monospace">lifts</text>
            {/* Label */}
            <text x="28" y="16" fontSize="8" fill="var(--text-dim)" fontFamily="monospace">long flat part</text>
            <line x1="10" y1="20" x2="100" y2="20" stroke="var(--border-hi)" strokeWidth="0.8" markerEnd="url(#arr)" />
            <text x="32" y="30" fontSize="8" fill="#f87171" fontFamily="monospace">shrink / warp</text>
          </svg>
        </div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Shrinkage &amp; Warping</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
          Large flat or long parts can warp as plastic cools and shrinks. ABS is most prone; PLA and PETG are better. Add brims or split into sections if needed.
        </p>
      </div>

      {/* ── 0.2mm Tolerance Gap ── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 18px",
      }}>
        <div style={{
          display: "flex", justifyContent: "center",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "16px 0", marginBottom: 12,
        }}>
          <svg width="100" height="72" viewBox="0 0 100 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer housing */}
            <rect x="10" y="14" width="80" height="44" rx="4"
              fill="rgba(249,115,22,0.12)" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5" />
            {/* Inner peg — with gap */}
            <rect x="28" y="22" width="44" height="28" rx="3"
              fill="rgba(249,115,22,0.35)" stroke="rgba(249,115,22,0.9)" strokeWidth="1.5" />
            {/* Gap callout — left side */}
            <line x1="10" y1="36" x2="28" y2="36" stroke="#4ade80" strokeWidth="1" />
            <line x1="10" y1="33" x2="10" y2="39" stroke="#4ade80" strokeWidth="1" />
            <line x1="28" y1="33" x2="28" y2="39" stroke="#4ade80" strokeWidth="1" />
            <text x="11" y="30" fontSize="7" fill="#4ade80" fontFamily="monospace">0.2mm</text>
            {/* Gap callout — right side */}
            <line x1="72" y1="36" x2="90" y2="36" stroke="#4ade80" strokeWidth="1" />
            <line x1="72" y1="33" x2="72" y2="39" stroke="#4ade80" strokeWidth="1" />
            <line x1="90" y1="33" x2="90" y2="39" stroke="#4ade80" strokeWidth="1" />
            <text x="73" y="30" fontSize="7" fill="#4ade80" fontFamily="monospace">0.2mm</text>
            {/* Labels */}
            <text x="12" y="68" fontSize="7" fill="var(--text-dim)" fontFamily="monospace">housing</text>
            <text x="37" y="68" fontSize="7" fill="rgba(249,115,22,0.9)" fontFamily="monospace">insert</text>
          </svg>
        </div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>0.2mm Tolerance Gap</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>
          For parts that fit together, leave at least 0.2mm clearance per side in your CAD model. FDM prints are not dimensionally perfect — tight fits will bind.
        </p>
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 36px)" }}>
        <span className="eyebrow" style={{ marginBottom: 10 }}>Instant Pricing</span>
        <h1 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 8 }}>GET A QUOTE</h1>
        <p style={{ color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 15px)" }}>
          Upload your STL files and configure each print — pricing calculated instantly from your mesh.
        </p>
      </div>
      <DesignWarnings />
      <QuoteForm />
    </div>
  );
}
