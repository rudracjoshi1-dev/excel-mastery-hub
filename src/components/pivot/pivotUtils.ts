export type Aggregation = "sum" | "count" | "average";

export interface PivotResult {
  rowLabels: string[];
  colLabels: string[];
  /** values[rowIdx][colIdx] */
  values: number[][];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
}

/**
 * Compute a pivot table cross-tabulation from flat data.
 */
export function computePivot(
  data: Record<string, string | number>[],
  rowField: string,
  colField: string,
  valueField: string,
  aggregation: Aggregation
): PivotResult {
  // Collect unique row/col labels
  const rowSet = new Set<string>();
  const colSet = new Set<string>();

  for (const row of data) {
    rowSet.add(String(row[rowField] ?? ""));
    colSet.add(String(row[colField] ?? ""));
  }

  const rowLabels = Array.from(rowSet).sort();
  const colLabels = Array.from(colSet).sort();

  const rowIdx = new Map(rowLabels.map((l, i) => [l, i]));
  const colIdx = new Map(colLabels.map((l, i) => [l, i]));

  // Accumulate values
  const sums: number[][] = rowLabels.map(() => colLabels.map(() => 0));
  const counts: number[][] = rowLabels.map(() => colLabels.map(() => 0));

  for (const row of data) {
    const ri = rowIdx.get(String(row[rowField] ?? ""));
    const ci = colIdx.get(String(row[colField] ?? ""));
    if (ri === undefined || ci === undefined) continue;

    const val = Number(row[valueField]) || 0;
    sums[ri][ci] += val;
    counts[ri][ci] += 1;
  }

  // Compute final values based on aggregation
  const values: number[][] = sums.map((r, ri) =>
    r.map((s, ci) => {
      const c = counts[ri][ci];
      if (aggregation === "count") return c;
      if (aggregation === "average") return c > 0 ? Math.round((s / c) * 100) / 100 : 0;
      return Math.round(s * 100) / 100; // sum
    })
  );

  // Totals
  const rowTotals = values.map((r) => {
    const total = r.reduce((a, b) => a + b, 0);
    return Math.round(total * 100) / 100;
  });

  const colTotals = colLabels.map((_, ci) => {
    const total = values.reduce((a, r) => a + r[ci], 0);
    return Math.round(total * 100) / 100;
  });

  const grandTotal = Math.round(rowTotals.reduce((a, b) => a + b, 0) * 100) / 100;

  return { rowLabels, colLabels, values, rowTotals, colTotals, grandTotal };
}
