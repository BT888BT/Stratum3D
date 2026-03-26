import type { QuoteInputParsed } from "@/lib/validation";

type MaterialConfig = {
  densityGPerCm3: number;
  filamentCostPerGramCents: number;
  machineRatePerHourCents: number;
  minimumOrderCents: number;
};

const MATERIALS: Record<string, MaterialConfig> = {
  PLA:  { densityGPerCm3: 1.24, filamentCostPerGramCents: 4, machineRatePerHourCents: 200, minimumOrderCents: 1500 },
  PETG: { densityGPerCm3: 1.27, filamentCostPerGramCents: 5, machineRatePerHourCents: 220, minimumOrderCents: 1800 },
  ABS:  { densityGPerCm3: 1.04, filamentCostPerGramCents: 5, machineRatePerHourCents: 250, minimumOrderCents: 2000 },
};

function estimatePrintTimeMinutes(volumeCm3: number, layerHeightMm: number, infillPercent: number): number {
  const volumeMm3 = volumeCm3 * 1000;
  const baseSpeed = 8;
  const layerFactor = layerHeightMm / 0.2;
  const infillFactor = 0.5 + (infillPercent / 100) * 0.5;
  return Math.max(15, Math.round((volumeMm3 / (baseSpeed * layerFactor / infillFactor)) * 1.2 / 60));
}

export type ItemQuoteResult = {
  filename: string;
  estimatedVolumeCm3: number;
  estimatedWeightGrams: number;
  estimatedPrintTimeMinutes: number;
  materialCostCents: number;
  machineCostCents: number;
  itemTotalCents: number;
};

export type QuoteResult = {
  items: ItemQuoteResult[];
  subtotalCents: number;
  shippingCents: number;
  gstCents: number;
  totalCents: number;
};

export function calculateItemQuote(
  input: QuoteInputParsed,
  volumeMm3: number,
  filename: string
): ItemQuoteResult {
  const cfg = MATERIALS[input.material] ?? MATERIALS.PLA;
  const solidVolumeCm3 = volumeMm3 / 1000;

  const shellFraction = 0.30;
  const infillFraction = input.infillPercent / 100;
  const printedVolumeCm3 = Math.max(
    0.5,
    solidVolumeCm3 * (shellFraction + (1 - shellFraction) * infillFraction) * 1.20
  );

  const estimatedWeightGrams = parseFloat((printedVolumeCm3 * cfg.densityGPerCm3).toFixed(1));
  const materialCostCents = Math.round(estimatedWeightGrams * cfg.filamentCostPerGramCents) * input.quantity;
  const estimatedPrintTimeMinutes = estimatePrintTimeMinutes(printedVolumeCm3, input.layerHeightMm, input.infillPercent);
  const machineCostCents = Math.round((estimatedPrintTimeMinutes / 60) * cfg.machineRatePerHourCents) * input.quantity;
  const rawTotal = materialCostCents + machineCostCents;
  const itemTotalCents = Math.max(rawTotal, cfg.minimumOrderCents);

  return {
    filename,
    estimatedVolumeCm3: parseFloat(solidVolumeCm3.toFixed(2)),
    estimatedWeightGrams,
    estimatedPrintTimeMinutes,
    materialCostCents,
    machineCostCents,
    itemTotalCents,
  };
}

export function sumQuote(items: ItemQuoteResult[]): QuoteResult {
  const subtotalCents = items.reduce((s, i) => s + i.itemTotalCents, 0);
  const shippingCents = 1500;
  const gstCents = Math.round(subtotalCents * 0.1);
  const totalCents = subtotalCents + gstCents + shippingCents;
  return { items, subtotalCents, shippingCents, gstCents, totalCents };
}
