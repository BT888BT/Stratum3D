import { autoCompleteShippedOrders } from "@/lib/auto-complete-shipped";

export const dynamic = "force-dynamic";

// Scheduled daily by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set in env, which
// we enforce so the endpoint can't be triggered by anyone else.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const { completed } = await autoCompleteShippedOrders();
    return Response.json({ ok: true, completed });
  } catch (err) {
    console.error(
      "[cron/auto-complete-shipped] error:",
      err instanceof Error ? err.message : err
    );
    return new Response("error", { status: 500 });
  }
}
