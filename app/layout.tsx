import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Stratum3D — small-batch 3D printing in Perth",
  description: "A one-maker 3D printing shop in Perth. PLA, PETG and ABS for hobby projects, prototypes and the occasional weird idea. Upload an STL, get a quote, pick it up or have it posted.",
  keywords: "3D printing Perth, hobby 3D printing, FDM Perth, PLA Perth, small batch 3D printing, STL printing Perth",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Stratum3D — small-batch 3D printing in Perth",
    description: "A one-maker shop. Upload an STL, get an honest quote, and I'll print it.",
    url: "https://www.stratum3d.com.au",
    siteName: "Stratum3D",
    locale: "en_AU",
    type: "website",
  },
  alternates: { canonical: "https://www.stratum3d.com.au" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Stratum3D",
  description: "Small-batch 3D printing in Perth, Western Australia. FDM printing in PLA, PETG and ABS for hobby and maker projects.",
  url: "https://www.stratum3d.com.au",
  areaServed: {
    "@type": "State",
    name: "Western Australia",
    containedInPlace: { "@type": "Country", name: "Australia" },
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Perth",
    addressRegion: "WA",
    addressCountry: "AU",
  },
  priceRange: "$",
  serviceType: ["3D Printing", "FDM Printing"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="geo.region" content="AU-WA" />
        <meta name="geo.placename" content="Perth" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SmoothScroll />
        <div className="site-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <Link href="/" className="brand">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <polygon points="16,3 28,10 28,22 16,29 4,22 4,10"
                    stroke="var(--orange)" strokeWidth="1.2" fill="none"/>
                  <circle cx="16" cy="16" r="2.4" fill="var(--orange)"/>
                </svg>
                <span className="brand-name">
                  stratum<span className="brand-accent">3d</span>
                </span>
              </Link>

              <nav className="site-nav">
                <Link href="/gallery" className="nav-link-quiet">Gallery</Link>
                <Link href="/guide" className="nav-link-quiet">Guide</Link>
                <Link href="/quote" className="nav-link-quiet nav-link-cta">Quote</Link>
              </nav>
            </div>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            <div className="site-footer-inner">
              <span className="footer-note">
                Stratum3D · Perth, WA · one person, one or two printers
              </span>
              <div className="footer-links">
                <Link href="/guide">Guide</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
              </div>
              <span className="footer-copy">© {new Date().getFullYear()}</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
