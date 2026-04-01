export type RatioKey =
  | "roa"
  | "roe"
  | "gross_margin"
  | "operating_margin"
  | "net_margin"
  | "ebitda_margin"
  | "debt_to_equity"
  | "current_ratio"
  | "revenue_growth"
  | "fcf_growth";

export type Company = {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  ratios: Record<RatioKey, number | null>;
};

export type CompanyYearlyData = {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  years: Record<number, Record<RatioKey, number | null>>;
  fiscalDates: Record<number, string>; // year -> actual fiscal date e.g. "2024-09-30"
};

export const RATIO_META: Record<
  RatioKey,
  { label: string; higherIsBetter: boolean; format: (v: number) => string }
> = {
  roa: {
    label: "ROA",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  roe: {
    label: "ROE",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  gross_margin: {
    label: "Gross Margin",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  operating_margin: {
    label: "Operating Margin",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  net_margin: {
    label: "Net Margin",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  ebitda_margin: {
    label: "EBITDA Margin",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  debt_to_equity: {
    label: "Debt/Equity",
    higherIsBetter: false,
    format: (v) => v.toFixed(2),
  },
  current_ratio: {
    label: "Current Ratio",
    higherIsBetter: true,
    format: (v) => v.toFixed(2),
  },
  revenue_growth: {
    label: "Revenue Growth",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
  fcf_growth: {
    label: "FCF Growth",
    higherIsBetter: true,
    format: (v) => (v * 100).toFixed(1) + "%",
  },
};

export const ALL_RATIO_KEYS = Object.keys(RATIO_META) as RatioKey[];

export const DEFAULT_RATIOS: RatioKey[] = ["roa", "fcf_growth", "revenue_growth"];
