import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
import { getTrustedIp, buildRateLimitKey } from "@/lib/trusted-ip";

export async function POST(request: Request) {
  try {
    const ip = getTrustedIp(request);
    const rateLimitKey = await buildRateLimitKey("login", request);

    // Layered persistent rate limits. Rotating the User-Agent only defeats the
    // first layer; the IP-wide and global layers still apply.
    const ipKey = `login-ip:${ip}`;
    const globalKey = "login-global";
    const layers: Array<[string, number, number]> = [
      [rateLimitKey, 5, 15 * 60 * 1000], // 5 per IP+UA per 15 min
      [ipKey, 10, 60 * 60 * 1000], // 10 per IP per hour
      [globalKey, 30, 60 * 60 * 1000], // 30 per hour across all clients
    ];
    for (const [key, max, windowMs] of layers) {
      const { allowed } = await checkRateLimit(key, max, windowMs);
      if (!allowed) {
        return NextResponse.json(
          { error: "Too many login attempts. Try again later." },
          { status: 429 }
        );
      }
    }

    const body = await request.json().catch(() => null);
    const password: unknown = body?.password;
    if (typeof password !== "string" || password.length > 256) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured." },
        { status: 500 }
      );
    }

    // Constant-time comparison of fixed-length digests (no length leak)
    const sha = (v: string) => crypto.createHash("sha256").update(v).digest();
    const isCorrect = crypto.timingSafeEqual(
      sha(password),
      sha(process.env.ADMIN_PASSWORD)
    );

    if (!isCorrect) {
      console.warn(`[admin-login] Failed login attempt from ${ip}`);
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }

    // Success — clear rate limit and create session
    await clearRateLimit(rateLimitKey);
    await clearRateLimit(ipKey);
    const token = await createAdminSession(ip);

    console.log(`[admin-login] Successful login from ${ip}`);

    const response = NextResponse.json({ success: true });

    response.cookies.set("stratum3d_admin", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
