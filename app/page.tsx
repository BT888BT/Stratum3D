import Link from "next/link";
import BuildPlateHero from "@/components/home/BuildPlateHero";
import Reveal from "@/components/home/Reveal";
import FAQAccordion from "@/components/home/FAQAccordion";

const materials = [
  {
    name: "PLA",
    colour: "#fb923c",
    tag: "Everyday",
    temp: "210°C",
    desc: "Crisp detail, wide colour range. Display pieces, tabletop, enclosures, cosplay.",
  },
  {
    name: "PETG",
    colour: "#f97316",
    tag: "Durable",
    temp: "240°C",
    desc: "Tougher and heat-tolerant. Outdoor parts, brackets, things that take a knock.",
  },
  {
    name: "ABS",
    colour: "#ea580c",
    tag: "Engineering",
    temp: "250°C",
    desc: "Impact and heat resistance for mechanical work. Printed in an enclosed chamber.",
  },
];

const steps = [
  { n: "01", title: "Upload your STL", desc: "Drop one file or a whole batch on the quote page." },
  { n: "02", title: "Dial in the spec", desc: "Material, colour, layer height, infill — per file." },
  { n: "03", title: "Instant quote", desc: "Priced from your actual mesh volume. No minimums." },
  { n: "04", title: "Printed & shipped", desc: "Pickup in Perth metro or tracked post Australia-wide." },
];

const specs = [
  { k: "Build volume", v: "250 × 250 × 250 mm" },
  { k: "Layer heights", v: "0.12 – 0.28 mm" },
  { k: "Wall count", v: "3 perimeters default" },
  { k: "Infill", v: "10 – 80% gyroid" },
  { k: "Nozzle", v: "0.4 mm hardened" },
  { k: "Tolerance", v: "±0.2 mm typical" },
];

export default function HomePage() {
  return (
    <div className="page-stack">
      {/* HERO */}
      <section className="hero-quiet">
        <div className="hero-quiet-copy">
          <Reveal>
            <span className="eyebrow-quiet">
              <span className="eyebrow-dot" /> Perth · FDM print shop
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero-heading">
              Clean prints.<br />
              <span className="hero-heading-accent">Dialled in.</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="hero-lede">
              Small-batch FDM printing in PLA, PETG and ABS — tuned for crisp
              detail and accurate fit. Upload an STL, get a volumetric quote,
              and have your part in hand within a few days.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="hero-actions">
              <Link href="/quote" className="btn-quiet-primary">
                Get an instant quote <span className="btn-arrow">→</span>
              </Link>
              <Link href="/gallery" className="btn-quiet-ghost">Recent prints</Link>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <ul className="signal-row">
              <li>
                <span className="signal-key">Turnaround</span>
                <span className="signal-val">2 – 4 days</span>
              </li>
              <li>
                <span className="signal-key">Quote</span>
                <span className="signal-val">Under 60 sec</span>
              </li>
              <li>
                <span className="signal-key">Pickup</span>
                <span className="signal-val">Perth metro</span>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={320}>
          <div className="hero-quiet-visual">
            <BuildPlateHero />
          </div>
        </Reveal>
      </section>

      {/* MATERIALS */}
      <section className="section-quiet">
        <Reveal>
          <div className="section-head-quiet">
            <h2 className="h2-quiet">Materials I keep stocked</h2>
            <span className="section-index">01 / 04</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <p className="lede-quiet">
            Three filaments, all genuine brand-name stock. Profiles tuned and
            test-printed so you don&apos;t get a machine-default result.
          </p>
        </Reveal>

        <div className="materials-quiet">
          {materials.map((m, i) => (
            <Reveal key={m.name} delay={i * 80}>
              <article className="material-quiet">
                <div className="material-quiet-topline">
                  <div
                    className="material-quiet-dot"
                    style={{ background: m.colour, boxShadow: `0 0 10px ${m.colour}66` }}
                    aria-hidden
                  />
                  <span className="material-quiet-temp">{m.temp}</span>
                </div>
                <div className="material-quiet-head">
                  <span className="material-quiet-name">{m.name}</span>
                  <span className="material-quiet-tag">{m.tag}</span>
                </div>
                <p className="material-quiet-desc">{m.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-quiet" id="how-it-works">
        <Reveal>
          <div className="section-head-quiet">
            <h2 className="h2-quiet">From file to finished part</h2>
            <span className="section-index">02 / 04</span>
          </div>
        </Reveal>

        <ol className="steps-quiet">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 60}>
              <li className="step-quiet">
                <span className="step-quiet-n">{s.n}</span>
                <div>
                  <h3 className="step-quiet-title">{s.title}</h3>
                  <p className="step-quiet-desc">{s.desc}</p>
                </div>
                <span className="step-quiet-mark" aria-hidden>
                  {i === steps.length - 1 ? "■" : "─"}
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* SPECS / CRAFT */}
      <section className="section-quiet">
        <Reveal>
          <div className="section-head-quiet">
            <h2 className="h2-quiet">The shop, in numbers</h2>
            <span className="section-index">03 / 04</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <p className="lede-quiet">
            Runs on well-maintained FDM hardware with enclosed builds for ABS.
            Every profile is calibrated — flow, pressure advance, retraction —
            so parts leave the bed looking like they were meant to.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <dl className="specs-grid">
            {specs.map((s) => (
              <div key={s.k} className="spec-cell">
                <dt className="spec-key">{s.k}</dt>
                <dd className="spec-val">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="section-quiet">
        <Reveal>
          <div className="section-head-quiet">
            <h2 className="h2-quiet">Common questions</h2>
            <span className="section-index">04 / 04</span>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <FAQAccordion />
        </Reveal>
      </section>

      {/* CTA */}
      <section className="cta-quiet">
        <Reveal>
          <div className="cta-quiet-inner">
            <div>
              <p className="cta-quiet-eyebrow">Ready when you are</p>
              <p className="cta-quiet-line">Send the file. I&apos;ll take care of the rest.</p>
            </div>
            <Link href="/quote" className="btn-quiet-primary btn-quiet-lg">
              Start a quote <span className="btn-arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
