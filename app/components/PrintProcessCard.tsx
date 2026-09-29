import Link from "next/link";

const steps = [
  { number: "01", title: "Upload", detail: "Add your STL file" },
  { number: "02", title: "Review", detail: "Check your itemised quote" },
  { number: "03", title: "Approve", detail: "We begin after approval" },
];

export default function PrintProcessCard() {
  return (
    <section className="process-card" aria-labelledby="process-card-title">
      <div className="process-card-topline">
        <span className="process-card-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M6 9.5 16 4l10 5.5v13L16 28 6 22.5v-13Z" />
            <path d="m6.5 9.8 9.5 5.4 9.5-5.4M16 15.5V27" />
            <path d="m11 6.8 10 5.7" />
          </svg>
        </span>
        <span className="font-mono process-card-label">Made to order · Perth, WA</span>
      </div>

      <div className="process-card-rule" />

      <h2 id="process-card-title" className="font-display process-card-title">
        A clear path from file to finished part.
      </h2>
      <p className="process-card-copy">
        Get a quote for your design, review the details, then approve the order
        before production begins.
      </p>

      <ol className="process-steps">
        {steps.map((step) => (
          <li key={step.number}>
            <span className="font-mono process-step-number">{step.number}</span>
            <span className="process-step-copy">
              <strong>{step.title}</strong>
              <span>{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <Link href="/guide" className="process-card-link">
        How it works <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
