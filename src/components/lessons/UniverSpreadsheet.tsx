import { useEffect, useRef, forwardRef, useImperativeHandle, useState, lazy, Suspense } from "react";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import type { FUniver } from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";

// Sorting plugin imports
import { UniverSheetsSortPlugin } from "@univerjs/sheets-sort";
import { UniverSheetsSortUIPlugin } from "@univerjs/sheets-sort-ui";
import SheetsSortUIEnUS from "@univerjs/sheets-sort-ui/locale/en-US";
import "@univerjs/sheets-sort-ui/lib/index.css";

// Persistence helpers
import { saveWorkbookSnapshot, loadWorkbookSnapshot } from "@/lib/workbookPersistence";

// Icons for custom toolbar
import { ArrowUpDown, Info, Maximize2 } from "lucide-react";

// Chart system (lazy)
import type { ChartConfig } from "@/components/charts/types";
import ChartPanel from "@/components/charts/ChartPanel";

// Table system
import type { TableConfig, PivotConfig } from "@/components/tables/types";
import { restoreTableStyling, readTableData, readFieldHeaders } from "@/components/tables/tableUtils";

// Pivot (lazy)
const PivotPanel = lazy(() => import("@/components/pivot/PivotPanel"));

export interface SheetData {
  id?: string;
  name?: string;
  cellData?: Record<number, Record<number, { v?: string | number; f?: string }>>;
  rowCount?: number;
  columnCount?: number;
}

export interface UniverSpreadsheetProps {
  initialData?: SheetData;
  height?: string | number;
  readOnly?: boolean;
  lessonSlug?: string;
  /** Phase number — used to dynamically load CF plugin for phase 6-7 */
  phase?: number;
  onChange?: (data: SheetData) => void;
}

export interface UniverSpreadsheetRef {
  getDataArray: () => string[][] | null;
  getAPI: () => FUniver | null;
  endEditing: () => Promise<void>;
  reset: () => void;
}

/**
 * Convert a 2D string array to Univer cellData format
 */
export function arrayToCellData(data: string[][]): Record<number, Record<number, { v: string }>> {
  const cellData: Record<number, Record<number, { v: string }>> = {};
  data.forEach((row, rowIndex) => {
    cellData[rowIndex] = {};
    row.forEach((cell, colIndex) => {
      cellData[rowIndex][colIndex] = { v: cell };
    });
  });
  return cellData;
}

/**
 * Extract cellData from the live Univer sheet for persistence.
 */
function extractCellData(univerAPI: FUniver, rowCount: number, colCount: number): Record<number, Record<number, { v: string }>> | null {
  try {
    const workbook = univerAPI.getActiveWorkbook();
    if (!workbook) return null;
    const sheet = workbook.getActiveSheet();
    if (!sheet) return null;
    const range = sheet.getRange(0, 0, rowCount, colCount);
    const values = range.getValues();
    const cellData: Record<number, Record<number, { v: string }>> = {};
    values.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const v = cell === null || cell === undefined ? "" : String(cell);
        if (v !== "") {
          if (!cellData[ri]) cellData[ri] = {};
          cellData[ri][ci] = { v };
        }
      });
    });
    return cellData;
  } catch {
    return null;
  }
}

