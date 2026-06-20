import Link from "next/link";
import { GALLERY } from "@/lib/mock-data";
import { getMaterial } from "@/lib/catalog";
import GalleryArt from "../components/GalleryArt";

export default function GalleryPage() {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 48px)" }}>
        <span className="eyebrow" style={{ marginBottom: 10 }}>Our work</span>
        <h1 className="font-display" style={{ fontSize: "clamp(40px, 7vw, 68px)", lineHeight: 1 }}>FROM THE BUILD PLATE</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, maxWidth: 520, margin: "14px auto 0" }}>
          A selection of recent prints across PLA, PETG and ABS — from display pieces to functional,
          load-bearing parts. Yours could be next.
        </p>
      </div>

      <div className="gallery-grid">
        {GALLERY.map((p) => {
          const mat = getMaterial(p.material);
          return (
            <div key={p.id} className="gallery-tile">
              <GalleryArt piece={p} height={210} />
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 15, color: "var(--text)", fontWeight: 600 }}>{p.title}</div>
                  <span className="font-display" style={{ fontSize: 16, color: mat.accent, letterSpacing: "0.05em" }}>{p.material}</span>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", marginTop: 6, textTransform: "uppercase" }}>
                  {p.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="card-orange" style={{ textAlign: "center", padding: "clamp(28px, 5vw, 48px)", marginTop: "clamp(36px, 6vw, 64px)" }}>
        <h2 className="font-display" style={{ fontSize: "clamp(28px, 5vw, 44px)", marginBottom: 12 }}>WANT ONE LIKE THESE?</h2>
        <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 440, margin: "0 auto 24px" }}>
          Configure your part, get an instant price, and we&apos;ll put it on the plate.
        </p>
        <Link href="/quote" className="btn-primary" style={{ fontSize: 17, padding: "13px 32px" }}>
          Start your print →
        </Link>
      </div>
    </div>
  );
}
