import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { MATERIALS } from "@/lib/catalog";
import { SHOP_STATS, TESTIMONIALS } from "@/lib/mock-data";
import NowPrinting from "./components/NowPrinting";
import Stars from "./components/Stars";

export const dynamic = "force-dynamic";

// Home-page "From the build plate" photos. Drop the image files in
// public/home-gallery/ (see the README there) and edit the labels below.
const HOME_GALLERY = [
  { src: "/home-gallery/print-1.webp", title: "Raised Dog Bowl Stand", material: "PLA", category: "Pet · Functional" },
  { src: "/home-gallery/print-2.webp", title: "Ruined Town Terrain", material: "PLA", category: "Tabletop · Miniatures" },
  { src: "/home-gallery/print-3.webp", title: "Raspberry Pi Enclosure", material: "PETG", category: "Functional" },
  { src: "/home-gallery/print-4.webp", title: "Crochet-Style Cow Figure", material: "PETG", category: "Display · Decor" },
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="Stratum3D logo" width={56} height={56} style={{ display: "block", margin: "0 auto" }} />
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
        <div className="home-hero fade-up">
          {/* Decorative build-plate layers */}
          <div className="home-grid-bg" aria-hidden="true" />
          <div className="home-glow" aria-hidden="true" />
          <div className="home-scan" aria-hidden="true" />

          <div
            className="home-hero-inner quote-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: "clamp(24px, 5vw, 56px)",
              alignItems: "stretch",
            }}
          >
            <div>
              <span className="eyebrow eyebrow-desktop" style={{ marginBottom: 16 }}>
                Perth · Western Australia · FDM 3D Printing
              </span>
              <span className="eyebrow eyebrow-mobile" style={{ marginBottom: 16 }}>
                FDM 3D Printing · Western Australia
              </span>
              <h1
                className="font-display"
                style={{ fontSize: "clamp(44px, 8vw, 84px)", lineHeight: 0.95, color: "var(--text)", margin: "10px 0 18px" }}
              >
                YOUR DESIGN,
                <br />
                PRINTED IN
                <br />
                <span className="grad-text">PERTH.</span>
              </h1>
              <p className="hero-lede" style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 480, marginBottom: 28 }}>
                High-quality 3D printing, made local.
                <br />
                Configure your part, see a transparent price up front.
                <br />
                Receive your parts in days — not weeks.
              </p>
              <div className="hero-cta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/quote" className="btn-primary glow-pulse" style={{ fontSize: 18, padding: "13px 32px" }}>
                  Start Your Print →
                </Link>
                <Link href="/gallery" className="btn-ghost" style={{ padding: "13px 26px" }}>
                  See the Gallery
                </Link>
              </div>

              {/* Trust chips */}
              <div className="hero-trust">
                {["Instant pricing", "48h avg turnaround", "Perth pickup", "Ships Australia-wide"].map((t) => (
                  <span key={t} className="trust-item">{t}</span>
                ))}
              </div>
            </div>

            {/* Hero visual — live "now printing" card */}
            <div className="fade-up-2 hidden-mobile" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <NowPrinting />
            </div>
          </div>
        </div>
      </section>

      {/* ── Capability marquee ───────────────────────────────── */}
      <section style={{ margin: "clamp(28px, 5vw, 44px) 0" }}>
        <div className="home-marquee">
          <div className="home-marquee-track">
            {[0, 1].map((dup) => (
              <span key={dup} className="home-marquee-item" aria-hidden={dup === 1}>
                {[
                  "PLA", "PETG", "ABS", "0.1mm layer height", "Multi-colour prints",
                  "Up to 256mm³ build", "Instant quotes", "Perth local", "Fast turnaround",
                  "Quality-checked",
                ].map((cap) => (
                  <span key={cap} className="home-marquee-item">{cap}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <section style={{ margin: "clamp(40px, 7vw, 80px) 0" }}>
        <div
          className="card-lg stats-strip"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 24,
            textAlign: "center",
            background: "linear-gradient(180deg, var(--surface) 0%, var(--bg2) 100%)",
          }}
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
        <div className="sec-head">
          <span className="eyebrow" style={{ marginBottom: 8 }}>How it works</span>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>
            THREE STEPS TO A FINISHED PART
          </h2>
        </div>
        <div className="steps-grid">
          {[
            ["01", "Configure", "Pick your material, colour, quality and size. See a transparent price update instantly — no waiting on a quote."],
            ["02", "We print", "Your job goes on a calibrated FDM machine. We quality-check every part before it leaves the bench."],
            ["03", "Collect or ship", "Pick up locally in Perth or have it shipped Australia-wide. Track every order from your account."],
          ].map(([n, title, body]) => (
            <div key={n} className="step-card">
              <div className="step-num">{n}</div>
              <h3 className="font-display" style={{ fontSize: 23, margin: "14px 0 8px", letterSpacing: "0.04em" }}>{title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-dim)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Materials ────────────────────────────────────────── */}
      <section style={{ marginBottom: "clamp(48px, 8vw, 88px)" }}>
        <div className="sec-head">
          <span className="eyebrow" style={{ marginBottom: 8 }}>Materials</span>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>
            PICK THE RIGHT PLASTIC
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {MATERIALS.map((m) => (
            <div key={m.key} className="mat-card" style={{ boxShadow: `inset 0 0 0 1px transparent` }}>
              <div className="mat-accent-bar" style={{ background: `linear-gradient(90deg, ${m.accent}, transparent)` }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <span className="font-display" style={{ fontSize: 30, color: m.accent, letterSpacing: "0.06em", display: "block", lineHeight: 1 }}>{m.name}</span>
                  <div className="mat-swatches" aria-hidden="true">
                    <span className="mat-swatch" style={{ background: m.accent }} />
                    <span className="mat-swatch" style={{ background: m.accent, opacity: 0.6 }} />
                    <span className="mat-swatch" style={{ background: m.accent, opacity: 0.3 }} />
                  </div>
                </div>
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
        <div className="sec-head">
          <span className="eyebrow" style={{ marginBottom: 8 }}>Recent work</span>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>FROM THE BUILD PLATE</h2>
        </div>
        <div className="gallery-grid">
          {HOME_GALLERY.map((p) => (
            <div key={p.src} className="g-tile">
              <span className="g-cat">{p.category}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                style={{ display: "block", width: "100%", height: 190, objectFit: "cover" }}
              />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{p.title}</div>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>
                  {p.material}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <Link href="/gallery" className="btn-ghost" style={{ fontSize: 14, padding: "11px 26px" }}>
            Browse the full gallery →
          </Link>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section style={{ marginBottom: "clamp(48px, 8vw, 88px)" }}>
        <div className="sec-head">
          <span className="eyebrow" style={{ marginBottom: 8 }}>What customers say</span>
          <h2 className="font-display" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>TRUSTED BY PERTH MAKERS</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card" style={{ display: "flex", flexDirection: "column", position: "relative" }}>
              <span className="font-display" aria-hidden="true" style={{ position: "absolute", top: 8, right: 18, fontSize: 64, lineHeight: 1, color: "var(--orange)", opacity: 0.12 }}>”</span>
              <div style={{ marginBottom: 12 }}>
                <Stars rating={t.rating} size={13} color="#6f685b" />
              </div>
              <p style={{ fontSize: 14.5, color: "var(--text)", marginBottom: 16, lineHeight: 1.6, flex: 1 }}>“{t.quote}”</p>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{t.name}</div>
              <div className="font-mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", marginTop: 2 }}>{t.detail}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
          <Link href="/reviews/new" className="btn-primary" style={{ fontSize: 14, padding: "10px 24px" }}>
            Leave a review →
          </Link>
          <Link href="/reviews" className="btn-ghost" style={{ fontSize: 14, padding: "10px 24px" }}>
            See all reviews
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section>
        <div className="home-cta">
          <span className="eyebrow" style={{ marginBottom: 12 }}>Ready when you are</span>
          <h2 className="font-display" style={{ fontSize: "clamp(32px, 6vw, 58px)", marginBottom: 8 }}>
            LET&apos;S PRINT <span className="grad-text">SOMETHING</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 480, margin: "0 auto 28px" }}>
            From a single keyring to a full cosplay build — configure it, price it, and we&apos;ll
            have it on the plate.
          </p>
          <Link href="/quote" className="btn-primary glow-pulse" style={{ fontSize: 18, padding: "14px 36px" }}>
            Get Your Instant Price →
          </Link>
        </div>
      </section>
    </>
  );
}