export const UniverSpreadsheet = forwardRef<UniverSpreadsheetRef, UniverSpreadsheetProps>(
  ({ initialData, height = 400, readOnly = false, lessonSlug, phase = 0, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const univerAPIRef = useRef<FUniver | null>(null);
    const univerInstanceRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const initialDataRef = useRef(initialData);
    const skipSaveRef = useRef(false);

    // Read-only charts and tables from persistence (phase 6-7 embedded mode)
    const [charts, setCharts] = useState<ChartConfig[]>([]);
    const [tables, setTables] = useState<TableConfig[]>([]);
    const [pivots, setPivots] = useState<PivotConfig[]>([]);
    const [pivotData, setPivotData] = useState<Record<string, string | number>[] | null>(null);
    const [pivotFields, setPivotFields] = useState<string[]>([]);
    const [pivotSourceRange, setPivotSourceRange] = useState("");
    const showAdvanced = phase >= 6;

    initialDataRef.current = initialData;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getDataArray: () => {
        if (!univerAPIRef.current) return null;
        const workbook = univerAPIRef.current.getActiveWorkbook();
        if (!workbook) return null;
        const sheet = workbook.getActiveSheet();
        if (!sheet) return null;
        const rowCount = initialDataRef.current?.rowCount || 20;
        const colCount = initialDataRef.current?.columnCount || 10;
        const range = sheet.getRange(0, 0, rowCount, colCount);
        try {
          const values = range.getValues();
          return values.map(row =>
            row.map(cell => (cell === null || cell === undefined) ? "" : String(cell))
          );
        } catch (e) {
          console.error("Error getting values:", e);
          return null;
        }
      },
      getAPI: () => univerAPIRef.current,
      endEditing: async () => {
        if (!univerAPIRef.current) return;
        const workbook = univerAPIRef.current.getActiveWorkbook();
        if (workbook && typeof (workbook as any).endEditingAsync === 'function') {
          await (workbook as any).endEditingAsync(true);
        }
      },
      reset: () => {
        skipSaveRef.current = true;
        if (!univerAPIRef.current || !initialDataRef.current) return;
        const workbook = univerAPIRef.current.getActiveWorkbook();
        if (!workbook) return;
        const sheet = workbook.getActiveSheet();
        if (!sheet) return;
        const rowCount = initialDataRef.current.rowCount || 20;
        const colCount = initialDataRef.current.columnCount || 10;
        const range = sheet.getRange(0, 0, rowCount, colCount);
        try {
          const clearData: (string | null)[][] = Array(rowCount).fill(null).map(() =>
            Array(colCount).fill(null)
          );
          range.setValues(clearData);
          if (initialDataRef.current.cellData) {
            Object.entries(initialDataRef.current.cellData).forEach(([rowStr, rowData]) => {
              const rowIndex = parseInt(rowStr);
              Object.entries(rowData as Record<number, { v?: string | number }>).forEach(([colStr, cellData]) => {
                const colIndex = parseInt(colStr);
                const cellRange = sheet.getRange(rowIndex, colIndex, 1, 1);
                if (cellData.v !== undefined) {
                  cellRange.setValue(cellData.v);
                }
              });
            });
          }
          // Clear charts and tables on reset
          setCharts([]);
          setTables([]);
          setPivots([]);
          setPivotData(null);
        } catch (e) {
          console.error("Error resetting spreadsheet:", e);
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current || isInitializedRef.current) return;
      isInitializedRef.current = true;

      const container = containerRef.current;

      let cellData = initialData?.cellData || {};
      let rowCount = initialData?.rowCount || 20;
      let columnCount = initialData?.columnCount || 10;
      let hadSnapshot = false;

      if (lessonSlug) {
        const snapshot = loadWorkbookSnapshot(lessonSlug);
        if (snapshot) {
          hadSnapshot = true;
          cellData = snapshot.cellData;
          rowCount = Math.max(rowCount, snapshot.rowCount);
          columnCount = Math.max(columnCount, snapshot.columnCount);
          // Load persisted charts for read-only display
          if (showAdvanced && snapshot.charts && snapshot.charts.length > 0) {
            setCharts(snapshot.charts);
          }
          // Load persisted tables
          if (showAdvanced && snapshot.tables && snapshot.tables.length > 0) {
            setTables(snapshot.tables);
          }
          // Load persisted pivots
          if (showAdvanced && snapshot.pivots && snapshot.pivots.length > 0) {
            setPivots(snapshot.pivots);
          }
        }
      }

      async function init() {
        const presets: any[] = [UniverSheetsCorePreset({ container })];
        const localesToMerge: Record<string, any>[] = [UniverPresetSheetsCoreEnUS, SheetsSortUIEnUS];

        if (phase >= 6) {
          try {
            const [cfPresetMod, cfLocaleMod] = await Promise.all([
              import("@univerjs/preset-sheets-conditional-formatting"),
              import("@univerjs/preset-sheets-conditional-formatting/locales/en-US"),
            ]);
            await import("@univerjs/preset-sheets-conditional-formatting/lib/index.css");
            presets.push(cfPresetMod.UniverSheetsConditionalFormattingPreset());
            localesToMerge.push(cfLocaleMod.default ?? cfLocaleMod);
          } catch (e) {
            console.error("[UniverSpreadsheet] failed to load CF preset:", e);
          }
        }

        const mergedLocales = mergeLocales(...localesToMerge);

        const { univerAPI, univer } = createUniver({
          locale: LocaleType.EN_US,
          locales: { [LocaleType.EN_US]: mergedLocales },
          presets,
        });

        univer.registerPlugin(UniverSheetsSortPlugin);
        univer.registerPlugin(UniverSheetsSortUIPlugin);

        univerAPIRef.current = univerAPI;
        univerInstanceRef.current = univer;

        const workbookData = {
          id: initialData?.id || "workbook-1",
          sheetOrder: ["sheet-1"],
          name: "Workbook",
          appVersion: "1.0.0",
          sheets: {
            "sheet-1": {
              id: "sheet-1",
              name: initialData?.name || "Sheet1",
              rowCount,
              columnCount,
              cellData,
            },
          },
        };

        univerAPI.createWorkbook(workbookData);

        // Restore persisted conditional formatting rules
        if (hadSnapshot && lessonSlug) {
          const snapshot = loadWorkbookSnapshot(lessonSlug);
          if (snapshot?.cfRules && snapshot.cfRules.length > 0) {
            try {
              const workbook = univerAPI.getActiveWorkbook();
              const sheet = workbook?.getActiveSheet();
              if (sheet && typeof (sheet as any).addConditionalFormattingRule === 'function') {
                for (const rule of snapshot.cfRules) {
                  (sheet as any).addConditionalFormattingRule(rule);
                }
              }
            } catch (e) {
              console.warn("[UniverSpreadsheet] failed to restore CF rules:", e);
            }
          }
        }

        // Restore table styling
        if (hadSnapshot && lessonSlug) {
          const snap2 = loadWorkbookSnapshot(lessonSlug);
          if (snap2?.tables && snap2.tables.length > 0) {
            setTimeout(() => restoreTableStyling(univerAPI, snap2.tables!), 100);
          }
          // Restore pivot data for read-only display
          if (snap2?.pivots && snap2.pivots.length > 0) {
            const pc = snap2.pivots[0];
            const pData = readTableData(univerAPI, pc.sourceRange);
            const pFields = readFieldHeaders(univerAPI, pc.sourceRange);
            if (pData && pFields) {
              setPivotData(pData);
              setPivotFields(pFields);
              setPivotSourceRange(pc.sourceRange);
            }
          }
        }
        if (lessonSlug && !hadSnapshot && initialData?.cellData) {
          saveWorkbookSnapshot(lessonSlug, cellData, rowCount, columnCount);
        }
      }

      init();

      return () => {
        if (lessonSlug && !skipSaveRef.current && univerAPIRef.current) {
          const extracted = extractCellData(univerAPIRef.current, rowCount, columnCount);
          if (extracted) {
            let cfRules: any[] = [];
            try {
              const workbook = univerAPIRef.current.getActiveWorkbook();
              const sheet = workbook?.getActiveSheet();
              if (sheet && typeof (sheet as any).getConditionalFormattingRules === 'function') {
                cfRules = (sheet as any).getConditionalFormattingRules() ?? [];
              }
            } catch { /* CF plugin may not be loaded */ }
            // Preserve existing charts, tables, pivots when saving from embedded mode
            const snapshot = lessonSlug ? loadWorkbookSnapshot(lessonSlug) : null;
            saveWorkbookSnapshot(
              lessonSlug, extracted, rowCount, columnCount, cfRules,
              charts, snapshot?.tables ?? [], snapshot?.pivots ?? []
            );
          }
        }
        univerAPIRef.current?.dispose();
        isInitializedRef.current = false;
      };
    }, []);

    // Save before navigating to Full Mode
    const handleOpenFullMode = () => {
      if (lessonSlug && univerAPIRef.current) {
        const rowCount = initialDataRef.current?.rowCount || 20;
        const colCount = initialDataRef.current?.columnCount || 10;
        const extracted = extractCellData(univerAPIRef.current, rowCount, colCount);
        if (extracted) {
          let cfRules: any[] = [];
          try {
            const workbook = univerAPIRef.current.getActiveWorkbook();
            const sheet = workbook?.getActiveSheet();
            if (sheet && typeof (sheet as any).getConditionalFormattingRules === 'function') {
              cfRules = (sheet as any).getConditionalFormattingRules() ?? [];
            }
          } catch { /* CF plugin may not be loaded */ }
          const snapshot = loadWorkbookSnapshot(lessonSlug);
          saveWorkbookSnapshot(
            lessonSlug, extracted, rowCount, colCount, cfRules,
            charts, snapshot?.tables ?? [], snapshot?.pivots ?? []
          );
        }
      }
    };

    const spreadsheetHeight = typeof height === "number" ? height - 36 : `calc(${height} - 36px)`;

    return (
      <div className="univer-spreadsheet-wrapper univer-embedded-mode rounded-lg overflow-hidden border border-border">
        {/* Tips Toolbar */}
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">Tips:</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3 w-3" />
            <span>Right-click any cell → <strong>Sort A-Z</strong> or <strong>Sort Z-A</strong></span>
          </div>
          <div className="h-3 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            Use formulas like <code className="bg-muted px-1 rounded">=SUM(A1:A5)</code>
          </span>
          {lessonSlug && (
            <>
              <div className="h-3 w-px bg-border" />
              <a
                href={`/sheet?lesson=${lessonSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenFullMode}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium ml-auto"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Open Full Mode</span>
              </a>
            </>
          )}
        </div>

        {/* Spreadsheet Container */}
        <div
          ref={containerRef}
          className="univer-spreadsheet-container"
          style={{ height: spreadsheetHeight, width: "100%" }}
        />

        {/* Read-only charts in embedded mode (phase 6-7 only) */}
        {showCharts && charts.length > 0 && (
          <div className="border-t border-border">
            <ChartPanel charts={charts} readOnly />
          </div>
        )}
      </div>
    );
  }
);

UniverSpreadsheet.displayName = "UniverSpreadsheet";
