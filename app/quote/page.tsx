import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import QuoteForm from "@/components/forms/quote-form";
import AwayOverlay from "@/components/away-overlay";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get a Quote — Stratum3D",
  robots: { index: false, follow: false },
};

export default async function QuotePage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
  const orderingEnabled = settings["ordering_enabled"] !== "false";

  if (!orderingEnabled) redirect("/");

  // Away notice — only show while enabled and the resume date is today or later.
  const awayResumeDate = settings["away_resume_date"] ?? "";
  const showAway =
    settings["away_enabled"] === "true" &&
    /^\d{4}-\d{2}-\d{2}$/.test(awayResumeDate) &&
    awayResumeDate >= new Date().toLocaleDateString("en-CA");

  return (
    <div>
      <div style={{ marginBottom: "clamp(20px, 3vw, 36px)" }}>
        <span className="eyebrow" style={{ marginBottom: 10 }}>Instant Pricing</span>
        <h1 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 8 }}>GET A QUOTE</h1>
        <p style={{ color: "var(--text-dim)", fontSize: "clamp(13px, 1.5vw, 15px)" }}>
          Upload your STL files and configure each print — pricing calculated instantly from your mesh.
        </p>
      </div>
      <QuoteForm />
      {showAway && (
        <AwayOverlay resumeDate={awayResumeDate} message={settings["away_message"]} />
      )}
    </div>
  );
}
