import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin login is public
  if (pathname === "/login" || pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // ── CSRF check on admin API mutations (#7) ────────────────
  if (pathname.startsWith("/api/admin") && request.method !== "GET") {
    const origin = request.headers.get("origin");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl && origin && origin !== siteUrl) {
      return NextResponse.json({ error: "CSRF: origin mismatch." }, { status: 403 });
    }
  }

  // ── Session cookie check ──────────────────────────────────
  const sessionCookie = request.cookies.get("stratum3d_admin")?.value;

  // Cookie must be a 64-char hex string (random token format)
  const hasValidCookie = !!sessionCookie && /^[a-f0-9]{64}$/.test(sessionCookie);

  if (hasValidCookie) {
    return NextResponse.next();
  }

  // API routes get 401, pages get redirect
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
