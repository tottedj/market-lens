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

function pct(v: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);
}

function dec(v: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export const RATIO_META: Record<
  RatioKey,
  { label: string; higherIsBetter: boolean; format: (v: number, locale?: string) => string }
> = {
  roa: { label: "ROA", higherIsBetter: true, format: pct },
  roe: { label: "ROE", higherIsBetter: true, format: pct },
  gross_margin: { label: "Gross Margin", higherIsBetter: true, format: pct },
  operating_margin: { label: "Operating Margin", higherIsBetter: true, format: pct },
  net_margin: { label: "Net Margin", higherIsBetter: true, format: pct },
  ebitda_margin: { label: "EBITDA Margin", higherIsBetter: true, format: pct },
  debt_to_equity: { label: "Debt/Equity", higherIsBetter: false, format: dec },
  current_ratio: { label: "Current Ratio", higherIsBetter: true, format: dec },
  revenue_growth: { label: "Revenue Growth", higherIsBetter: true, format: pct },
  fcf_growth: { label: "FCF Growth", higherIsBetter: true, format: pct },
};

export const ALL_RATIO_KEYS = Object.keys(RATIO_META) as RatioKey[];

export const DEFAULT_RATIOS: RatioKey[] = ["roa", "fcf_growth", "revenue_growth"];
