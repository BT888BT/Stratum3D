import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { MATERIALS, QUALITIES } from "@/lib/catalog";
import { SHOP_STATS, TESTIMONIALS } from "@/lib/mock-data";
import NowPrinting from "./components/NowPrinting";

export const dynamic = "force-dynamic";

// Home-page "From the build plate" photos. Drop the image files in
// public/home-gallery/ (see the README there) and edit the labels below.
const HOME_GALLERY = [
  { src: "/home-gallery/print-1.jpg", title: "Raised Dog Bowl Stand", material: "PLA", category: "Pet · Functional" },
  { src: "/home-gallery/print-2.jpg", title: "Cosplay Mask", material: "PLA", category: "Cosplay · Display" },
  { src: "/home-gallery/print-3.jpg", title: "Raspberry Pi Enclosure", material: "PETG", category: "Functional" },
  { src: "/home-gallery/print-4.jpg", title: "Spiral Vase", material: "PLA", category: "Decor" },
];

function MaintenancePage() {
  return (
    <div style={{
      minHeight: "65vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "clamp(48px, 8vw, 96px) clamp(24px, 4vw, 48px)",
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom: 40 }}>
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 29,9 29,23 16,30 3,23 3,9"
            stroke="var(--orange)" strokeWidth="1.5" fill="rgba(249,115,22,0.08)" />
          <polygon points="16,8 23,12 23,20 16,24 9,20 9,12"
            stroke="var(--orange)" strokeWidth="1" fill="rgba(249,115,22,0.12)" opacity="0.6" />
          <circle cx="16" cy="16" r="3" fill="var(--orange)" opacity="0.9" />
        </svg>
      </div>

      {/* Stacked layer lines — top */}
      <div style={{ width: "100%", maxWidth: 280, marginBottom: 52 }}>
        {[100, 82, 64, 46, 28].map((w, i) => (
          <div key={i} style={{
            height: 2,
            borderRadius: 1,
            background: "var(--orange)",
            opacity: 0.08 + i * 0.05,
            width: `${w}%`,
            margin: "0 auto 5px",
          }} />
        ))}
      </div>

      <span className="eyebrow" style={{ marginBottom: 20, letterSpacing: "0.2em" }}>Stratum3D</span>

      <h1 className="font-display" style={{
        fontSize: "clamp(56px, 11vw, 108px)",
        lineHeight: 0.92,
        marginBottom: 32,
        color: "var(--text)",
        letterSpacing: "0.02em",
      }}>
        BE BACK<br />
        <span style={{ color: "var(--orange)", WebkitTextStroke: "1px var(--orange-hi)" }}>SOON.</span>
      </h1>

      <p style={{
        fontSize: "clamp(14px, 1.6vw, 16px)",
        color: "var(--text-dim)",
        lineHeight: 1.8,
        maxWidth: 400,
        marginBottom: 56,
      }}>
        We're temporarily not accepting new orders.<br />
        Check back shortly — we'll be printing again soon.
      </p>

      {/* Stacked layer lines — bottom */}
      <div style={{ width: "100%", maxWidth: 280 }}>
        {[28, 46, 64, 82, 100].map((w, i) => (
          <div key={i} style={{
            height: 2,
            borderRadius: 1,
            background: "var(--orange)",
            opacity: 0.28 - i * 0.05,
            width: `${w}%`,
            margin: "0 auto 5px",
          }} />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  const orderingEnabled = settings["ordering_enabled"] !== "false";

  if (!orderingEnabled) {
    return <MaintenancePage />;
  }

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
            <NowPrinting />
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
        <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", textAlign: "center", marginBottom: 14 }}>
          THREE STEPS TO A FINISHED PART
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            ["01", "Configure", "Pick your material, colour, quality and size. See a transparent price update instantly — no waiting on a quote."],
            ["02", "We print", "Your job goes on a calibrated FDM machine. We quality-check every part before it leaves the bench."],
            ["03", "Collect or ship", "Pick up locally in Perth or have it shipped Australia-wide. Track every order from your account."],
          ].map(([n, title, body]) => (
            <div key={n} className="card" style={{ borderTop: "2px solid var(--orange)" }}>
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
        <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", textAlign: "center", marginBottom: 12 }}>
          PICK THE RIGHT PLASTIC
        </h2>
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
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span className="eyebrow" style={{ textAlign: "center", marginBottom: 10 }}>Recent work</span>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>FROM THE BUILD PLATE</h2>
        </div>
        <div className="gallery-grid">
          {HOME_GALLERY.map((p) => (
            <div key={p.src} className="gallery-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                style={{ display: "block", width: "100%", height: 180, objectFit: "cover" }}
              />
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
        <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", textAlign: "center", marginBottom: 12 }}>TRUSTED BY PERTH MAKERS</h2>
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
