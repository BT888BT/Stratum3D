// Muted, low-key star rating. Deliberately desaturated (warm grey, not a
// vibrant gold) so it reads as subtle social proof rather than shouting.
// Usable in both server and client components — it's purely presentational.

type StarsProps = {
  rating: number;
  size?: number;
  /** Colour of a filled star. Defaults to a muted warm-grey. */
  color?: string;
  /** Colour of an empty star. Defaults to a faint border tone. */
  emptyColor?: string;
};

export default function Stars({
  rating,
  size = 14,
  color = "#857c6b",
  emptyColor = "var(--border-hi)",
}: StarsProps) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div
      aria-label={`${filled} out of 5 stars`}
      style={{ display: "inline-flex", gap: 2, lineHeight: 1 }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ fontSize: size, color: i <= filled ? color : emptyColor }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
