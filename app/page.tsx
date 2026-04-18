import Link from "next/link";
import BuildPlateHero from "@/components/home/BuildPlateHero";
import TiltCard from "@/components/home/TiltCard";
import MagneticButton from "@/components/home/MagneticButton";
import StatsCounter from "@/components/home/StatsCounter";
import Reveal from "@/components/home/Reveal";
import Marquee from "@/components/home/Marquee";
import LiveActivityFeed from "@/components/home/LiveActivityFeed";
import FAQAccordion from "@/components/home/FAQAccordion";

const materials = [
  {
    name: "PLA",
    colour: "#fb923c",
    desc: "Great for hobby projects, display models and cosplay props.",
    temp: "190–220°C",
    strength: "Good",
    use: "Hobby / General",
    bestFor: "Display · Cosplay · Props",
  },
  {
    name: "PETG",
    colour: "#f97316",
    desc: "Durable, moisture resistant — ideal for outdoor or functional parts.",
    temp: "230–250°C",
    strength: "Very Good",
    use: "Functional",
    bestFor: "Outdoor · Fixtures · Brackets",
  },
  {
    name: "ABS",
    colour: "#ea580c",
    desc: "Heat resistant, impact tough — suited for mechanical or engineering use.",
    temp: "230–260°C",
    strength: "Excellent",
    use: "Engineering",
    bestFor: "Automotive · Tooling · Mechanical",
  },
];

const steps = [
  {
    n: "01",
    icon: "⬆",
    title: "UPLOAD STL",
    desc: "Drop one or more STL files, up to 50 MB each. Meshes validated instantly on the client.",
  },
  {
    n: "02",
    icon: "⚙",
    title: "CONFIGURE",
    desc: "Pick material, colour, layer height and infill for every file — individually.",
  },
  {
    n: "03",
    icon: "$",
    title: "INSTANT QUOTE",
    desc: "Price calculated from actual mesh volume. No hidden fees, no setup charges, no surprise add-ons.",
  },
  {
    n: "04",
    icon: "✓",
    title: "PAY & TRACK",
    desc: "Secure Stripe checkout, email updates every stage, fast local shipping or free Perth pickup.",
  },
];

const perks = [
  {
    title: "Local & Australian",
    desc: "Based in Perth, WA. Shorter shipping, local support, zero overseas delays.",
  },
  {
    title: "Fast Turnaround",
    desc: "Most orders print and ship within 2–4 business days of payment.",
  },
  {
    title: "Hobbyist Friendly",
    desc: "Low-cost pricing built for makers, hobbyists and small creative projects.",
  },
  {
    title: "Honest Pricing",
    desc: "Pay for what you print — volume-based quotes with no minimum order.",
  },
];

const useCases = [
  { label: "For", title: "COSPLAY & PROPS", glyph: "★" },
  { label: "For", title: "PROTOTYPES", glyph: "◈" },
  { label: "For", title: "HOBBY", glyph: "♦" },
  { label: "For", title: "FUNCTIONAL PARTS", glyph: "◉" },
  { label: "For", title: "EDUCATION", glyph: "✎" },
  { label: "For", title: "SMALL BATCH", glyph: "⬢" },
];

/*
 * Testimonials — PLACEHOLDERS. Replace with real quotes from your customers.
 * Keep the structure; swap quote / name / location / initials.
 */
