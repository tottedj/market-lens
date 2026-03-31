import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import CompanyDetails from "@/components/CompanyDetails";
import type { RatioKey, CompanyYearlyData } from "@/lib/types";

function num(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isFinite(n) ? n : null;
}

function safeDivide(
  numerator: number | null,
  denominator: number | null
): number | null {
  if (numerator === null || denominator === null || denominator === 0)
    return null;
  return numerator / denominator;
}

async function getCompanyYearlyData(): Promise<{
  companies: CompanyYearlyData[];
  availableYears: number[];
}> {
  const [incomeRes, balanceRes, cashFlowRes, companiesRes] = await Promise.all([
    supabase
      .from("income_statement_annual")
      .select(
        "company_id, fiscal_year, net_income, total_revenue, gross_profit, operating_income, ebitda"
      )
      .order("fiscal_year", { ascending: true }),
    supabase
      .from("balance_sheet_annual")
      .select(
        "company_id, fiscal_year, total_assets, stockholders_equity, total_debt, current_assets, current_liabilities"
      )
      .order("fiscal_year", { ascending: true }),
    supabase
      .from("cash_flow_annual")
      .select("company_id, fiscal_year, free_cash_flow")
      .order("fiscal_year", { ascending: true }),
    supabase.from("companies").select("id, ticker, name, sector"),
  ]);

  if (
    incomeRes.error ||
    balanceRes.error ||
    cashFlowRes.error ||
    companiesRes.error
  ) {
    throw new Error("Failed to fetch data");
  }

  const allYears = new Set<number>();

  // Group by company and year
  type IncomeRow = (typeof incomeRes.data)[number];
  type BalanceRow = (typeof balanceRes.data)[number];
  type CashFlowRow = (typeof cashFlowRes.data)[number];

  function groupByCompanyYear<T extends { company_id: number; fiscal_year: number }>(
    rows: T[]
  ): Map<string, T> {
    const map = new Map<string, T>();
    for (const row of rows) {
      map.set(`${row.company_id}_${row.fiscal_year}`, row);
      allYears.add(row.fiscal_year);
    }
    return map;
  }

  const incomeMap = groupByCompanyYear<IncomeRow>(incomeRes.data);
  const balanceMap = groupByCompanyYear<BalanceRow>(balanceRes.data);
  const cashFlowMap = groupByCompanyYear<CashFlowRow>(cashFlowRes.data);

  const sortedYears = Array.from(allYears).sort((a, b) => a - b);

  const companies: CompanyYearlyData[] = companiesRes.data.map((company) => {
    const years: Record<number, Record<RatioKey, number | null>> = {};

    for (const year of sortedYears) {
      const key = `${company.id}_${year}`;
      const income = incomeMap.get(key);
      const balance = balanceMap.get(key);
      const cashFlow = cashFlowMap.get(key);
      const prevKey = `${company.id}_${year - 1}`;
      const prevIncome = incomeMap.get(prevKey);
      const prevCashFlow = cashFlowMap.get(prevKey);

      if (!income && !balance && !cashFlow) continue;

      const netIncome = num(income?.net_income);
      const totalAssets = num(balance?.total_assets);
      const equity = num(balance?.stockholders_equity);
      const totalRevenue = num(income?.total_revenue);
      const grossProfit = num(income?.gross_profit);
      const operatingIncome = num(income?.operating_income);
      const ebitda = num(income?.ebitda);
      const totalDebt = num(balance?.total_debt);
      const currentAssets = num(balance?.current_assets);
      const currentLiabilities = num(balance?.current_liabilities);
      const fcf = num(cashFlow?.free_cash_flow);
      const prevFcf = num(prevCashFlow?.free_cash_flow);
      const prevRevenue = num(prevIncome?.total_revenue);

      years[year] = {
        roa: safeDivide(netIncome, totalAssets),
        roe: safeDivide(netIncome, equity),
        gross_margin: safeDivide(grossProfit, totalRevenue),
        operating_margin: safeDivide(operatingIncome, totalRevenue),
        net_margin: safeDivide(netIncome, totalRevenue),
        ebitda_margin: safeDivide(ebitda, totalRevenue),
        debt_to_equity: safeDivide(totalDebt, equity),
        current_ratio: safeDivide(currentAssets, currentLiabilities),
        revenue_growth:
          prevRevenue !== null && prevRevenue !== 0 && totalRevenue !== null
            ? (totalRevenue - prevRevenue) / Math.abs(prevRevenue)
            : null,
        fcf_growth:
          prevFcf !== null && prevFcf !== 0 && fcf !== null
            ? (fcf - prevFcf) / Math.abs(prevFcf)
            : null,
      };
    }

    return {
      id: company.id,
      ticker: company.ticker,
      name: company.name,
      sector: company.sector,
      years,
    };
  });

  return { companies, availableYears: sortedYears };
}

async function CompanyDetailsContent() {
  const { companies, availableYears } = await getCompanyYearlyData();
  return (
    <CompanyDetails companies={companies} availableYears={availableYears} />
  );
}

export default function CompanyDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-64" />
            <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      }
    >
      <CompanyDetailsContent />
    </Suspense>
  );
}
