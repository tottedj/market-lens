import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import RankingTable from "@/components/RankingTable";
import type { RatioKey } from "@/lib/types";

async function getCompanyRatios() {
  const [incomeRes, balanceRes, cashFlowRes, companiesRes] = await Promise.all([
    supabase
      .from("income_statement_annual")
      .select(
        "company_id, fiscal_year, net_income, total_revenue, gross_profit, operating_income, ebitda"
      )
      .order("fiscal_year", { ascending: false }),
    supabase
      .from("balance_sheet_annual")
      .select(
        "company_id, fiscal_year, total_assets, stockholders_equity, total_debt, current_assets, current_liabilities"
      )
      .order("fiscal_year", { ascending: false }),
    supabase
      .from("cash_flow_annual")
      .select("company_id, fiscal_year, free_cash_flow")
      .order("fiscal_year", { ascending: false }),
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

  const companies = companiesRes.data;

  function groupByCompany<T extends { company_id: number }>(
    rows: T[]
  ): Map<number, T[]> {
    const map = new Map<number, T[]>();
    for (const row of rows) {
      const arr = map.get(row.company_id) || [];
      arr.push(row);
      map.set(row.company_id, arr);
    }
    return map;
  }

  const incomeByCompany = groupByCompany(incomeRes.data);
  const balanceByCompany = groupByCompany(balanceRes.data);
  const cashFlowByCompany = groupByCompany(cashFlowRes.data);

  return companies.map((company) => {
    const income = incomeByCompany.get(company.id) || [];
    const balance = balanceByCompany.get(company.id) || [];
    const cashFlow = cashFlowByCompany.get(company.id) || [];

    const latestIncome = income[0];
    const prevIncome = income[1];
    const latestBalance = balance[0];
    const latestCashFlow = cashFlow[0];
    const prevCashFlow = cashFlow[1];

    const netIncome = num(latestIncome?.net_income);
    const totalAssets = num(latestBalance?.total_assets);
    const equity = num(latestBalance?.stockholders_equity);
    const totalRevenue = num(latestIncome?.total_revenue);
    const grossProfit = num(latestIncome?.gross_profit);
    const operatingIncome = num(latestIncome?.operating_income);
    const ebitda = num(latestIncome?.ebitda);
    const totalDebt = num(latestBalance?.total_debt);
    const currentAssets = num(latestBalance?.current_assets);
    const currentLiabilities = num(latestBalance?.current_liabilities);
    const fcf = num(latestCashFlow?.free_cash_flow);
    const prevFcf = num(prevCashFlow?.free_cash_flow);
    const prevRevenue = num(prevIncome?.total_revenue);

    return {
      id: company.id,
      ticker: company.ticker,
      name: company.name,
      sector: company.sector,
      ratios: {
        roa: safeDivide(netIncome, totalAssets),
        roe: safeDivide(netIncome, equity),
        gross_margin: safeDivide(grossProfit, totalRevenue),
        operating_margin: safeDivide(operatingIncome, totalRevenue),
        net_margin: safeDivide(netIncome, totalRevenue),
        ebitda_margin: safeDivide(ebitda, totalRevenue),
        debt_to_equity: safeDivide(totalDebt, equity),
        current_ratio: safeDivide(currentAssets, currentLiabilities),
        revenue_growth: safeGrowth(totalRevenue, prevRevenue),
        fcf_growth: safeGrowth(fcf, prevFcf),
      } as Record<RatioKey, number | null>,
    };
  });
}

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

function safeGrowth(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

async function RankingContent() {
  const companies = await getCompanyRatios();
  return <RankingTable companies={companies} />;
}

export default function HomePage() {
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
      <RankingContent />
    </Suspense>
  );
}
