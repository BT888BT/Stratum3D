import Link from "next/link";
import BuildPlateHero from "@/components/home/BuildPlateHero";
import Reveal from "@/components/home/Reveal";
import FAQAccordion from "@/components/home/FAQAccordion";

const materials = [
  {
    name: "PLA",
    colour: "#fb923c",
    tag: "Everyday",
    desc: "The default. Good for display pieces, cosplay, tabletop, enclosures that don't live in a car.",
  },
  {
    name: "PETG",
    colour: "#f97316",
    tag: "Tougher",
    desc: "More flex, handles heat and moisture better. Outdoor stuff, brackets, things that get dropped.",
  },
  {
    name: "ABS",
    colour: "#ea580c",
    tag: "Engineering",
    desc: "Impact and heat resistance. Takes longer, costs more, worth it when you need it.",
  },
];

const steps = [
  { n: "01", title: "Send the STL", desc: "Drop a file on the quote page. Multiple files is fine." },
  { n: "02", title: "Pick settings", desc: "Material, colour, layer height, infill. Ask if you're not sure." },
  { n: "03", title: "See the price", desc: "It's based on the actual volume of your model. No minimums." },
  { n: "04", title: "I print it", desc: "Usually a few days. Pickup in Perth or tracked post." },
];

export default function HomePage() {
  return (
    <div className="page-stack">
      {/* HERO */}
      <section className="hero-quiet">
        <div className="hero-quiet-copy">
          <Reveal>
            <span className="eyebrow-quiet">Perth · small-batch 3D printing</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero-heading">
              I print things<br />for people who make things.
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="hero-lede">
              Stratum3D is one person, a couple of well-tuned FDM printers, and
              a workbench in Perth. Hobby projects, prototypes, replacement
              parts, the occasional weird idea — send the file and I'll print it.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="hero-actions">
              <Link href="/quote" className="btn-quiet-primary">Get a quote</Link>
              <Link href="/gallery" className="btn-quiet-ghost">See past prints</Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={320}>
          <div className="hero-quiet-visual">
            <BuildPlateHero />
          </div>
        </Reveal>
      </section>

      {/* WHAT I PRINT */}
      <section className="section-quiet">
        <Reveal>
          <h2 className="h2-quiet">What I print</h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="lede-quiet">
            Small to medium FDM work — under 25 × 25 × 25 cm per piece, larger
            things split into parts. Three materials I keep stocked and actually
            know how to dial in.
          </p>
        </Reveal>

        <div className="materials-quiet">
          {materials.map((m, i) => (
            <Reveal key={m.name} delay={i * 80}>
              <article className="material-quiet">
                <div
                  className="material-quiet-dot"
                  style={{ background: m.colour }}
                  aria-hidden
                />
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
          <h2 className="h2-quiet">How it works</h2>
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
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* HONEST BIT */}
      <section className="section-quiet">
        <Reveal>
          <h2 className="h2-quiet">The honest bit</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="honest-quiet">
            <p>
              I'm not an industrial print farm. Turnaround depends on the queue —
              most orders ship within a few business days, bigger jobs take
              longer and I'll tell you up front.
            </p>
            <p>
              Prices are worked out from the actual mesh volume of your file,
              plus material cost and print time. No setup fees, no minimum
              order, no &ldquo;complexity surcharge&rdquo; nonsense.
            </p>
            <p>
              If a print fails on my end, or it arrives damaged, send me a photo
              and I'll reprint it. That's it — no forms, no 14-day runaround.
            </p>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="section-quiet">
        <Reveal>
          <h2 className="h2-quiet">Common questions</h2>
        </Reveal>
        <Reveal delay={80}>
          <FAQAccordion />
        </Reveal>
      </section>

      {/* SIMPLE CTA */}
      <section className="cta-quiet">
        <Reveal>
          <p className="cta-quiet-line">Got a file? I&apos;ll take a look.</p>
        </Reveal>
        <Reveal delay={80}>
          <Link href="/quote" className="btn-quiet-primary">Start a quote</Link>
        </Reveal>
      </section>
    </div>
  );
}