const testimonials = [
  {
    quote:
      "Dropped my STL in at lunch, had a quote in under a minute. Print was on my desk Thursday. No messing around.",
    name: "[Your customer]",
    location: "Perth, WA",
    initials: "PC",
  },
  {
    quote:
      "Used to order overseas and wait three weeks. Now I iterate on prototypes every few days without blowing the budget.",
    name: "[Your customer]",
    location: "Fremantle, WA",
    initials: "FM",
  },
  {
    quote:
      "Clean surface finish, tight tolerances, and they actually cared when I asked about layer heights. Local support matters.",
    name: "[Your customer]",
    location: "Joondalup, WA",
    initials: "JL",
  },
];

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(80px, 10vw, 140px)" }}>
      {/* ═══════════════════════════════════════════
          HERO — value prop + CTA + social proof
          ═══════════════════════════════════════════ */}
      <section className="hero-wrap">
        <div className="hero-grid-bg" />
        <div className="hero-scanline" />

        <div className="hero-layout">
          <div style={{ position: "relative", zIndex: 1 }}>
            <Reveal delay={0}>
              <span className="chip">
                <span className="chip-dot" />
                Perth, WA · Local 3D Printing
              </span>
            </Reveal>

            <h1
              className="kinetic-heading"
              style={{ marginTop: 24, marginBottom: 24 }}
            >
              <span className="line">
                <span className="word" style={{ animationDelay: "0.05s" }}>
                  UPLOAD.
                </span>
              </span>
              <span className="line">
                <span className="word" style={{ animationDelay: "0.18s" }}>
                  QUOTE.
                </span>
              </span>
              <span className="line">
                <span
                  className="word word-stroke"
                  style={{ animationDelay: "0.32s" }}
                >
                  PRINT.
                </span>
              </span>
            </h1>

            <Reveal delay={400}>
              <p
                style={{
                  fontSize: "clamp(15px, 1.6vw, 18px)",
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                  marginBottom: 28,
                }}
              >
                Affordable FDM printing for hobbyists and makers in Perth. PLA, PETG
                and ABS — priced from your actual mesh volume. No minimum order.{" "}
                <strong style={{ color: "var(--text)" }}>
                  Instant quote in under a minute.
                </strong>
              </p>
            </Reveal>

            <Reveal delay={500}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <MagneticButton href="/quote">GET INSTANT QUOTE →</MagneticButton>
                <a href="#how-it-works" className="btn-ghost" style={{ padding: "14px 24px" }}>
                  How it works
                </a>
              </div>
            </Reveal>

            <Reveal delay={600}>
              <div className="trust-strip">
                <div className="trust-item">
                  <span className="trust-item-icon">◉</span>
                  <span className="trust-item-title">Perth Local</span>
                  <span className="trust-item-sub">Made in WA</span>
                </div>
                <div className="trust-item">
                  <span className="trust-item-icon">⚡</span>
                  <span className="trust-item-title">2–4 Day Turnaround</span>
                  <span className="trust-item-sub">On most orders</span>
                </div>
                <div className="trust-item">
                  <span className="trust-item-icon">✓</span>
                  <span className="trust-item-title">Reprint Promise</span>
                  <span className="trust-item-sub">If we drop the ball</span>
                </div>
                <div className="trust-item">
                  <span className="trust-item-icon">🔒</span>
                  <span className="trust-item-title">Stripe Secure</span>
                  <span className="trust-item-sub">No card stored</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div>
            <BuildPlateHero />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE — kinetic band
          ═══════════════════════════════════════════ */}
      <Marquee
        items={[
          "PLA · PETG · ABS",
          "PERTH / WESTERN AUSTRALIA",
          "FDM · VOLUMETRIC PRICING",
          "UPLOAD / SLICE / SHIP",
          "MADE LOCAL",
        ]}
        speed={45}
      />

      {/* ═══════════════════════════════════════════
          LIVE ACTIVITY + STATS (social proof)
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Workshop Status</span>
            <span className="section-label-num">// 01</span>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}
             className="live-and-stats">
          <Reveal delay={80}>
            <LiveActivityFeed />
          </Reveal>
          <Reveal delay={180}>
            <StatsCounter />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPARISON — local vs overseas (objection kill)
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Why Local</span>
            <span className="section-label-num">// 02</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="section-heading">
            WHY NOT JUST{" "}
            <span className="section-heading-stroke">ORDER OVERSEAS?</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="section-sub">
            Cheap up-front. Slow, silent, and risky in practice. Here&apos;s how Perth-local
            stacks up against a $2 overseas print shop.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="compare-grid">
            <div className="compare-col compare-col-bad">
              <div className="compare-col-head">
                <span className="compare-col-tag compare-tag-bad">The Other Way</span>
              </div>
              <h3>Overseas / Big Marketplace</h3>
              <ul className="compare-list">
                <li className="compare-item">
                  <span className="compare-mark compare-mark-bad">×</span>
                  <span className="compare-item-text">
                    <strong>2–4 week wait</strong> — including customs delays
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-bad">×</span>
                  <span className="compare-item-text">
                    Hidden fees, <strong>setup charges</strong> and minimum orders
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-bad">×</span>
                  <span className="compare-item-text">
                    Template replies when a print fails. Weeks of back-and-forth.
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-bad">×</span>
                  <span className="compare-item-text">
                    No idea who&apos;s printing it, on what machine, with which filament
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-bad">×</span>
                  <span className="compare-item-text">
                    Damage in shipping = your problem
                  </span>
                </li>
              </ul>
            </div>

            <div className="compare-col compare-col-good">
              <div className="compare-col-head">
                <span className="compare-col-tag compare-tag-good">Stratum3D</span>
              </div>
              <h3>Local Perth · WA</h3>
              <ul className="compare-list">
                <li className="compare-item">
                  <span className="compare-mark compare-mark-good">✓</span>
                  <span className="compare-item-text">
                    <strong>2–4 day turnaround</strong> — shipped domestic or picked up locally
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-good">✓</span>
                  <span className="compare-item-text">
                    <strong>Volumetric pricing.</strong> Pay for what you print. No minimum.
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-good">✓</span>
                  <span className="compare-item-text">
                    <strong>Reprint promise.</strong> Print fails or arrives damaged — we fix it.
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-good">✓</span>
                  <span className="compare-item-text">
                    You pick material, colour, layer height, infill — <strong>per file</strong>
                  </span>
                </li>
                <li className="compare-item">
                  <span className="compare-mark compare-mark-good">✓</span>
                  <span className="compare-item-text">
                    Real human support. Same time zone. Direct replies.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          WHY US (perks tilt cards)
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Built For Makers</span>
            <span className="section-label-num">// 03</span>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: 16,
          }}
        >
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <TiltCard max={6}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 22,
                    color: "var(--orange)",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                  {p.desc}
                </p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROCESS (sticky stack)
          ═══════════════════════════════════════════ */}
      <section id="how-it-works">
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Process</span>
            <span className="section-label-num">// 04</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="section-heading">
            HOW IT <span className="section-heading-orange">WORKS</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="section-sub">
            Four steps, all online, no calls or back-and-forth needed.
          </p>
        </Reveal>

        <div className="process-track">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="process-card"
              style={{
                top: `${80 + i * 14}px`,
                transform: `scale(${1 - i * 0.015})`,
              }}
            >
              <div className="process-step-num">{s.n}</div>
              <div className="process-step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              <div className="process-step-icon">{s.icon}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING TABLE — transparent materials price
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Materials · Pricing</span>
            <span className="section-label-num">// 05</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="section-heading">
            FILAMENT <span className="section-heading-orange">LIBRARY</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="section-sub">
            Pricing is quoted from your actual mesh volume — the numbers below are
            indicative for a small-to-medium part. Your exact price is calculated live
            the second you upload.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="price-table">
            <div className="price-row price-row-head">
              <div>Mat.</div>
              <div>Name / Best For</div>
              <div>Strength</div>
              <div>Print Temp</div>
              <div>Quote From</div>
            </div>
            {materials.map((m) => (
              <div key={m.name} className="price-row">
                <div
                  className="price-mat-dot"
                  style={{ background: m.colour, color: m.colour }}
                />
                <div>
                  <div className="price-mat-name" style={{ color: m.colour }}>
                    {m.name}
                  </div>
                  <div className="price-mat-best">{m.bestFor}</div>
                </div>
                <div>
                  <div
                    className="price-value"
                    style={{ color: "var(--green)" }}
                  >
                    {m.strength}
                  </div>
                </div>
                <div>
                  <div className="price-value" style={{ fontSize: 16 }}>
                    {m.temp}
                  </div>
                </div>
                <div>
                  <div className="price-value">Live</div>
                  <div className="price-value-sub">Per volume</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={260}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 28,
            }}
          >
            <MagneticButton href="/quote">See My Exact Price →</MagneticButton>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          USE CASES BENTO
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Use Cases</span>
            <span className="section-label-num">// 06</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="section-heading">
            WHAT <span className="section-heading-orange">MAKERS BUILD</span>
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <div className="bento">
            <Link href="/gallery" className="bento-tile bento-feature bento-span-2 bento-row-2">
              <span className="bento-tile-label">Our Work</span>
              <span className="bento-tile-title" style={{ fontSize: 40, lineHeight: 1 }}>
                VIEW RECENT
                <br />
                PRINTS →
              </span>
              <span className="bento-tile-glyph">◆</span>
            </Link>
            {useCases.map((u) => (
              <div key={u.title} className="bento-tile">
                <span className="bento-tile-label">{u.label}</span>
                <span className="bento-tile-title">{u.title}</span>
                <span className="bento-tile-glyph">{u.glyph}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          MATERIAL CARDS — filament spool visuals
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Material Deep-Dive</span>
            <span className="section-label-num">// 07</span>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 16,
          }}
        >
          {materials.map((m, i) => (
            <Reveal key={m.name} delay={i * 100}>
              <TiltCard className="material-card" max={10}>
                <div className="material-head">
                  <div
                    className="spool"
                    style={{ ["--spool-color" as string]: m.colour }}
                  >
                    <div className="spool-ring" />
                    <div className="spool-hub" />
                  </div>
                  <div>
                    <div className="material-name" style={{ color: m.colour }}>
                      {m.name}
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        marginTop: 6,
                      }}
                    >
                      {m.use}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.65 }}>
                  {m.desc}
                </p>

                <div className="material-meta">
                  <div>
                    <div className="material-meta-key">Print Temp</div>
                    <div className="material-meta-val">{m.temp}</div>
                  </div>
                  <div>
                    <div className="material-meta-key">Strength</div>
                    <div
                      className="material-meta-val"
                      style={{ color: "var(--green)" }}
                    >
                      {m.strength}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">What Makers Say</span>
            <span className="section-label-num">// 08</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="section-heading">
            REAL PRINTS, <span className="section-heading-orange">REAL MAKERS</span>
          </h2>
        </Reveal>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="testimonial">
                <div className="testimonial-stars">★ ★ ★ ★ ★</div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-meta">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-loc">{t.location}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GUARANTEE / RISK REVERSAL
          ═══════════════════════════════════════════ */}
      <Reveal>
        <section className="guarantee-wrap">
          <div className="guarantee-seal" aria-hidden>
            <div className="guarantee-seal-ring" />
            <div className="guarantee-seal-core">
              <span className="guarantee-seal-main">
                REPRINT
                <br />
                PROMISE
              </span>
              <span className="guarantee-seal-sub">// Stratum3D</span>
            </div>
          </div>
          <div className="guarantee-body">
            <h3>IF WE DROP THE BALL, WE FIX IT.</h3>
            <p>
              Every print is inspected before it ships. If something&apos;s off — a failed layer,
              surface defect, damaged in transit — send us a photo within 7 days and we&apos;ll
              reprint or refund. No forms, no fine print, no debates.
            </p>
            <ul className="guarantee-list">
              <li>No minimum order</li>
              <li>Secure Stripe checkout</li>
              <li>7-day quality guarantee</li>
              <li>Local Perth support</li>
            </ul>
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════
          FAQ ACCORDION
          ═══════════════════════════════════════════ */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Common Questions</span>
            <span className="section-label-num">// 09</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="section-heading">
            STILL <span className="section-heading-orange">WONDERING?</span>
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <FAQAccordion />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════ */}
      <Reveal>
        <section className="final-cta">
          <div className="honeycomb-bg" />
          <div className="final-cta-rings">
            <div className="final-cta-ring" />
            <div className="final-cta-ring" />
            <div className="final-cta-ring" />
            <div className="final-cta-ring" />
          </div>

          <span className="chip" style={{ marginBottom: 20 }}>
            <span className="chip-dot" /> Ready When You Are
          </span>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(48px, 8vw, 112px)",
              lineHeight: 0.9,
              marginBottom: 20,
              position: "relative",
              zIndex: 1,
            }}
          >
            YOUR PRINT,
            <br />
            <span style={{ color: "transparent", WebkitTextStroke: "2px var(--orange)" }}>
              SHIPPED FAST.
            </span>
          </h2>

          <p
            style={{
              color: "var(--text-dim)",
              fontSize: "clamp(14px, 1.6vw, 17px)",
              maxWidth: 520,
              margin: "0 auto 40px",
              position: "relative",
              zIndex: 1,
              lineHeight: 1.7,
            }}
          >
            Upload your STL. Get an instant, volumetric quote. Pay when you&apos;re ready.
            Backed by our reprint promise.
          </p>

          <div style={{ position: "relative", zIndex: 1 }}>
            <MagneticButton href="/quote">UPLOAD & QUOTE NOW →</MagneticButton>
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              No sign-up · Quote in under 60s
            </span>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
