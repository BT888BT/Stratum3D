import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const materials = [
  {
    name: "PLA",
    colour: "#fb923c",
    desc: "The go-to for display models, props, figures and hobby builds. Affordable, available in the widest range of colours, and the most forgiving material to work with.",
    temp: "190–220°C",
    strength: "Good",
    use: "Hobby / Display",
  },
  {
    name: "PETG",
    colour: "#f97316",
    desc: "Tougher, moisture-resistant, and slightly flexible. Best for outdoor parts, functional enclosures, or anything that needs to outlast PLA.",
    temp: "230–250°C",
    strength: "Very Good",
    use: "Functional / Outdoor",
  },
  {
    name: "ABS",
    colour: "#ea580c",
    desc: "Heat-resistant and impact-tough. Built for mechanical parts, enclosures, and components that need to handle real-world stress.",
    temp: "230–260°C",
    strength: "Excellent",
    use: "Engineering / Mechanical",
  },
];

const steps = [
  { n: "01", title: "Upload STL", desc: "Drop your STL files — up to 50 MB each. Multiple files handled in a single order." },
  { n: "02", title: "Configure", desc: "Set material, colour, layer height and infill. Hover any option for an explanation, or read the print guide first." },
  { n: "03", title: "Instant Quote", desc: "Your price is calculated from the actual volume of your model — no estimates, no waiting, no surprise invoices." },
  { n: "04", title: "Pay & Track", desc: "Secure checkout via Stripe. Email updates from print start through to delivery at your door." },
];

const perks = [
  { title: "Perth-Made", desc: "Handled locally in Perth, WA — not routed through a warehouse interstate or overseas. Shorter transit, direct contact, real accountability." },
  { title: "48-Hour Turnaround", desc: "Most orders are printed and dispatched within two business days. If anything changes, you'll hear from us before it affects you." },
  { title: "No Minimum Order", desc: "Print one part or twenty — your order is priced the same either way, based only on what you're actually printing." },
  { title: "Volume-Based Pricing", desc: "Your quote is calculated from your model's real mesh volume — no per-file fees, no flat rates, and no estimates that might change before you pay." },
];

// Cross-section widths for the strata visual (top → bottom, lens profile)
const strataWidths = [22, 30, 40, 52, 66, 78, 86, 90, 90, 86, 78, 66, 52, 40, 30, 22];

