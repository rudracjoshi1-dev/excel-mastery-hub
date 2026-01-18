import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
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

// Filter plugin imports
import { UniverSheetsFilterPlugin } from "@univerjs/sheets-filter";
import { UniverSheetsFilterUIPlugin } from "@univerjs/sheets-filter-ui";
import SheetsFilterUIEnUS from "@univerjs/sheets-filter-ui/locale/en-US";
import "@univerjs/sheets-filter-ui/lib/index.css";

// Icons for custom toolbar
import { Filter, ArrowUpDown, X } from "lucide-react";

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
  /** Reset the spreadsheet to initial data */
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
 * Reusable Univer Spreadsheet component with Excel-like functionality
 * Supports keyboard navigation, formulas, copy/paste, drag fill, sorting, filtering
 */
export const UniverSpreadsheet = forwardRef<UniverSpreadsheetRef, UniverSpreadsheetProps>(
  ({ initialData, height = 400, readOnly = false, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const univerAPIRef = useRef<FUniver | null>(null);
    const univerInstanceRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const initialDataRef = useRef(initialData);
    const [hasFilter, setHasFilter] = useState(false);

    // Update initial data ref when prop changes
    initialDataRef.current = initialData;

    // Apply filter to the data range
    const handleApplyFilter = () => {
      if (!univerAPIRef.current) return;
      const workbook = univerAPIRef.current.getActiveWorkbook();
      if (!workbook) return;
      const sheet = workbook.getActiveSheet();
      if (!sheet) return;

      try {
        // Get the data range - find rows with actual data
        const rowCount = initialDataRef.current?.rowCount || 20;
        const colCount = initialDataRef.current?.columnCount || 10;
        
        // Find actual data extent
        let lastDataRow = 0;
        let lastDataCol = 0;
        
        if (initialDataRef.current?.cellData) {
          Object.entries(initialDataRef.current.cellData).forEach(([rowStr, rowData]) => {
            const rowIdx = parseInt(rowStr);
            if (rowIdx > lastDataRow) lastDataRow = rowIdx;
            Object.keys(rowData as object).forEach(colStr => {
              const colIdx = parseInt(colStr);
              if (colIdx > lastDataCol) lastDataCol = colIdx;
            });
          });
        }
        
        // Select the data range and apply filter
        const dataRange = sheet.getRange(0, 0, lastDataRow + 1, lastDataCol + 1);
        
        // Use the facade API to create filter
        const sheetFilter = (sheet as any).getFilter?.();
        if (sheetFilter) {
          // Filter already exists
          setHasFilter(true);
          return;
        }
        
        // Try to create filter using command
        const commandService = univerInstanceRef.current?.__injector?.get?.('ICommandService');
        if (commandService) {
          commandService.executeCommand('sheet.command.create-filter', {
            unitId: workbook.getId(),
            subUnitId: sheet.getSheetId(),
            range: {
              startRow: 0,
              endRow: lastDataRow,
              startColumn: 0,
              endColumn: lastDataCol
            }
          });
          setHasFilter(true);
        } else {
          // Fallback: inform user to use menu
          console.log('Filter command not available, use Data menu in toolbar');
        }
      } catch (e) {
        console.error("Error applying filter:", e);
      }
    };

    // Remove filter from the sheet
    const handleRemoveFilter = () => {
      if (!univerAPIRef.current) return;
      const workbook = univerAPIRef.current.getActiveWorkbook();
      if (!workbook) return;
      const sheet = workbook.getActiveSheet();
      if (!sheet) return;

      try {
        const commandService = univerInstanceRef.current?.__injector?.get?.('ICommandService');
        if (commandService) {
          commandService.executeCommand('sheet.command.remove-filter', {
            unitId: workbook.getId(),
            subUnitId: sheet.getSheetId(),
          });
          setHasFilter(false);
        }
      } catch (e) {
        console.error("Error removing filter:", e);
      }
    };

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
        
        // Clear existing data and restore initial data
        const rowCount = initialDataRef.current.rowCount || 20;
        const colCount = initialDataRef.current.columnCount || 10;
        const range = sheet.getRange(0, 0, rowCount, colCount);
        
        try {
          // Clear all cells first
          const clearData: (string | null)[][] = Array(rowCount).fill(null).map(() => 
            Array(colCount).fill(null)
          );
          range.setValues(clearData);
          
          // Restore initial data
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
          
          // Also remove any active filter
          setHasFilter(false);
        } catch (e) {
          console.error("Error resetting spreadsheet:", e);
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current || isInitializedRef.current) return;
      
      isInitializedRef.current = true;

      // Merge locales for i18n support
      const mergedLocales = mergeLocales(
        UniverPresetSheetsCoreEnUS,
        SheetsSortUIEnUS,
        SheetsFilterUIEnUS
      );

      // Create Univer instance with sheets preset
      const { univerAPI, univer } = createUniver({
        locale: LocaleType.EN_US,
        locales: {
          [LocaleType.EN_US]: mergedLocales,
        },
        presets: [
          UniverSheetsCorePreset({
            container: containerRef.current,
          }),
        ],
      });

      // Register sorting plugins
      univer.registerPlugin(UniverSheetsSortPlugin);
      univer.registerPlugin(UniverSheetsSortUIPlugin);

      // Register filter plugins
      univer.registerPlugin(UniverSheetsFilterPlugin as any);
      univer.registerPlugin(UniverSheetsFilterUIPlugin as any);

      univerAPIRef.current = univerAPI;
      univerInstanceRef.current = univer;

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
    // Subtract toolbar height from container
    const spreadsheetHeight = typeof height === "number" ? height - 40 : `calc(${height} - 40px)`;

    return (
      <div className="univer-spreadsheet-wrapper rounded-lg overflow-hidden border border-border">
        {/* Custom Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground mr-2">Quick Actions:</span>
          
          {!hasFilter ? (
            <button
              onClick={handleApplyFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="Apply filter to show dropdown arrows on column headers"
            >
              <Filter className="h-3.5 w-3.5" />
              Apply Filter
            </button>
          ) : (
            <button
              onClick={handleRemoveFilter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              title="Remove filter from data"
            >
              <X className="h-3.5 w-3.5" />
              Remove Filter
            </button>
          )}
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <span className="text-xs text-muted-foreground">
            <ArrowUpDown className="h-3 w-3 inline mr-1" />
            Right-click column header → Sort A-Z / Z-A
          </span>
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
