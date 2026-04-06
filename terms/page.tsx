import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — Stratum3D" };

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <span className="eyebrow" style={{ marginBottom: 10 }}>Legal</span>
      <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 8 }}>TERMS OF SERVICE</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>Last updated: April 2026</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>

        <Section title="Agreement">
          By placing an order through Stratum3D (operated by PrintSphere Creations), you agree to these terms. If you do not agree, please do not use this service.
        </Section>

        <Section title="Orders and pricing">
          Prices are quoted in Australian Dollars (AUD) and include GST. Quotes are calculated automatically based on your model&apos;s volume, selected material, layer height, infill, and quantity. A flat shipping fee applies per order. Quotes are valid at the time of checkout — if you do not complete payment, the quote may expire.
        </Section>

        <Section title="Payment">
          Payment is processed securely through Stripe. Your order is only confirmed once payment is successfully received. We do not store your payment card details. Unpaid quotes are automatically removed from our system.
        </Section>

        <Section title="Files and intellectual property">
          You retain full ownership of the 3D model files you upload. By submitting files, you confirm that you have the right to print the model and that it does not infringe on anyone else&apos;s intellectual property. We store your files only for the purpose of fulfilling your order and delete them within 90 days of completion.
        </Section>

        <Section title="Print quality">
          FDM 3D printing produces parts with visible layer lines and minor surface imperfections — this is normal and expected. Print dimensions may vary by ±0.5mm due to the nature of FDM printing. Colours may vary slightly between batches of filament. We do our best to produce quality prints but cannot guarantee perfection on every part.
        </Section>

        <Section title="Turnaround time">
          Most orders are printed and shipped within a few business days, but turnaround times may vary depending on order volume, complexity, and material availability. We do not guarantee specific delivery dates unless explicitly agreed in writing.
        </Section>

        <Section title="Refunds and reprints">
          If your print arrives damaged or with a clear defect caused by a printing error (not a design issue), contact us within 7 days at orders@stratum3d.com.au with photos. We will reprint the affected part or issue a refund at our discretion. We do not offer refunds for design issues, incorrect file submissions, or normal FDM print characteristics (layer lines, minor stringing, etc.).
        </Section>

        <Section title="Prohibited content">
          We reserve the right to refuse any order at our discretion. We will not print models that are illegal, contain offensive content, or are designed as functional weapons or weapon components.
        </Section>

        <Section title="Limitation of liability">
          Stratum3D and PrintSphere Creations are not liable for indirect, incidental, or consequential damages arising from the use of our service. Our total liability for any claim is limited to the amount you paid for the specific order in question.
        </Section>

        <Section title="Changes to these terms">
          We may update these terms from time to time. Material changes will be posted on this page. Continued use of the service after changes constitutes acceptance of the updated terms.
        </Section>

        <Section title="Governing law">
          These terms are governed by the laws of Australia. Any disputes will be subject to the jurisdiction of Australian courts.
        </Section>

        <Section title="Contact">
          For questions about these terms, email us at orders@stratum3d.com.au.
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
