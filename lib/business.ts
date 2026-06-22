// ─── Business identity for tax invoices ──────────────────────────────────────
// Single source of truth for everything that must appear on an invoice.
// Edit the values below (or override via env vars in Vercel) — nothing here is
// secret, so plain defaults are fine.
//
// ⚠️  GST_REGISTERED controls whether documents are a legal "Tax Invoice"
//     (showing the ABN + GST line) or a plain "Invoice". You MUST be registered
//     for GST to issue a tax invoice or charge the 10% GST this site adds.
//     Check your status at https://abr.business.gov.au (ABN Lookup).

export const business = {
  legalName: process.env.BUSINESS_LEGAL_NAME ?? "Stratum3D",
  // Your ABN (active 11 Dec 2025). Good practice to show on every invoice even
  // when not GST-registered. Put it here or set BUSINESS_ABN in Vercel.
  abn: process.env.BUSINESS_ABN ?? "",
  // Whether the business is registered for GST.
  //   true  → issue "Tax Invoice", show ABN + 10% GST line, charge GST.
  //   false → issue plain "Invoice", no GST line, do not charge GST.
  // Stratum3D is a sole trader NOT currently registered for GST (ABN active
  // 11 Dec 2025), so this defaults to false. If you register with the ATO,
  // set BUSINESS_GST_REGISTERED="true" in Vercel to switch everything back on.
  gstRegistered: (process.env.BUSINESS_GST_REGISTERED ?? "false") === "true",
  email: process.env.BUSINESS_EMAIL ?? "orders@stratum3d.com.au",
  address: process.env.BUSINESS_ADDRESS
    ?? "Stirling Central Shopping Centre, 478 Wanneroo Rd, Westminster WA 6061",
  website: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.stratum3d.com.au",
};

/** Format the website for display (strip protocol). */
export function displayWebsite(): string {
  return business.website.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
