"use client";

import { useState, useMemo, useRef, useEffect } from "react";

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

type Company = {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  ratios: Record<RatioKey, number | null>;
};

const RATIO_META: Record<
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

const DEFAULT_RATIOS: RatioKey[] = ["roa", "fcf_growth", "revenue_growth"];

export default function RankingTable({ companies }: { companies: Company[] }) {
  const [selectedRatios, setSelectedRatios] =
    useState<RatioKey[]>(DEFAULT_RATIOS);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPicker]);

  const availableRatios = useMemo(
    () =>
      (Object.keys(RATIO_META) as RatioKey[]).filter(
        (k) => !selectedRatios.includes(k)
      ),
    [selectedRatios]
  );

  // Compute composite ranking
  const ranked = useMemo(() => {
    if (selectedRatios.length === 0) {
      return companies.map((c, i) => ({ ...c, rank: i + 1, avgRank: 0 }));
    }

    // For each ratio, rank companies (companies with null get worst rank)
    const ratioRanks = new Map<number, number[]>(); // company id -> array of ranks

    for (const company of companies) {
      ratioRanks.set(company.id, []);
    }

    for (const ratioKey of selectedRatios) {
      const meta = RATIO_META[ratioKey];
      // Get all companies with their ratio value
      const withValues = companies.map((c) => ({
        id: c.id,
        value: c.ratios[ratioKey],
      }));

      // Sort: companies with null values go last
      withValues.sort((a, b) => {
        if (a.value === null && b.value === null) return 0;
        if (a.value === null) return 1;
        if (b.value === null) return -1;
        return meta.higherIsBetter ? b.value - a.value : a.value - b.value;
      });

      // Assign ranks
      for (let i = 0; i < withValues.length; i++) {
        ratioRanks.get(withValues[i].id)!.push(i + 1);
      }
    }

    // Compute average rank and sort
    const scored = companies.map((c) => {
      const ranks = ratioRanks.get(c.id)!;
      const avgRank = ranks.reduce((sum, r) => sum + r, 0) / ranks.length;
      return { ...c, avgRank };
    });

    scored.sort((a, b) => a.avgRank - b.avgRank);

    return scored.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [companies, selectedRatios]);

  function addRatio(key: RatioKey) {
    setSelectedRatios((prev) => [...prev, key]);
    setShowPicker(false);
  }

  function removeRatio(key: RatioKey) {
    setSelectedRatios((prev) => prev.filter((r) => r !== key));
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Ratio pills */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Ranking by
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {selectedRatios.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium"
            >
              {RATIO_META[key].label}
              <button
                onClick={() => removeRatio(key)}
                className="ml-0.5 hover:text-red-300 dark:hover:text-red-600 transition-colors"
                aria-label={`Remove ${RATIO_META[key].label}`}
              >
                &times;
              </button>
            </span>
          ))}

          {/* Add ratio button */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowPicker(!showPicker)}
              disabled={availableRatios.length === 0}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 hover:border-zinc-500 hover:text-zinc-600 dark:hover:border-zinc-400 dark:hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Add ratio"
            >
              +
            </button>

            {showPicker && availableRatios.length > 0 && (
              <div className="absolute top-10 left-0 z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-48">
                {availableRatios.map((key) => (
                  <button
                    key={key}
                    onClick={() => addRatio(key)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {RATIO_META[key].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300 w-12">
                #
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                Company
              </th>
              <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                Sector
              </th>
              {selectedRatios.map((key) => (
                <th
                  key={key}
                  className="text-right px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  {RATIO_META[key].label}
                </th>
              ))}
              <th className="text-right px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                Avg Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((company) => (
              <tr
                key={company.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-zinc-400 dark:text-zinc-500">
                  {company.rank}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {company.ticker}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {company.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {company.sector}
                </td>
                {selectedRatios.map((key) => {
                  const val = company.ratios[key];
                  const meta = RATIO_META[key];
                  return (
                    <td
                      key={key}
                      className="text-right px-4 py-3 font-mono text-sm"
                    >
                      {val !== null ? (
                        <span
                          className={
                            key === "debt_to_equity"
                              ? val > 1
                                ? "text-red-500"
                                : "text-green-600 dark:text-green-400"
                              : val > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-500"
                          }
                        >
                          {meta.format(val)}
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">
                          N/A
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="text-right px-4 py-3 font-mono text-sm text-zinc-500">
                  {company.avgRank.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
