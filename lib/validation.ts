import { z } from "zod";

export const allowedExtensions = [".stl", ".obj", ".3mf"];
export const maxFileSizeBytes = 50 * 1024 * 1024;

export const quoteInputSchema = z.object({
  customerName: z.string().min(2).max(120),
  email: z.email(),
  material: z.enum(["PLA", "PETG", "ABS"]),
  colour: z.string().min(1).max(50),
  quantity: z.coerce.number().int().min(1).max(100),
  layerHeightMm: z.coerce.number().min(0.08).max(0.4),
  infillPercent: z.coerce.number().int().min(0).max(100),
  shippingAddressLine1: z.string().min(3).max(200),
  shippingAddressLine2: z.string().max(100).optional().or(z.literal("")),
  shippingCity: z.string().min(2).max(100),
  shippingState: z.string().min(2).max(10),
  shippingPostcode: z.string().min(4).max(4).regex(/^\d{4}$/, "Must be a 4-digit Australian postcode"),
  shippingCountry: z.literal("AU"),
});

export type QuoteInput = z.input<typeof quoteInputSchema>;
export type QuoteInputParsed = z.output<typeof quoteInputSchema>;

export function isAllowedFile(filename: string) {
  const lower = filename.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext));
}
