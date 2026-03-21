import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stratum3D",
  description: "3D printing quotes and orders"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
          <header className="border-b border-neutral-800">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold tracking-wide">
                Stratum3D
              </Link>
              <nav className="flex gap-6 text-sm text-neutral-300">
                <Link href="/quote">Quote</Link>
                <Link href="/admin/orders">Admin</Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
