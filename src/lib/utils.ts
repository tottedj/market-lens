export function num(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isFinite(n) ? n : null;
}

export function safeDivide(
  numerator: number | null,
  denominator: number | null
): number | null {
  if (numerator === null || denominator === null || denominator === 0)
    return null;
  return numerator / denominator;
}

export function safeGrowth(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

export function groupByCompany<T extends { company_id: number }>(
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
