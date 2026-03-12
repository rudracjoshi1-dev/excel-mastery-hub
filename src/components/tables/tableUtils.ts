import type { FUniver } from "@univerjs/presets";
import type { TableConfig } from "./types";
import { parseRange, colToLetter } from "@/components/charts/chartUtils";

/** Excel "Blue, Table Style Medium 2" colours */
const TABLE_HEADER_BG = "#4472C4";
const TABLE_HEADER_FG = "#FFFFFF";
const TABLE_BAND_LIGHT = "#D9E2F3";
const TABLE_BAND_DARK = "#FFFFFF";

let _tableIdCounter = 0;
export function generateTableId(): string {
  return `table-${Date.now()}-${++_tableIdCounter}`;
}

/**
 * Apply Excel-style table formatting to a range in the Univer sheet.
 * Returns a TableConfig on success, or null on failure.
 */
export function createTable(
  univerAPI: FUniver,
  rangeStr: string,
  tableName?: string
): TableConfig | null {
  const parsed = parseRange(rangeStr);
  if (!parsed) return null;

  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return null;
  const sheet = workbook.getActiveSheet();
  if (!sheet) return null;

  const { startRow, startCol, endRow, endCol } = parsed;
  const colCount = endCol - startCol + 1;

  if (endRow <= startRow || colCount < 1) return null;

  // Read header values
  const headers: string[] = [];
  try {
    const headerValues = sheet
      .getRange(startRow, startCol, 1, colCount)
      .getValues();
    for (let c = 0; c < colCount; c++) {
      const v = headerValues[0]?.[c];
      headers.push(v == null ? `Column ${c + 1}` : String(v));
    }
  } catch {
    for (let c = 0; c < colCount; c++) headers.push(`Column ${c + 1}`);
  }

  // Apply styling
  applyTableStyling(sheet, startRow, startCol, endRow, endCol);

  const id = generateTableId();
  const name = tableName || `Table${id.slice(-4)}`;

  return { id, name, range: rangeStr, headers };
}

/**
 * Apply Excel-style visual formatting to a range.
 */
export function applyTableStyling(
  sheet: any,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): void {
  const colCount = endCol - startCol + 1;

  try {
    // Header row styling
    const headerRange = sheet.getRange(startRow, startCol, 1, colCount);
    if (typeof headerRange.setBackgroundColor === "function") {
      headerRange.setBackgroundColor(TABLE_HEADER_BG);
    }
    if (typeof headerRange.setFontColor === "function") {
      headerRange.setFontColor(TABLE_HEADER_FG);
    }
    if (typeof headerRange.setFontWeight === "function") {
      headerRange.setFontWeight("bold");
    }

    // Banded rows
    for (let r = startRow + 1; r <= endRow; r++) {
      const rowRange = sheet.getRange(r, startCol, 1, colCount);
      const isEven = (r - startRow) % 2 === 0;
      if (typeof rowRange.setBackgroundColor === "function") {
        rowRange.setBackgroundColor(isEven ? TABLE_BAND_LIGHT : TABLE_BAND_DARK);
      }
    }
  } catch (e) {
    console.warn("[tableUtils] failed to apply styling:", e);
  }
}

/**
 * Re-apply table styling from persisted configs (used on load).
 */
export function restoreTableStyling(
  univerAPI: FUniver,
  tables: TableConfig[]
): void {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;
  const sheet = workbook.getActiveSheet();
  if (!sheet) return;

  for (const table of tables) {
    const parsed = parseRange(table.range);
    if (!parsed) continue;
    applyTableStyling(
      sheet,
      parsed.startRow,
      parsed.startCol,
      parsed.endRow,
      parsed.endCol
    );
  }
}

/**
 * Read all data from a table range as an array of objects (for pivot tables).
 */
export function readTableData(
  univerAPI: FUniver,
  rangeStr: string
): Record<string, string | number>[] | null {
  const parsed = parseRange(rangeStr);
  if (!parsed) return null;

  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return null;
  const sheet = workbook.getActiveSheet();
  if (!sheet) return null;

  const { startRow, startCol, endRow, endCol } = parsed;
  const rowCount = endRow - startRow + 1;
  const colCount = endCol - startCol + 1;

  if (rowCount < 2) return null;

  try {
    const values = sheet
      .getRange(startRow, startCol, rowCount, colCount)
      .getValues();

    // Row 0 = headers
    const headers = values[0].map((v: any, i: number) =>
      v == null ? `Col${i + 1}` : String(v)
    );

    const data: Record<string, string | number>[] = [];
    for (let r = 1; r < values.length; r++) {
      const row: Record<string, string | number> = {};
      for (let c = 0; c < headers.length; c++) {
        const val = values[r]?.[c];
        const num = Number(val);
        row[headers[c]] = val == null ? "" : isNaN(num) ? String(val) : num;
      }
      data.push(row);
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Read field headers from a range (first row).
 */
export function readFieldHeaders(
  univerAPI: FUniver,
  rangeStr: string
): string[] | null {
  const parsed = parseRange(rangeStr);
  if (!parsed) return null;

  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return null;
  const sheet = workbook.getActiveSheet();
  if (!sheet) return null;

  const { startRow, startCol, endCol } = parsed;
  const colCount = endCol - startCol + 1;

  try {
    const values = sheet
      .getRange(startRow, startCol, 1, colCount)
      .getValues();
    return values[0].map((v: any, i: number) =>
      v == null ? `Col${i + 1}` : String(v)
    );
  } catch {
    return null;
  }
}