const trustItems = [
  "Perth, WA",
  "No minimum order",
  "Ships Australia-wide",
  "Volume-based pricing",
  "PLA · PETG · ABS",
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
      <div style={{ marginBottom: 40 }}>
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
          <polygon points="16,2 29,9 29,23 16,30 3,23 3,9"
            stroke="var(--orange)" strokeWidth="1.5" fill="rgba(249,115,22,0.08)" />
          <polygon points="16,8 23,12 23,20 16,24 9,20 9,12"
            stroke="var(--orange)" strokeWidth="1" fill="rgba(249,115,22,0.12)" opacity="0.6" />
          <circle cx="16" cy="16" r="3" fill="var(--orange)" opacity="0.9" />
        </svg>
      </div>

      <div style={{ width: "100%", maxWidth: 280, marginBottom: 52 }}>
        {[100, 82, 64, 46, 28].map((w, i) => (
          <div key={i} style={{
            height: 2, borderRadius: 1,
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
        We&apos;re temporarily not accepting new orders.<br />
        Check back shortly — we&apos;ll be printing again soon.
      </p>

      <div style={{ width: "100%", maxWidth: 280 }}>
        {[28, 46, 64, 82, 100].map((w, i) => (
          <div key={i} style={{
            height: 2, borderRadius: 1,
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
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(48px, 8vw, 96px)" }}>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", right: "-10%",
          transform: "translateY(-50%)",
          width: "clamp(300px, 50vw, 600px)", height: "clamp(300px, 50vw, 600px)",
          background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "clamp(24px, 4vw, 48px)",
          alignItems: "center",
          padding: "clamp(40px, 6vw, 80px) clamp(24px, 4vw, 48px)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          position: "relative",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Eyebrow with live status dot */}
            <span className="eyebrow fade-up" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--green)", display: "inline-block",
                boxShadow: "0 0 8px var(--green)", flexShrink: 0,
              }} />
              Perth, WA · FDM Printing Service
            </span>
            <h1 className="font-display fade-up-2" style={{
              fontSize: "clamp(52px, 8vw, 100px)",
              lineHeight: 0.95,
              marginBottom: "clamp(16px, 3vw, 28px)",
              color: "var(--text)",
            }}>
              UPLOAD.<br />
              QUOTE.<br />
              <span style={{ color: "var(--orange)", WebkitTextStroke: "1px var(--orange-hi)" }}>PRINT.</span>
            </h1>
            <p className="fade-up-3" style={{
              fontSize: "clamp(14px, 1.8vw, 17px)",
              color: "var(--text-dim)",
              lineHeight: 1.75,
              maxWidth: 480,
              marginBottom: "clamp(24px, 4vw, 40px)",
            }}>
              Volume-based pricing means you pay for exactly what you print — no estimates, no minimums, no surprises. Perth-based FDM service with fast local dispatch.
            </p>
            <div className="fade-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/quote" className="btn-primary glow-pulse" style={{ fontSize: 16 }}>
                Get a Quote →
              </Link>
              <a href="#how-it-works" className="btn-ghost">How it works</a>
            </div>
          </div>

          {/* Strata layer visual */}
          <div className="hidden-mobile"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 40px" }}>
            {/* Print nozzle */}
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "var(--orange-hi)",
              animation: "nozzlePulse 1.8s ease-in-out infinite",
            }} />
            {/* Wire from nozzle to top layer */}
            <div style={{ width: 1, height: 10, background: "rgba(249,115,22,0.2)" }} />
            {/* Layer bars — top to bottom, lens cross-section */}
            {strataWidths.map((w, i) => (
              <div key={i} style={{
                width: w * 2,
                height: 5,
                borderRadius: 2.5,
                background: "var(--orange)",
                marginTop: 3,
                animation: `buildPulse 3s ${(i * 0.16).toFixed(2)}s ease-in-out infinite`,
              }} />
            ))}
            {/* Print bed */}
            <div style={{
              width: 196, height: 3, borderRadius: 1.5,
              background: "rgba(249,115,22,0.1)",
              marginTop: 5,
            }} />
            <span className="font-mono" style={{
              fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", marginTop: 12,
            }}>
              FDM · LAYER BY LAYER
            </span>
          </div>
        </div>

        {/* Layer lines strip below hero card */}
        <div style={{ marginTop: 12, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <span className="eyebrow" style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>Printing</span>
          <div className="layer-visual" style={{ flex: 1 }}>
            {[100,85,92,70,88,95,60,78].map((w, i) => (
              <div key={i} className="layer-line" style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--orange)", whiteSpace: "nowrap" }}>Layer by layer</span>
        </div>

        {/* Trust items */}
        <div style={{
          borderTop: "1px solid var(--border)",
          marginTop: 16,
          padding: "14px 24px 0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px 24px",
        }}>
          {trustItems.map((item, i) => (
            <span key={i} className="trust-item">{item}</span>
          ))}
        </div>
      </section>

      {/* ── Why Stratum3D ── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 20, height: 1, background: "var(--orange)", flexShrink: 0 }} />
          <span className="eyebrow" style={{ display: "inline", margin: 0 }}>Why Us</span>
        </div>
        <h2 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "clamp(12px, 2vw, 20px)" }}>
          WHAT SETS US APART
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 12,
        }}>
          {perks.map((p) => (
            <div key={p.title} className="card" style={{ borderLeft: "2px solid rgba(249,115,22,0.22)" }}>
              <h3 className="font-display" style={{ fontSize: 22, color: "var(--orange)", marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 20, height: 1, background: "var(--orange)", flexShrink: 0 }} />
          <span className="eyebrow" style={{ display: "inline", margin: 0 }}>Process</span>
        </div>
        <h2 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "clamp(12px, 2vw, 20px)" }}>
          HOW IT WORKS
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 12,
        }}>
          {steps.map((s) => (
            <div key={s.n} className="card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: -8, right: -4,
                fontFamily: "Bebas Neue, sans-serif",
                fontSize: 72, color: "rgba(249,115,22,0.06)",
                lineHeight: 1, letterSpacing: "0.04em",
                pointerEvents: "none",
              }}>{s.n}</div>
              <span className="font-mono" style={{
                fontSize: 10, color: "var(--orange)", letterSpacing: "0.12em",
                textTransform: "uppercase", display: "block", marginBottom: 10,
              }}>Step {s.n}</span>
              <h3 className="font-display" style={{ fontSize: 22, color: "var(--text)", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Materials ── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 20, height: 1, background: "var(--orange)", flexShrink: 0 }} />
          <span className="eyebrow" style={{ display: "inline", margin: 0 }}>Materials</span>
        </div>
        <h2 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "clamp(12px, 2vw, 20px)" }}>
          AVAILABLE MATERIALS
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 12,
        }}>
          {materials.map((m) => (
            <div key={m.name} className="card" style={{
              borderColor: "var(--border-hi)",
              background: `linear-gradient(135deg, rgba(249,115,22,0.05) 0%, var(--surface) 100%)`,
            }}>
              <div style={{ marginBottom: 16 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    height: 6, borderRadius: 3, marginBottom: 3,
                    background: m.colour, opacity: 1.1 - i * 0.25,
                    width: `${100 - (i - 1) * 15}%`,
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                <span className="font-display" style={{ fontSize: 32, color: m.colour }}>{m.name}</span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.use}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65, marginBottom: 16 }}>{m.desc}</p>
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <p className="font-mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Print Temp</p>
                  <p className="font-mono" style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>{m.temp}</p>
                </div>
                <div>
                  <p className="font-mono" style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Strength</p>
                  <p className="font-mono" style={{ fontSize: 12, color: "var(--green)", marginTop: 2 }}>{m.strength}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, textAlign: "center" }}>
          Not sure which material to choose?{" "}
          <Link href="/guide" style={{ color: "var(--orange-hi)", textDecoration: "underline" }}>Read the print guide</Link>
          {" "}— it covers settings and recommendations for common project types.
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: "linear-gradient(135deg, #1a0800 0%, var(--surface) 100%)",
        border: "1px solid rgba(249,115,22,0.2)",
        borderRadius: 16,
        padding: "clamp(32px, 5vw, 64px) clamp(24px, 4vw, 48px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <span className="eyebrow" style={{ marginBottom: 16 }}>Start Here</span>
        <h2 className="font-display" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 16, lineHeight: 1 }}>
          YOUR DESIGN.<br />PRINTED IN PERTH.
        </h2>
        <p style={{
          color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 16px)",
          maxWidth: 460, margin: "0 auto clamp(24px, 4vw, 40px)", lineHeight: 1.75,
        }}>
          Upload your STL, configure your settings, and get a real price in seconds — calculated from your model&apos;s volume. No minimums, no waiting.
        </p>
        <Link href="/quote" className="btn-primary glow-pulse" style={{ fontSize: 18 }}>
          Upload & Quote Now →
        </Link>
      </section>

    </div>
  );
}
