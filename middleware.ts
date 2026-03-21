import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("stratum3d_admin")?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessionCookie === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"]
};
