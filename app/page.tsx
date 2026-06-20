import Link from "next/link";
import { MATERIALS, QUALITIES } from "@/lib/catalog";
import { SHOP_STATS, TESTIMONIALS, GALLERY } from "@/lib/mock-data";
import GalleryArt from "./components/GalleryArt";

export const metadata = {
  title: "Stratum3D — Affordable 3D Printing in Perth | Fast Local FDM Service",
  description:
    "Perth's affordable 3D printing service. PLA, PETG & ABS from $6. Configure your print, get an instant price, fast local turnaround. Pickup or shipping Australia-wide.",
};

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", paddingTop: 8 }}>
        <div
          className="quote-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "clamp(24px, 5vw, 56px)",
            alignItems: "stretch",
          }}
        >
          <div className="fade-up">
            <span className="eyebrow" style={{ marginBottom: 16 }}>
              Perth · Western Australia · FDM 3D Printing
            </span>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(44px, 8vw, 82px)", lineHeight: 0.95, color: "var(--text)", margin: "10px 0 18px" }}
            >
              YOUR DESIGN,
              <br />
              PRINTED IN
              <br />
              <span style={{ color: "var(--orange)" }}>PERTH.</span>
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 480, marginBottom: 28 }}>
              Affordable, high-quality 3D printing made local. Configure your part, see a
              transparent price up front, and get it in days — not weeks. No minimum order.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/quote" className="btn-primary glow-pulse" style={{ fontSize: 18, padding: "13px 32px" }}>
                Start Your Print →
              </Link>
              <Link href="/gallery" className="btn-ghost" style={{ padding: "13px 26px" }}>
                See the Gallery
              </Link>
            </div>
          </div>

          {/* Hero visual — layered build animation */}
          <div className="fade-up-2 hidden-mobile" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* invisible spacer matching the eyebrow row so the card top aligns with the heading */}
            <span className="eyebrow" aria-hidden="true" style={{ marginBottom: 16, visibility: "hidden" }}>&nbsp;</span>
            <div className="card-orange" style={{ width: "100%", maxWidth: 340, padding: 32, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--orange)", letterSpacing: "0.2em", marginBottom: 18 }}>
                ● NOW PRINTING
              </div>
              <div className="layer-visual" style={{ marginBottom: 22 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="layer-line" style={{ width: `${90 - i * 6}%` }} />
                ))}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Material", "PETG · Carbon Black"],
                  ["Quality", "0.20 mm · Standard"],
                  ["Infill", "25%"],
                  ["Est. price", "$18.40"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>{k}</span>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <section style={{ margin: "clamp(48px, 8vw, 88px) 0" }}>
        <div
          className="card-lg"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 24, textAlign: "center" }}
        >
          {[
            [`${SHOP_STATS.printsCompleted}+`, "Prints completed"],
            [`${SHOP_STATS.rating}★`, `${SHOP_STATS.reviews} reviews`],
            [`${SHOP_STATS.turnaroundHours}h`, "Avg. turnaround"],
            [`${SHOP_STATS.repeatCustomerPct}%`, "Repeat customers"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="stat-num">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ marginBottom: "clamp(48px, 8vw, 88px)" }}>
        <span className="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>How it works</span>
        <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", textAlign: "center", marginBottom: 36 }}>
          THREE STEPS TO A FINISHED PART
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            ["01", "Configure", "Pick your material, colour, quality and size. See a transparent price update instantly — no waiting on a quote."],
            ["02", "We print", "Your job goes on a calibrated FDM machine. We quality-check every part before it leaves the bench."],
            ["03", "Collect or ship", "Pick up locally in Perth or have it shipped Australia-wide. Track every order from your account."],
          ].map(([n, title, body]) => (
            <div key={n} className="card">
              <div className="font-display" style={{ fontSize: 40, color: "var(--orange)", opacity: 0.85, lineHeight: 1 }}>{n}</div>
              <h3 className="font-display" style={{ fontSize: 22, margin: "10px 0 8px", letterSpacing: "0.04em" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Materials ────────────────────────────────────────── */}
      <section style={{ marginBottom: "clamp(48px, 8vw, 88px)" }}>
        <span className="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>Materials</span>
        <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", textAlign: "center", marginBottom: 8 }}>
          PICK THE RIGHT PLASTIC
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-dim)", maxWidth: 560, textAlign: "center", margin: "0 auto 32px" }}>
          Three workhorse filaments cover almost everything — from display pieces to weatherproof,
          load-bearing parts. Not sure? Our <Link href="/guide" style={{ color: "var(--orange)" }}>print guide</Link> breaks it down.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {MATERIALS.map((m) => (
            <div key={m.key} className="card" style={{ borderTop: `2px solid ${m.accent}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="font-display" style={{ fontSize: 28, color: m.accent, letterSpacing: "0.06em" }}>{m.name}</span>
                <span className="badge">{m.strength}</span>
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: "var(--orange)", letterSpacing: "0.1em", marginBottom: 12 }}>{m.tagline.toUpperCase()}</div>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", marginBottom: 16 }}>{m.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{m.use}</span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{m.temp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery preview ──────────────────────────────────── */}
      <section style={{ marginBottom: "clamp(48px, 8vw, 88px)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <span className="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>Recent work</span>
            <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>FROM THE BUILD PLATE</h2>
          </div>
          <Link href="/gallery" className="btn-ghost">View all →</Link>
        </div>
        <div className="gallery-grid">
          {GALLERY.slice(0, 4).map((p) => (
            <div key={p.id} className="gallery-tile">
              <GalleryArt piece={p} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{p.title}</div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>
                  {p.material} · {p.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section style={{ marginBottom: "clamp(48px, 8vw, 88px)" }}>
        <span className="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>What customers say</span>
        <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", textAlign: "center", marginBottom: 32 }}>TRUSTED BY PERTH MAKERS</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card">
              <div style={{ color: "var(--amber)", fontSize: 14, letterSpacing: 2, marginBottom: 12 }}>★★★★★</div>
              <p style={{ fontSize: 14.5, color: "var(--text)", marginBottom: 16, lineHeight: 1.6 }}>“{t.quote}”</p>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{t.name}</div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", marginTop: 2 }}>{t.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section>
        <div className="card-orange" style={{ textAlign: "center", padding: "clamp(32px, 6vw, 56px)" }}>
          <span className="eyebrow" style={{ marginBottom: 12 }}>Ready when you are</span>
          <h2 className="font-display" style={{ fontSize: "clamp(32px, 6vw, 56px)", marginBottom: 14 }}>
            LET&apos;S PRINT SOMETHING
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 480, margin: "0 auto 26px" }}>
            From a single keyring to a full cosplay build — configure it, price it, and we&apos;ll
            have it on the plate. Quality {QUALITIES.find((q) => q.key === "standard")?.layer} layers as standard.
          </p>
          <Link href="/quote" className="btn-primary" style={{ fontSize: 18, padding: "14px 36px" }}>
            Get Your Instant Price →
          </Link>
        </div>
      </section>
    </>
  );
}
