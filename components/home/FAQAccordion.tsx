"use client";

import { useState } from "react";

type QA = { q: string; a: string };

const faqs: QA[] = [
  {
    q: "How is the price worked out?",
    a: "From the actual mesh volume of your STL, plus material cost and rough print time. You see the whole breakdown before you pay. No setup fees, no minimum order.",
  },
  {
    q: "How long does it take?",
    a: "A few business days for most small jobs. If the queue is busy or the print is big, I'll tell you up front and you can decide from there. I'd rather be honest than optimistic.",
  },
  {
    q: "What if it fails or arrives broken?",
    a: "Send me a photo and I'll reprint it. If you'd rather have your money back, that's fine too. No forms, no debate.",
  },
  {
    q: "What file formats work?",
    a: "STL is easiest. If you've only got a STEP or OBJ I can usually work with it — just ask. Most CAD tools (Fusion 360, Tinkercad, Blender, SolidWorks) export STL.",
  },
  {
    q: "Can I pick up in Perth?",
    a: "Yeah — free pickup in the Perth metro area once it's ready, or tracked post anywhere in Australia. Pick whichever suits when you check out.",
  },
  {
    q: "Which material should I pick?",
    a: "PLA unless there's a reason not to — it looks good and prints reliably. PETG if it'll live outside or take some abuse. ABS if you really need the heat and impact resistance. Happy to give an opinion if you're not sure.",
  },
  {
    q: "Is payment safe?",
    a: "Checkout goes through Stripe. I never see your card details.",
  },
  {
    q: "Can I send a bigger or multi-part job?",
    a: "Yes. Upload as many files as you like in one quote, mix materials and colours per file. For anything unusually large or fiddly, just message me and we'll sort it out.",
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
