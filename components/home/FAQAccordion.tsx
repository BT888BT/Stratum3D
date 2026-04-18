"use client";

import { useState } from "react";

type QA = { q: string; a: string };

const faqs: QA[] = [
  {
    q: "How is the price worked out?",
    a: "Quotes are generated from your actual mesh volume, plus material cost and print time — no setup fees, no minimums. You see the full breakdown before you pay.",
  },
  {
    q: "How fast is turnaround?",
    a: "Most jobs print and ship within 2 – 4 business days of payment. Larger or multi-part batches take a little longer, with an estimate confirmed alongside your quote.",
  },
  {
    q: "What happens if a print isn't right?",
    a: "Every print is inspected before it leaves the bench. If something's off — a bad layer, damaged in transit — send a photo within 7 days and it'll be reprinted or refunded.",
  },
  {
    q: "Which file formats work?",
    a: "STL is ideal, up to 50 MB per file. STEP and OBJ can also be worked with on request. Most CAD tools — Fusion 360, Tinkercad, Blender, SolidWorks — export STL directly.",
  },
  {
    q: "Can I pick up in Perth?",
    a: "Yes. Free local pickup across the Perth metro area, or tracked courier Australia-wide. Choose at checkout.",
  },
  {
    q: "Which material should I pick?",
    a: "PLA for display and detail, PETG for durability and outdoor use, ABS for engineering and heat-resistant parts. Not sure? Mention what the part is for in the notes and it'll be matched for you.",
  },
  {
    q: "Is payment secure?",
    a: "Checkout is handled by Stripe — the same infrastructure behind most major online retailers. Card details are never seen or stored by Stratum3D.",
  },
  {
    q: "Can I order large or multi-part jobs?",
    a: "Absolutely. Upload as many STLs as you like in a single quote, mix materials and colours per file, and jobs are batched for efficiency.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="faq-list">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className={`faq-item ${isOpen ? "faq-open" : ""}`}>
            <button
              className="faq-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="faq-q-num font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="faq-q-text">{f.q}</span>
              <span className="faq-q-chev" aria-hidden>
                +
              </span>
            </button>
            <div className="faq-a-wrap">
              <p className="faq-a">{f.a}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
