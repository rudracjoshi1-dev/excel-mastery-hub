import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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

// Persistence
import { loadWorkbookSnapshot, saveWorkbookSnapshot, clearWorkbookSnapshot } from "@/lib/workbookPersistence";

// Icons for custom toolbar
import { ArrowUpDown, Info, Maximize2 } from "lucide-react";

export interface SheetData {
  id?: string;
  name?: string;
  cellData?: Record<number, Record<number, { v?: string | number; f?: string }>>;
  rowCount?: number;
  columnCount?: number;
}

export interface UniverSpreadsheetProps {
  /** Initial data to populate the spreadsheet */
  initialData?: SheetData;
  /** Height of the spreadsheet container */
  height?: string | number;
  /** Whether the spreadsheet is read-only */
  readOnly?: boolean;
  /** Lesson slug for "Open in Full Mode" link */
  lessonSlug?: string;
  /** Callback when data changes */
  onChange?: (data: SheetData) => void;
}

export interface UniverSpreadsheetRef {
  /** Get current spreadsheet data as 2D array */
  getDataArray: () => string[][] | null;
  /** Get the Univer API instance */
  getAPI: () => FUniver | null;
  /** End editing to commit current cell value */
  endEditing: () => Promise<void>;
  /** Reset the spreadsheet to initial data */
  reset: () => void;
  /** Prevent saving on next unmount (used before reset remount) */
  skipNextSave: () => void;
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
 * Reusable Univer Spreadsheet component with Excel-like functionality
 * Supports keyboard navigation, formulas, copy/paste, drag fill, sorting
 */
export const UniverSpreadsheet = forwardRef<UniverSpreadsheetRef, UniverSpreadsheetProps>(
  ({ initialData, height = 400, readOnly = false, lessonSlug, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const univerAPIRef = useRef<FUniver | null>(null);
    const univerInstanceRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const initialDataRef = useRef(initialData);
    const skipSaveRef = useRef(false);

    // Update initial data ref when prop changes
    initialDataRef.current = initialData;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getDataArray: () => {
        if (!univerAPIRef.current) return null;
        const workbook = univerAPIRef.current.getActiveWorkbook();
        if (!workbook) return null;
        const sheet = workbook.getActiveSheet();
        if (!sheet) return null;
        
        // Get data using Range API
        const rowCount = initialDataRef.current?.rowCount || 20;
        const colCount = initialDataRef.current?.columnCount || 10;
        const range = sheet.getRange(0, 0, rowCount, colCount);
        
        try {
          const values = range.getValues();
          // Convert to string[][] ensuring all values are strings
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

          if (lessonSlug) {
            clearWorkbookSnapshot(lessonSlug);
            console.log(`[UniverSpreadsheet] Cleared snapshot for "${lessonSlug}".`);
          }
        } catch (e) {
          console.error("Error resetting spreadsheet:", e);
        }
      },
      skipNextSave: () => {
        skipSaveRef.current = true;
        console.log(`[UniverSpreadsheet] skipNextSave flagged for "${lessonSlug}".`);
      },
    }));

useEffect(() => {
  if (!containerRef.current) return;

  // Dispose old instance
  if (univerAPIRef.current) {
    univerAPIRef.current.dispose();
    univerAPIRef.current = null;
    univerInstanceRef.current?.dispose();
    univerInstanceRef.current = null;
    isInitializedRef.current = false;
    skipSaveRef.current = false;
  }

  isInitializedRef.current = true;

  const mergedLocales = mergeLocales(UniverPresetSheetsCoreEnUS, SheetsSortUIEnUS);

  const { univerAPI, univer } = createUniver({
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergedLocales },
    presets: [UniverSheetsCorePreset({ container: containerRef.current })],
  });

  univer.registerPlugin(UniverSheetsSortPlugin);
  univer.registerPlugin(UniverSheetsSortUIPlugin);

  univerAPIRef.current = univerAPI;
  univerInstanceRef.current = univer;

  // --- BroadcastChannel for sync ---
  const bc = new BroadcastChannel("univer-sync");

  // Respond to snapshot requests from full spreadsheet
  bc.onmessage = (ev) => {
    const { type, lessonSlug: msgSlug } = ev.data;
    if (type === "REQUEST_SNAPSHOT" && msgSlug === lessonSlug && univerAPIRef.current) {
      const snapshot = univerAPIRef.current.getActiveWorkbook()?.getWorkbookJSON();
      bc.postMessage({ type: "RESPONSE_SNAPSHOT", lessonSlug, snapshot });
    }
  };

  // Auto-save and broadcast on snapshot changes
  const workbook = univerAPI.getActiveWorkbook();
  if (workbook && lessonSlug) {
    workbook.onSnapshotChanged?.(() => {
      if (!skipSaveRef.current) {
        saveWorkbookSnapshot(lessonSlug, univerAPI);
        const snapshot = univerAPI.getActiveWorkbook()?.getWorkbookJSON();
        bc.postMessage({ type: "UPDATE", lessonSlug, snapshot });
        console.log(`[UniverSpreadsheet] Auto-saved and broadcast update for "${lessonSlug}".`);
      }
    });
  }

  // Load persisted snapshot or initialData
  const savedSnapshot = lessonSlug ? loadWorkbookSnapshot(lessonSlug) : null;
  if (savedSnapshot) {
    univerAPI.createWorkbook(savedSnapshot);
  } else {
    const workbookData = {
      id: initialData?.id || "workbook-1",
      sheetOrder: ["sheet-1"],
      name: "Workbook",
      appVersion: "1.0.0",
      sheets: {
        "sheet-1": {
          id: "sheet-1",
          name: initialData?.name || "Sheet1",
          rowCount: initialData?.rowCount || 20,
          columnCount: initialData?.columnCount || 10,
          cellData: initialData?.cellData || {},
        },
      },
    };
    univerAPI.createWorkbook(workbookData);
  }

  return () => {
    if (lessonSlug && univerAPIRef.current && !skipSaveRef.current) {
      saveWorkbookSnapshot(lessonSlug, univerAPIRef.current);
    }
    univerAPIRef.current?.dispose();
    univerInstanceRef.current?.dispose();
    isInitializedRef.current = false;
    skipSaveRef.current = false;
    bc.close();
  };
}, [lessonSlug, initialData]);



    const containerHeight = typeof height === "number" ? `${height}px` : height;
    // Subtract toolbar height from container
    const spreadsheetHeight = typeof height === "number" ? height - 36 : `calc(${height} - 36px)`;

    return (
      <div className="univer-spreadsheet-wrapper rounded-lg overflow-hidden border border-border">
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
      </div>
    );
  }
);

UniverSpreadsheet.displayName = "UniverSpreadsheet";
