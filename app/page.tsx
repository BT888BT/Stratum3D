import Link from "next/link";
import BuildPlateHero from "@/components/home/BuildPlateHero";
import TiltCard from "@/components/home/TiltCard";
import MagneticButton from "@/components/home/MagneticButton";
import StatsCounter from "@/components/home/StatsCounter";
import Reveal from "@/components/home/Reveal";
import Marquee from "@/components/home/Marquee";

const materials = [
  {
    name: "PLA",
    colour: "#fb923c",
    desc: "Great for hobby projects, display models and cosplay props.",
    temp: "190–220°C",
    strength: "Good",
    use: "Hobby / General",
  },
  {
    name: "PETG",
    colour: "#f97316",
    desc: "Durable, moisture resistant — ideal for outdoor or functional parts.",
    temp: "230–250°C",
    strength: "Very Good",
    use: "Functional",
  },
  {
    name: "ABS",
    colour: "#ea580c",
    desc: "Heat resistant, impact tough — suited for mechanical or engineering use.",
    temp: "230–260°C",
    strength: "Excellent",
    use: "Engineering",
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
    desc: "Pick material, colour, layer height and infill for every file individually.",
  },
  {
    n: "03",
    icon: "$",
    title: "INSTANT QUOTE",
    desc: "Pricing calculated from actual mesh volume — no hidden fees, no surprise add-ons.",
  },
  {
    n: "04",
    icon: "✓",
    title: "PAY & TRACK",
    desc: "Secure Stripe checkout, then email updates the whole way until it's at your door.",
  },
];

const perks = [
  {
    title: "Local & Australian",
    desc: "Based in Perth, WA. Shorter shipping, local support, zero overseas delays.",
  },
  {
    title: "Fast Turnaround",
    desc: "Most orders printed and shipped within a few business days of payment.",
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

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(80px, 10vw, 140px)" }}>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero-wrap">
        <div className="hero-grid-bg" />
        <div className="hero-scanline" />

        <div className="hero-layout">
          <div style={{ position: "relative", zIndex: 1 }}>
            <Reveal delay={0}>
              <span className="chip">
                <span className="chip-dot" />
                Local 3D Printing · Perth, AU
              </span>
            </Reveal>

            <h1
              className="kinetic-heading"
              style={{ marginTop: 28, marginBottom: 28 }}
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
                  fontSize: "clamp(14px, 1.6vw, 17px)",
                  color: "var(--text-dim)",
                  lineHeight: 1.75,
                  maxWidth: 500,
                  marginBottom: 32,
                }}
              >
                Affordable FDM printing for hobbyists and makers in Perth. PLA, PETG
                and ABS — priced from your actual mesh volume with fast local turnaround.
              </p>
            </Reveal>

            <Reveal delay={500}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <MagneticButton href="/quote">GET A QUOTE →</MagneticButton>
                <a href="#process" className="btn-ghost" style={{ padding: "14px 24px" }}>
                  How it works
                </a>
              </div>
            </Reveal>

            <Reveal delay={650}>
              <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Live
                </span>
                <div className="layer-visual" style={{ flex: 1, maxWidth: 280 }}>
                  {[100, 85, 92, 70, 88, 95].map((w, i) => (
                    <div
                      key={i}
                      className="layer-line"
                      style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
                <span
                  className="font-mono"
                  style={{ fontSize: 10, color: "var(--orange)", whiteSpace: "nowrap" }}
                >
                  Layer by layer
                </span>
              </div>
            </Reveal>
          </div>

          <div>
            <BuildPlateHero />
          </div>
        </div>
      </section>

      {/* ── Kinetic Marquee ───────────────────────── */}
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

      {/* ── Stats ─────────────────────────────────── */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">By The Numbers</span>
            <span className="section-label-num">// 01</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <StatsCounter />
        </Reveal>
      </section>

      {/* ── Why Us ────────────────────────────────── */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Why Stratum3D</span>
            <span className="section-label-num">// 02</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(40px, 7vw, 88px)",
              lineHeight: 0.95,
              marginBottom: "clamp(24px, 4vw, 40px)",
            }}
          >
            BUILT FOR <span style={{ color: "transparent", WebkitTextStroke: "1.5px var(--orange)" }}>MAKERS</span>
          </h2>
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

      {/* ── Process (sticky stack) ────────────────── */}
      <section id="process">
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Process</span>
            <span className="section-label-num">// 03</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(40px, 7vw, 88px)",
              lineHeight: 0.95,
              marginBottom: "clamp(24px, 4vw, 48px)",
            }}
          >
            HOW IT <span style={{ color: "var(--orange)" }}>WORKS</span>
          </h2>
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

      {/* ── Materials ─────────────────────────────── */}
      <section>
        <Reveal>
          <div className="section-label">
            <span className="section-label-text">Filament Library</span>
            <span className="section-label-num">// 04</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(40px, 7vw, 88px)",
              lineHeight: 0.95,
              marginBottom: "clamp(24px, 4vw, 40px)",
            }}
          >
            AVAILABLE <span style={{ color: "var(--orange)" }}>MATERIALS</span>
          </h2>
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

      {/* ── Final CTA ─────────────────────────────── */}
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
              marginBottom: 24,
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
              marginBottom: 40,
              fontSize: "clamp(14px, 1.6vw, 17px)",
              maxWidth: 520,
              margin: "0 auto 40px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Upload your STL, pick your settings, and get an instant price. Affordable
            local printing with fast turnaround.
          </p>

          <div style={{ position: "relative", zIndex: 1 }}>
            <MagneticButton href="/quote">UPLOAD & QUOTE NOW →</MagneticButton>
          </div>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Link
              href="/gallery"
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              View Gallery →
            </Link>
            <Link
              href="/guide"
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Print Guide →
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
