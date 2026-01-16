import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import type { FUniver } from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";

// Sorting plugin imports
import { UniverSheetsSortPlugin } from "@univerjs/sheets-sort";
import { UniverSheetsSortUIPlugin } from "@univerjs/sheets-sort-ui";
import "@univerjs/sheets-sort-ui/lib/index.css";

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
 * Supports keyboard navigation, formulas (SUM, AVERAGE, etc.), copy/paste
 */
export const UniverSpreadsheet = forwardRef<UniverSpreadsheetRef, UniverSpreadsheetProps>(
  ({ initialData, height = 400, readOnly = false, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const univerAPIRef = useRef<FUniver | null>(null);
    const isInitializedRef = useRef(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getDataArray: () => {
        if (!univerAPIRef.current) return null;
        const workbook = univerAPIRef.current.getActiveWorkbook();
        if (!workbook) return null;
        const sheet = workbook.getActiveSheet();
        if (!sheet) return null;
        
        // Get data using Range API
        const rowCount = initialData?.rowCount || 20;
        const colCount = initialData?.columnCount || 10;
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
    }));

    useEffect(() => {
      if (!containerRef.current || isInitializedRef.current) return;
      
      isInitializedRef.current = true;

      // Create Univer instance with sheets preset
      const { univerAPI, univer } = createUniver({
        locale: LocaleType.EN_US,
        locales: {
          [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
        },
        presets: [
          UniverSheetsCorePreset({
            container: containerRef.current,
          }),
        ],
      });

      // Register sorting plugins for toolbar functionality
      univer.registerPlugin(UniverSheetsSortPlugin);
      univer.registerPlugin(UniverSheetsSortUIPlugin);

      univerAPIRef.current = univerAPI;

      // Create initial workbook with data
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

      return () => {
        univerAPI.dispose();
        isInitializedRef.current = false;
      };
    }, []); // Empty deps - only run once on mount

    const containerHeight = typeof height === "number" ? `${height}px` : height;

    return (
      <div 
        ref={containerRef} 
        className="univer-spreadsheet-container rounded-lg overflow-hidden border border-border"
        style={{ height: containerHeight, width: "100%" }}
      />
    );
  }
);

UniverSpreadsheet.displayName = "UniverSpreadsheet";
