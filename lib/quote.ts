import type { QuoteInputParsed } from "@/lib/validation";

type MaterialConfig = {
  densityGPerCm3: number;
  filamentCostPerGramCents: number;
  machineRatePerHourCents: number;
  minimumOrderCents: number;
};

const MATERIALS: Record<QuoteInputParsed["material"], MaterialConfig> = {
  PLA: {
    densityGPerCm3: 1.24,
    filamentCostPerGramCents: 4,
    machineRatePerHourCents: 200,
    minimumOrderCents: 1500
  },
  PETG: {
    densityGPerCm3: 1.27,
    filamentCostPerGramCents: 5,
    machineRatePerHourCents: 220,
    minimumOrderCents: 1800
  },
  ABS: {
    densityGPerCm3: 1.04,
    filamentCostPerGramCents: 5,
    machineRatePerHourCents: 250,
    minimumOrderCents: 2000
  }
};

function estimatePrintTimeMinutes(
  volumeCm3: number,
  layerHeightMm: number,
  infillPercent: number
): number {
  const volumeMm3 = volumeCm3 * 1000;
  const baseSpeedMm3PerSec = 8;
  const layerFactor = layerHeightMm / 0.2;
  const infillFactor = 0.5 + (infillPercent / 100) * 0.5;
  const effectiveSpeed = baseSpeedMm3PerSec * layerFactor / infillFactor;
  const totalSeconds = (volumeMm3 / effectiveSpeed) * 1.2;
  return Math.max(15, Math.round(totalSeconds / 60));
}

export type QuoteResult = {
  estimatedVolumeCm3: number;
  estimatedWeightGrams: number;
  estimatedPrintTimeMinutes: number;
  materialCostCents: number;
  machineCostCents: number;
  subtotalCents: number;
  shippingCents: number;
  gstCents: number;
  totalCents: number;
};

/**
 * Calculate quote from parsed form input + actual mesh volume in mm³.
 * volumeMm3 comes from server-side STL/OBJ/3MF parsing.
 *
 * Support material adds 20% to the printed volume.
 * Infill factor adjusts interior density (shells always solid).
 */
export function calculateQuote(
  input: QuoteInputParsed,
  volumeMm3: number
): QuoteResult {
  const cfg = MATERIALS[input.material];

  const solidVolumeCm3 = volumeMm3 / 1000;

  // Printed volume: infill-adjusted + 20% for supports
  const shellFraction = 0.30;
  const infillFraction = input.infillPercent / 100;
  const printedVolumeCm3 = Math.max(
    0.5,
    solidVolumeCm3 * (shellFraction + (1 - shellFraction) * infillFraction) * 1.20
  );

  const estimatedWeightGrams = parseFloat(
    (printedVolumeCm3 * cfg.densityGPerCm3).toFixed(1)
  );

  const materialCostCents =
    Math.round(estimatedWeightGrams * cfg.filamentCostPerGramCents) * input.quantity;

  const estimatedPrintTimeMinutes = estimatePrintTimeMinutes(
    printedVolumeCm3,
    input.layerHeightMm,
    input.infillPercent
  );
  const machineCostCents =
    Math.round((estimatedPrintTimeMinutes / 60) * cfg.machineRatePerHourCents) *
    input.quantity;

  const rawSubtotal = materialCostCents + machineCostCents;
  const subtotalCents = Math.max(rawSubtotal, cfg.minimumOrderCents);
  const shippingCents = 1500; // standard shipping only
  const gstCents = Math.round(subtotalCents * 0.1);
  const totalCents = subtotalCents + gstCents + shippingCents;

  return {
    estimatedVolumeCm3: parseFloat(solidVolumeCm3.toFixed(2)),
    estimatedWeightGrams,
    estimatedPrintTimeMinutes,
    materialCostCents,
    machineCostCents,
    subtotalCents,
    shippingCents,
    gstCents,
    totalCents
  };
}
