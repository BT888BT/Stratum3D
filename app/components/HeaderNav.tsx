"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Header nav — admin pages get the admin controls in this slot; everyone else
// gets the public site nav. Same actions as before, just relocated for admin.
export default function HeaderNav() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/api/admin/invoices/export" className="btn-ghost" style={{ fontSize: 12 }}>Download CSV</a>
        <Link href="/admin/settings" className="btn-ghost" style={{ fontSize: 12 }}>Settings</Link>
        <Link href="/admin/gallery" className="btn-ghost" style={{ fontSize: 12 }}>Gallery</Link>
        <Link href="/admin/colours" className="btn-ghost" style={{ fontSize: 12 }}>Manage Colours</Link>
        <Link href="/admin/discount-codes" className="btn-ghost" style={{ fontSize: 12 }}>Discount Codes</Link>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="btn-ghost" style={{ fontSize: 12 }}>Log out</button>
        </form>
      </nav>
    );
  }

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Link href="/gallery" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Gallery</Link>
      <Link href="/guide" className="nav-link hidden-mobile" style={{ textDecoration: "none" }}>Guide</Link>
      <Link href="/account" className="nav-link" style={{ textDecoration: "none" }}>Track Order</Link>
      <Link href="/quote" className="btn-primary" style={{ fontSize: 14, padding: "8px 20px", marginLeft: 6 }}>
        Get Quote
      </Link>
    </nav>
  );
}
