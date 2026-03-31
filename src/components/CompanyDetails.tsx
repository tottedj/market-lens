"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RatioKey, CompanyYearlyData } from "@/lib/types";
import { RATIO_META, ALL_RATIO_KEYS, DEFAULT_RATIOS } from "@/lib/types";

const COMPANY_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
const MAX_COMPANIES = 4;

type Props = {
  companies: CompanyYearlyData[];
  availableYears: number[];
};

export default function CompanyDetails({ companies, availableYears }: Props) {
  const searchParams = useSearchParams();
  const preselectedTicker = searchParams.get("company");

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>(() => {
    if (preselectedTicker) {
      const found = companies.find(
        (c) => c.ticker.toLowerCase() === preselectedTicker.toLowerCase()
      );
      return found ? [found.id] : [];
    }
    return [];
  });

  const [selectedRatios, setSelectedRatios] =
    useState<RatioKey[]>(DEFAULT_RATIOS);
  const [yearRange, setYearRange] = useState<[number, number]>(() => {
    if (availableYears.length === 0) return [0, 0];
    const last = availableYears[availableYears.length - 1];
    const target = last - 4;
    // Snap to the closest available year >= target (or first if none)
    const startYear =
      availableYears.find((y) => y >= target) ?? availableYears[0];
    return [startYear, last];
  });

  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [showRatioPicker, setShowRatioPicker] = useState(false);
  const companyPickerRef = useRef<HTMLDivElement>(null);
  const ratioPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        companyPickerRef.current &&
        !companyPickerRef.current.contains(e.target as Node)
      ) {
        setShowCompanyPicker(false);
        setCompanySearch("");
      }
      if (
        ratioPickerRef.current &&
        !ratioPickerRef.current.contains(e.target as Node)
      ) {
        setShowRatioPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCompanies = useMemo(
    () => companies.filter((c) => selectedCompanyIds.includes(c.id)),
    [companies, selectedCompanyIds]
  );

  const filteredCompanies = useMemo(() => {
    const q = companySearch.toLowerCase();
    return companies.filter(
      (c) =>
        !selectedCompanyIds.includes(c.id) &&
        (c.ticker.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q))
    );
  }, [companies, selectedCompanyIds, companySearch]);

  const availableRatios = useMemo(
    () => ALL_RATIO_KEYS.filter((k) => !selectedRatios.includes(k)),
    [selectedRatios]
  );

  const filteredYears = useMemo(
    () =>
      availableYears.filter((y) => y >= yearRange[0] && y <= yearRange[1]),
    [availableYears, yearRange]
  );

  function addCompany(id: number) {
    if (selectedCompanyIds.length >= MAX_COMPANIES) return;
    setSelectedCompanyIds((prev) => [...prev, id]);
    setShowCompanyPicker(false);
    setCompanySearch("");
  }

  function removeCompany(id: number) {
    setSelectedCompanyIds((prev) => prev.filter((cid) => cid !== id));
  }

  function addRatio(key: RatioKey) {
    setSelectedRatios((prev) => [...prev, key]);
    setShowRatioPicker(false);
  }

  function removeRatio(key: RatioKey) {
    setSelectedRatios((prev) => prev.filter((r) => r !== key));
  }

  // Build chart data per ratio
  const charts = useMemo(() => {
    return selectedRatios.map((ratioKey) => {
      const data = filteredYears.map((year) => {
        const point: Record<string, number | string | null> = { year };
        for (const company of selectedCompanies) {
          point[company.ticker] = company.years[year]?.[ratioKey] ?? null;
        }
        return point;
      });
      return { ratioKey, data };
    });
  }, [selectedRatios, filteredYears, selectedCompanies]);

  const isPercentRatio = (key: RatioKey) =>
    RATIO_META[key].format(0.5).includes("%");

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Company selection */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Companies (up to {MAX_COMPANIES})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {selectedCompanies.map((company, i) => (
            <span
              key={company.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: COMPANY_COLORS[i] }}
            >
              {company.ticker}
              <button
                onClick={() => removeCompany(company.id)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                aria-label={`Remove ${company.ticker}`}
              >
                &times;
              </button>
            </span>
          ))}

          {selectedCompanyIds.length < MAX_COMPANIES && (
            <div className="relative" ref={companyPickerRef}>
              <button
                onClick={() => setShowCompanyPicker(!showCompanyPicker)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 hover:border-zinc-500 hover:text-zinc-600 dark:hover:border-zinc-400 dark:hover:text-zinc-300 transition-colors"
                aria-label="Add company"
              >
                +
              </button>

              {showCompanyPicker && (
                <div className="absolute top-10 left-0 z-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg min-w-64 max-h-72 flex flex-col">
                  <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Search ticker or name..."
                      className="w-full px-3 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto py-1">
                    {filteredCompanies.slice(0, 20).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => addCompany(c.id)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <span className="font-semibold">{c.ticker}</span>
                        <span className="text-zinc-500 dark:text-zinc-400 ml-2">
                          {c.name}
                        </span>
                      </button>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <div className="px-4 py-2 text-sm text-zinc-400">
                        No companies found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ratio selection */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Ratios
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

          <div className="relative" ref={ratioPickerRef}>
            <button
              onClick={() => setShowRatioPicker(!showRatioPicker)}
              disabled={availableRatios.length === 0}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 hover:border-zinc-500 hover:text-zinc-600 dark:hover:border-zinc-400 dark:hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Add ratio"
            >
              +
            </button>

            {showRatioPicker && availableRatios.length > 0 && (
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

      {/* Year range */}
      {availableYears.length > 0 && <div className="mb-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Year range
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={yearRange[0]}
            onChange={(e) =>
              setYearRange([Number(e.target.value), yearRange[1]])
            }
            className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears
              .filter((y) => y <= yearRange[1])
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
          <span className="text-zinc-400">to</span>
          <select
            value={yearRange[1]}
            onChange={(e) =>
              setYearRange([yearRange[0], Number(e.target.value)])
            }
            className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears
              .filter((y) => y >= yearRange[0])
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
        </div>
      </div>}

      {/* Charts */}
      {selectedCompanies.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
          <p className="text-lg">Select a company to get started</p>
          <p className="text-sm mt-1">
            You can compare up to {MAX_COMPANIES} companies side by side
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map(({ ratioKey, data }) => (
            <div
              key={ratioKey}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                {RATIO_META[ratioKey].label}
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="year"
                    type="category"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      isPercentRatio(ratioKey)
                        ? (v * 100).toFixed(0) + "%"
                        : v.toFixed(2)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                    formatter={(value) => {
                      if (value == null || typeof value !== "number")
                        return ["N/A", ""];
                      return [RATIO_META[ratioKey].format(value), ""];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
                  />
                  {selectedCompanies.map((company, i) => (
                    <Line
                      key={company.id}
                      type="monotone"
                      dataKey={company.ticker}
                      stroke={COMPANY_COLORS[i]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
