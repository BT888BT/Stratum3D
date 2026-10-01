import crypto from "crypto";
import { expireStaleApprovals } from "@/lib/expire-approvals";
import { cleanupPendingUploads } from "@/lib/cleanup-pending-uploads";

export const dynamic = "force-dynamic";

// Scheduled daily by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set in env, which
// we enforce so the endpoint can't be triggered by anyone else.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    const sha = (v: string) => crypto.createHash("sha256").update(v).digest();
    if (!crypto.timingSafeEqual(sha(auth), sha(`Bearer ${secret}`))) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const { expired } = await expireStaleApprovals();

    // Housekeeping: remove abandoned uploads. Never allowed to fail the job.
    let cleaned = 0;
    try {
      cleaned = (await cleanupPendingUploads()).deleted;
    } catch (err) {
      console.error("[cron/expire-approvals] upload cleanup error:", err);
    }

    return Response.json({ ok: true, expired, cleaned });
  } catch (err) {
    console.error(
      "[cron/expire-approvals] error:",
      err instanceof Error ? err.message : err
    );
    return new Response("error", { status: 500 });
  }
}
