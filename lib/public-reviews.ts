import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicReview = {
  id: string;
  first_name: string;
  body: string;
  rating: number;
  model: string | null;
  created_at: string;
};

/** Return moderated reviews tied to a real order, never seeded placeholder rows. */
export async function getPublicReviews(limit = 3): Promise<PublicReview[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, first_name, body, rating, model, created_at")
    .eq("status", "approved")
    .not("order_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[public-reviews] Could not load approved reviews:", error.message);
    return [];
  }

  return (data ?? []) as PublicReview[];
}
