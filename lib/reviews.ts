// Helpers shared by the review API routes.

export const REVIEW_MAX_LENGTH = 100;

// Accept "S3D-0001", "#0001", "0001" or "1". Strip a leading "S3D" prefix
// first (it contains a digit), then keep only the order-number digits.
// Mirrors the parsing used by the customer order-lookup endpoint.
export function parseOrderNumber(raw: string | undefined): number {
  const digits = (raw ?? "")
    .replace(/^\s*s3d/i, "")
    .replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : NaN;
}

// We only ever display the customer's first name on a review — never the full
// name. Take the first whitespace-separated token; fall back to the whole
// (trimmed) value if there's somehow no space-delimited first token.
export function firstNameOf(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? "").trim();
  const first = trimmed.split(/\s+/)[0] ?? "";
  return first || trimmed;
}
