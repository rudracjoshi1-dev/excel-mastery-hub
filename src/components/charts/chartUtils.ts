import type { FUniver } from "@univerjs/presets";
import type { ChartConfig, ChartType } from "./types";

/**
 * Parse an Excel-style range string like "A1:D5" into row/col indices.
 */
export function parseRange(range: string): {
  startRow: number; startCol: number; endRow: number; endCol: number;
} | null {
  const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i);
  if (!match) return null;
  const colToNum = (s: string) => {
    let n = 0;
    for (const ch of s.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64;
    return n - 1;
  };
  return {
    startCol: colToNum(match[1]),
    startRow: parseInt(match[2]) - 1,
    endCol: colToNum(match[3]),
    endRow: parseInt(match[4]) - 1,
  };
}

/**
 * Convert column index to Excel letter (0 → A, 25 → Z, 26 → AA)
 */
export function colToLetter(col: number): string {
  let s = "";
  let c = col;
  while (c >= 0) {
    s = String.fromCharCode((c % 26) + 65) + s;
    c = Math.floor(c / 26) - 1;
  }
  return s;
}

/**
 * Read data from a Univer sheet for a given range and produce chart-ready data.
 * Row 0 of the range = headers, Col 0 = categories.
 */
export function readChartData(
  univerAPI: FUniver,
  range: string
): { categories: string[]; series: { name: string; data: number[] }[] } | null {
  const parsed = parseRange(range);
  if (!parsed) return null;

  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return null;
  const sheet = workbook.getActiveSheet();
  if (!sheet) return null;

  const { startRow, startCol, endRow, endCol } = parsed;
  const rowCount = endRow - startRow + 1;
  const colCount = endCol - startCol + 1;

  if (rowCount < 2 || colCount < 2) return null;

  try {
    const values = sheet.getRange(startRow, startCol, rowCount, colCount).getValues();

    // First row = headers (skip first cell which is category label)
    const headers = values[0].slice(1).map((v) => (v == null ? "" : String(v)));

    // Subsequent rows: col 0 = category, rest = series data
    const categories: string[] = [];
    const seriesData: number[][] = headers.map(() => []);

    for (let r = 1; r < values.length; r++) {
      categories.push(values[r][0] == null ? "" : String(values[r][0]));
      for (let c = 1; c < values[r].length; c++) {
        const val = values[r][c];
        seriesData[c - 1].push(val == null ? 0 : Number(val) || 0);
      }
    }

    const series = headers.map((name, i) => ({ name, data: seriesData[i] }));
    return { categories, series };
  } catch {
    return null;
  }
}

/**
 * Build an ECharts option from a ChartConfig.
 */
export function buildEChartsOption(config: ChartConfig): any {
  const { type, title, categories, series } = config;

  const baseColors = [
    "hsl(215, 70%, 50%)",
    "hsl(150, 60%, 45%)",
    "hsl(35, 90%, 55%)",
    "hsl(350, 70%, 55%)",
    "hsl(270, 55%, 55%)",
    "hsl(190, 65%, 45%)",
  ];

  if (type === "pie") {
    // For pie, sum each series across categories or use first series
    const pieData = categories.map((cat, i) => ({
      name: cat,
      value: series.reduce((sum, s) => sum + (s.data[i] || 0), 0),
    }));

    return {
      title: { text: title, left: "center", textStyle: { fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 10, type: "scroll" },
      color: baseColors,
      series: [
        {
          type: "pie",
          radius: ["35%", "65%"],
          center: ["50%", "48%"],
          data: pieData,
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.2)" } },
          label: { formatter: "{b}\n{d}%" },
        },
      ],
    };
  }

  return {
    title: { text: title, left: "center", textStyle: { fontSize: 14, fontWeight: 600 } },
    tooltip: { trigger: "axis" },
    legend: { bottom: 10, type: "scroll" },
    grid: { left: 50, right: 20, top: 50, bottom: 50 },
    xAxis: { type: "category", data: categories, axisLabel: { interval: 0, rotate: categories.length > 6 ? 30 : 0 } },
    yAxis: { type: "value" },
    color: baseColors,
    series: series.map((s) => ({
      name: s.name,
      type: type === "bar" ? "bar" : "line",
      data: s.data,
      ...(type === "line" ? { smooth: true } : {}),
    })),
  };
}

/**
 * Get the currently selected range in the Univer sheet as a string like "A1:D5".
 */
export function getSelectedRange(univerAPI: FUniver): string | null {
  try {
    const workbook = univerAPI.getActiveWorkbook();
    if (!workbook) return null;
    const sheet = workbook.getActiveSheet();
    if (!sheet) return null;
    const selection = sheet.getSelection();
    if (!selection) return null;
    
    // In Univer 0.15.x, getActiveRange() may return null 
    // Try getActiveRange first, then fall back to inspecting selection internals
    let range = selection.getActiveRange();
    
    if (!range) {
      // Fallback: inspect selection internals
      const sel = selection as any;
      console.log("[getSelectedRange] selection keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(sel)));
      console.log("[getSelectedRange] selection._selections:", sel._selections);
      
      // Try _selections array which contains raw range data
      const selections = sel._selections;
      if (selections && selections.length > 0) {
        const s = selections[0];
        const rangeData = s.range || s;
        const row = rangeData.startRow ?? 0;
        const col = rangeData.startColumn ?? 0;
        const endRow = rangeData.endRow ?? row;
        const endCol = rangeData.endColumn ?? col;
        const startCell = `${colToLetter(col)}${row + 1}`;
        const endCell = `${colToLetter(endCol)}${endRow + 1}`;
        return `${startCell}:${endCell}`;
      }
      return null;
    }

    const row = range.getRow();
    const col = range.getColumn();
    const rowCount = range.getHeight();
    const colCount = range.getWidth();

    const startCell = `${colToLetter(col)}${row + 1}`;
    const endCell = `${colToLetter(col + colCount - 1)}${row + rowCount}`;
    return `${startCell}:${endCell}`;
  } catch (e) {
    console.error("[getSelectedRange] error:", e);
    return null;
  }
}

let _idCounter = 0;
export function generateChartId(): string {
  return `chart-${Date.now()}-${++_idCounter}`;
}
