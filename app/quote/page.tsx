import QuoteForm from "@/components/forms/quote-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote — Stratum3D",
  robots: { index: false, follow: false },
};

const DESIGN_WARNINGS = [
  {
    src: "/overhang.png",
    alt: "3D printing overhang comparison — good vs steep",
    title: "Steep Overhangs",
    body: "Overhangs beyond ~60° need supports or may print poorly. Redesign with chamfers or splits where possible.",
  },
  {
    src: "/warping.png",
    alt: "3D print warping diagram with shrinkage arrows",
    title: "Shrinkage & Warping",
    body: "Large flat or long parts can warp as plastic cools and shrinks. ABS is most prone; PLA and PETG are better.",
  },
  {
    src: "/clearance.png",
    alt: "Clearance gap diagram showing 0.2mm between housing and insert",
    title: "0.2mm Tolerance Gap",
    body: "For parts that fit together, leave at least 0.2mm clearance per side in your CAD model. Tight fits will bind.",
  },
];

function DesignWarnings() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 12,
      marginBottom: "clamp(20px, 3vw, 32px)",
    }}>
      {DESIGN_WARNINGS.map(({ src, alt, title, body }) => (
        <div key={title} style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--bg2)",
        }}>
          <img
            src={src}
            alt={alt}
            style={{ display: "block", width: "100%", borderBottom: "1px solid var(--border)" }}
          />
          <div style={{ padding: "12px 14px" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{title}</p>
            <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>{body}</p>
          </div>
        </div>
      ))}
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
