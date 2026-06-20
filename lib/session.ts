import { createHmac, timingSafeEqual } from "crypto";

// ──────────────────────────────────────────────────────────────────────────
// Customer account sessions — no database.
// A login (email + valid order code) mints an HMAC-signed token that encodes
// the authenticated email. The account area only ever reads orders that match
// the email inside this signed token, so each customer sees only their own.
// ──────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "stratum3d_account";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.ACCOUNT_SESSION_SECRET || "stratum3d-dev-fallback-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Mint a signed session token for an authenticated email. */
export function createSessionToken(email: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${email.toLowerCase().trim()}|${expires}`;
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verify a token and return the email it authenticates, or null. */
export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  // Constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = Buffer.from(body, "base64url").toString("utf8");
    const [email, expiresStr] = payload.split("|");
    const expires = Number(expiresStr);
    if (!email || !Number.isFinite(expires) || Date.now() > expires) return null;
    return email;
  } catch {
    return null;
  }
}
