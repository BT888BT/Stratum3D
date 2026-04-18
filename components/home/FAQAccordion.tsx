"use client";

import { useState } from "react";

type QA = { q: string; a: string };

const faqs: QA[] = [
  {
    q: "How is the quote calculated?",
    a: "Pricing is based on the actual mesh volume of your STL file, plus material cost and print time. You see the full breakdown before checkout — there are no minimum orders, setup fees, or hidden extras.",
  },
  {
    q: "How long until my print is ready?",
    a: "Most orders print and ship within 2–4 business days of payment. Complex or large jobs may take longer — you'll get an estimate with your quote and email updates through every stage.",
  },
  {
    q: "What if my print fails or arrives damaged?",
    a: "We stand behind every print. If there's a print defect or shipping damage, send a photo within 7 days and we'll reprint or refund, no questions asked.",
  },
  {
    q: "Which file formats do you accept?",
    a: "STL is our primary format. Files up to 50 MB each. Most CAD programs (Fusion 360, Tinkercad, Blender, SolidWorks) can export STL directly.",
  },
  {
    q: "Can I pick up in Perth?",
    a: "Yes — free local pickup in Perth metro, or we ship Australia-wide via tracked courier. You choose at checkout.",
  },
  {
    q: "What material should I pick?",
    a: "PLA is the default for display models, props, and general hobby use. PETG is tougher and handles moisture/heat better — great for functional parts. ABS is for engineering jobs that need real impact and heat resistance.",
  },
  {
    q: "Is my payment secure?",
    a: "Checkout is processed by Stripe — the same payment infrastructure used by Shopify, Amazon, and most of the web. We never see or store your card details.",
  },
  {
    q: "Can I order large or multi-part jobs?",
    a: "Absolutely. Upload multiple STLs in one quote, mix materials and colours per file, and we'll batch them efficiently. For unusually large jobs, reach out and we'll quote directly.",
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
