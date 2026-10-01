import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "order-files";
// A quote only accepts a batch for 1 hour (pending_uploads.expires_at), and a
// successful quote MOVES its files out of pending/. Anything still under
// pending/ after this long is therefore abandoned.
const MAX_AGE_HOURS = 24;
const MAX_BATCH_FOLDERS = 100;

/**
 * Deletes abandoned objects under pending/ and expired DB rows.
 * Only ever touches the pending/ prefix — never files attached to an order.
 * Idempotent and safe to run repeatedly.
 */
export async function cleanupPendingUploads(): Promise<{ deleted: number }> {
  const supabase = createAdminClient();
  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  const storage = supabase.storage.from(BUCKET);

  const { data: folders } = await storage.list("pending", {
    limit: MAX_BATCH_FOLDERS,
    sortBy: { column: "created_at", order: "asc" },
  });

  let deleted = 0;
  for (const folder of folders ?? []) {
    if (!folder.name) continue;
    const prefix = `pending/${folder.name}`;
    const { data: files } = await storage.list(prefix, { limit: 100 });

    const stale = (files ?? []).filter(
      (f) => f.name && f.created_at && new Date(f.created_at).getTime() < cutoff
    );
    if (!stale.length) continue;

    const paths = stale.map((f) => `${prefix}/${f.name}`);
    const { error } = await storage.remove(paths);
    if (error) {
      console.error("[cleanup-pending] remove failed:", error.message);
      continue;
    }
    deleted += paths.length;
  }

  // Expired DB rows (pending_uploads, sessions, rate limits, webhook events).
  const { error: rpcError } = await supabase.rpc("cleanup_expired");
  if (rpcError) console.error("[cleanup-pending] cleanup_expired:", rpcError.message);

  return { deleted };
}
