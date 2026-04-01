import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Stratum3D" };

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <span className="eyebrow" style={{ marginBottom: 10 }}>Legal</span>
      <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 8 }}>PRIVACY POLICY</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>Last updated: April 2026</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>

        <Section title="Who we are">
          Stratum3D is a 3D printing service operated by PrintSphere Creations, based in Australia. When we say "we", "us" or "our" in this policy, we mean PrintSphere Creations.
        </Section>

        <Section title="What we collect">
          When you place an order, we collect your full name, email address, and shipping address. We also store the 3D model files (STL) you upload for printing. Payment is processed by Stripe — we do not store your card details. Stripe&apos;s own privacy policy governs how they handle payment information.
        </Section>

        <Section title="Why we collect it">
          We use your information to process and fulfil your order, calculate shipping, send order confirmation and status update emails, and contact you if there is an issue with your print. We do not use your information for marketing unless you separately opt in.
        </Section>

        <Section title="How we store it">
          Your order data is stored in a secure database hosted by Supabase (servers in Australia/Singapore region). Uploaded STL files are stored in Supabase Storage. Access is restricted to authorised administrators only. We use HTTPS encryption for all data in transit.
        </Section>

        <Section title="Who we share it with">
          We share your information only with the services needed to fulfil your order: Stripe for payment processing, Resend for transactional emails, and Australia Post or the relevant courier for shipping. We do not sell, rent, or share your data with anyone else.
        </Section>

        <Section title="How long we keep it">
          We retain order records and files for as long as needed to fulfil the order and handle any follow-up (typically 90 days after completion). Unpaid quotes are automatically deleted within 24 hours. You can request deletion of your data at any time by emailing us.
        </Section>

        <Section title="Your rights">
          Under the Australian Privacy Act, you have the right to access the personal information we hold about you, request correction of inaccurate information, and request deletion of your data. To exercise any of these rights, email us at orders@stratum3d.com.au.
        </Section>

        <Section title="Cookies">
          We use essential cookies only — a session cookie for admin authentication. We do not use tracking cookies, analytics, or advertising cookies. Google Maps is loaded on the quote page for address autocomplete, which is subject to Google&apos;s own privacy policy.
        </Section>

        <Section title="Changes to this policy">
          We may update this policy from time to time. Material changes will be posted on this page with an updated date. Your continued use of the site after changes constitutes acceptance.
        </Section>

        <Section title="Contact">
          If you have questions about this policy or your personal data, email us at orders@stratum3d.com.au.
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
