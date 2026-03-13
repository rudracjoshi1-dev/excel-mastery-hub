import type { FUniver } from "@univerjs/presets";
import type { PivotConfig } from "@/components/tables/types";
import { computePivot, type PivotResult } from "./pivotUtils";
import { readTableData, readFieldHeaders } from "@/components/tables/tableUtils";

/**
 * Parse a single cell reference like "G2" into {row, col}.
 */
function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  let col = 0;
  for (const ch of match[1].toUpperCase()) col = col * 26 + ch.charCodeAt(0) - 64;
  return { row: parseInt(match[2]) - 1, col: col - 1 };
}

/**
 * Write a computed pivot result into spreadsheet cells starting at destCell.
 * Returns the range string of written cells for clearing on update.
 */
export function writePivotToCells(
  univerAPI: FUniver,
  config: PivotConfig,
  data: Record<string, string | number>[],
): { success: boolean; writtenRange?: string } {
  const dest = parseCellRef(config.destCell);
  if (!dest) return { success: false };

  const result = computePivot(data, config.rowField, config.colField, config.valueField, config.aggregation);
  if (!result) return { success: false };

  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return { success: false };
  const sheet = workbook.getActiveSheet();
  if (!sheet) return { success: false };

  const { rowLabels, colLabels, values, rowTotals, colTotals, grandTotal } = result;
  const aggLabel = config.aggregation === "sum" ? "Sum" : config.aggregation === "count" ? "Count" : "Avg";

  // Total rows = 1 (header) + rowLabels.length + 1 (grand total)
  // Total cols = 1 (row label col) + colLabels.length + 1 (grand total col)
  const totalRows = rowLabels.length + 2;
  const totalCols = colLabels.length + 2;

  try {
    // Build the 2D array
    const output: (string | number)[][] = [];

    // Header row
    const headerRow: (string | number)[] = [`${aggLabel} of ${config.valueField}`];
    for (const col of colLabels) headerRow.push(col);
    headerRow.push("Grand Total");
    output.push(headerRow);

    // Data rows
    for (let ri = 0; ri < rowLabels.length; ri++) {
      const row: (string | number)[] = [rowLabels[ri]];
      for (let ci = 0; ci < colLabels.length; ci++) {
        row.push(values[ri][ci]);
      }
      row.push(rowTotals[ri]);
      output.push(row);
    }

    // Grand total row
    const totalRow: (string | number)[] = ["Grand Total"];
    for (const ct of colTotals) totalRow.push(ct);
    totalRow.push(grandTotal);
    output.push(totalRow);

    // Write to cells
    const range = sheet.getRange(dest.row, dest.col, totalRows, totalCols);
    range.setValues(output);

    // Style header row
    try {
      const hdrRange = sheet.getRange(dest.row, dest.col, 1, totalCols);
      if (typeof hdrRange.setBackgroundColor === "function") {
        hdrRange.setBackgroundColor("#4472C4");
      }
      if (typeof hdrRange.setFontColor === "function") {
        hdrRange.setFontColor("#FFFFFF");
      }
      if (typeof hdrRange.setFontWeight === "function") {
        hdrRange.setFontWeight("bold");
      }

      // Grand total row styling
      const gtRange = sheet.getRange(dest.row + totalRows - 1, dest.col, 1, totalCols);
      if (typeof gtRange.setBackgroundColor === "function") {
        gtRange.setBackgroundColor("#D6DCE4");
      }
      if (typeof gtRange.setFontWeight === "function") {
        gtRange.setFontWeight("bold");
      }

      // Row label column bold
      for (let ri = 0; ri < rowLabels.length; ri++) {
        const cell = sheet.getRange(dest.row + 1 + ri, dest.col, 1, 1);
        if (typeof cell.setFontWeight === "function") cell.setFontWeight("bold");
        // Alternating row colors
        const bandRange = sheet.getRange(dest.row + 1 + ri, dest.col, 1, totalCols);
        if (typeof bandRange.setBackgroundColor === "function") {
          bandRange.setBackgroundColor(ri % 2 === 0 ? "#D9E2F3" : "#FFFFFF");
        }
      }

      // Grand total column bold
      for (let r = 0; r < totalRows; r++) {
        const cell = sheet.getRange(dest.row + r, dest.col + totalCols - 1, 1, 1);
        if (typeof cell.setFontWeight === "function") cell.setFontWeight("bold");
      }
    } catch {
      /* styling is optional */
    }

    return { success: true };
  } catch (e) {
    console.warn("[pivotCellWriter] failed:", e);
    return { success: false };
  }
}

/**
 * Clear the cells previously occupied by a pivot table.
 */
export function clearPivotCells(
  univerAPI: FUniver,
  config: PivotConfig,
  data: Record<string, string | number>[],
): void {
  const dest = parseCellRef(config.destCell);
  if (!dest) return;

  try {
    const result = computePivot(data, config.rowField, config.colField, config.valueField, config.aggregation);
    if (!result) return;

    const totalRows = result.rowLabels.length + 2;
    const totalCols = result.colLabels.length + 2;

    const workbook = univerAPI.getActiveWorkbook();
    if (!workbook) return;
    const sheet = workbook.getActiveSheet();
    if (!sheet) return;

    const emptyData = Array(totalRows).fill(null).map(() => Array(totalCols).fill(""));
    sheet.getRange(dest.row, dest.col, totalRows, totalCols).setValues(emptyData);

    // Clear styling
    for (let r = 0; r < totalRows; r++) {
      const rowRange = sheet.getRange(dest.row + r, dest.col, 1, totalCols);
      if (typeof rowRange.setBackgroundColor === "function") rowRange.setBackgroundColor("#FFFFFF");
      if (typeof rowRange.setFontColor === "function") rowRange.setFontColor("#000000");
      if (typeof rowRange.setFontWeight === "function") rowRange.setFontWeight("normal");
    }
  } catch {
    /* best effort */
  }
}

/**
 * Read source data and write pivot into cells. Returns the data for persistence.
 */
export function refreshPivotInCells(
  univerAPI: FUniver,
  config: PivotConfig,
): { data: Record<string, string | number>[] | null } {
  const data = readTableData(univerAPI, config.sourceRange);
  if (!data) return { data: null };
  writePivotToCells(univerAPI, config, data);
  return { data };
}
