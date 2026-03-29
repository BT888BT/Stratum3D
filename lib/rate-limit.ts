import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Persistent rate limiter backed by Supabase.
 * Works across multiple serverless instances on Vercel.
 *
 * Uses upsert with ON CONFLICT to atomically increment or reset the counter.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createAdminClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  // Try to get existing entry
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("count, window_end")
    .eq("key", key)
    .single();

  if (!existing || new Date(existing.window_end) < now) {
    // No entry or window expired — start fresh
    await supabase
      .from("rate_limits")
      .upsert({ key, count: 1, window_end: windowEnd.toISOString() }, { onConflict: "key" });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Window still active — increment
  const newCount = existing.count + 1;
  await supabase
    .from("rate_limits")
    .update({ count: newCount })
    .eq("key", key);

  if (newCount > maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxAttempts - newCount };
}

export async function clearRateLimit(key: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("rate_limits").delete().eq("key", key);
}
