import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  memo,
} from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import "@univerjs/preset-sheets-core/lib/index.css";
import {
  loadWorkbookSnapshot,
  saveWorkbookSnapshot,
} from "@/lib/workbookPersistence";

// ── Types ────────────────────────────────────────────────────────

export interface SheetData {
  id: string;
  name: string;
  cellData: Record<number, Record<number, { v: string | number }>>;
  rowCount: number;
  columnCount: number;
}

export interface UniverSpreadsheetRef {
  /** Read current sheet data as a 2D string array */
  getDataArray: () => string[][] | null;
  /** End any active cell editing so values are committed */
  endEditing: () => Promise<void>;
  /** Flag to skip saving on the next unmount (used during reset) */
  skipNextSave: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────

/** Convert a 2D string array into UniverJS cellData format */
export function arrayToCellData(
  data: string[][]
): Record<number, Record<number, { v: string | number }>> {
  const cellData: Record<number, Record<number, { v: string | number }>> = {};
  for (let r = 0; r < data.length; r++) {
    cellData[r] = {};
    for (let c = 0; c < data[r].length; c++) {
      if (data[r][c] !== "") {
        cellData[r][c] = { v: data[r][c] };
      }
    }
  }
  return cellData;
}

/** Convert UniverJS cellData back to a 2D string array */
function cellDataToArray(
  cellData: Record<string, Record<string, { v?: string | number }>> | undefined,
  rowCount: number,
  colCount: number
): string[][] {
  const result: string[][] = [];
  for (let r = 0; r < rowCount; r++) {
    const row: string[] = [];
    for (let c = 0; c < colCount; c++) {
      const cell = cellData?.[r]?.[c];
      row.push(cell?.v != null ? String(cell.v) : "");
    }
    result.push(row);
  }
  return result;
}

// ── Props ────────────────────────────────────────────────────────

interface UniverSpreadsheetProps {
  initialData: SheetData;
  height?: number;
  readOnly?: boolean;
  /** Lesson slug for localStorage persistence key */
  lessonSlug?: string;
}

// ── Component ────────────────────────────────────────────────────

export const UniverSpreadsheet = memo(
  forwardRef<UniverSpreadsheetRef, UniverSpreadsheetProps>(
    function UniverSpreadsheet(
      { initialData, height = 450, readOnly = false, lessonSlug },
      ref
    ) {
      const containerRef = useRef<HTMLDivElement>(null);
      const univerAPIRef = useRef<any>(null);
      const skipSaveRef = useRef(false);

      // Expose imperative methods
      useImperativeHandle(
        ref,
        () => ({
          getDataArray: () => {
            try {
              const api = univerAPIRef.current;
              if (!api) return null;
              const wb = api.getActiveWorkbook?.();
              if (!wb) return null;
              const sheet = wb.getActiveSheet?.();
              if (!sheet) return null;
              const snapshot = wb.getSnapshot?.();
              if (!snapshot?.sheets) return null;
              const sheetId = sheet.getSheetId?.();
              const sheetData = snapshot.sheets[sheetId];
              if (!sheetData) return null;
              return cellDataToArray(
                sheetData.cellData,
                sheetData.rowCount ?? 20,
                sheetData.columnCount ?? 10
              );
            } catch (e) {
              console.warn("[UniverSpreadsheet] getDataArray error:", e);
              return null;
            }
          },
          endEditing: async () => {
            // No direct "end editing" API; a small delay lets the cell commit
            await new Promise((r) => setTimeout(r, 100));
          },
          skipNextSave: () => {
            skipSaveRef.current = true;
            console.log(
              `[UniverSpreadsheet] skipNextSave flagged for "${lessonSlug}".`
            );
          },
        }),
        [lessonSlug]
      );

      useEffect(() => {
        if (!containerRef.current) return;

        // Determine storage key
        const storageKey = lessonSlug
          ? `univer-workbook-${lessonSlug}`
          : undefined;

        console.log(`[UniverSpreadsheet] lessonSlug="${lessonSlug}"`);
        console.log(`[UniverSpreadsheet] storageKey="${storageKey}"`);

        // Check for persisted snapshot
        let workbookData: any = null;
        if (lessonSlug) {
          const saved = loadWorkbookSnapshot(lessonSlug);
          if (saved) {
            console.log(
              `[UniverSpreadsheet] Loaded saved snapshot for "${lessonSlug}".`
            );
            workbookData = saved;
          }
        }

        // Fall back to initial data
        if (!workbookData) {
          console.log(
            `[UniverSpreadsheet] Using default initial data for "${lessonSlug ?? "no-slug"}".`
          );
          workbookData = {
            id: initialData.id,
            name: initialData.name,
            appVersion: "",
            sheets: {
              [initialData.id]: {
                id: initialData.id,
                name: initialData.name,
                cellData: initialData.cellData,
                rowCount: initialData.rowCount,
                columnCount: initialData.columnCount,
              },
            },
            sheetOrder: [initialData.id],
          };
        }

        // Create Univer instance
        const { univerAPI } = createUniver({
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

        univerAPIRef.current = univerAPI;

        // Create workbook from data
        univerAPI.createWorkbook(workbookData);

        // Set read-only if needed
        if (readOnly) {
          try {
            const wb = univerAPI.getActiveWorkbook?.();
            wb?.setEditable?.(false);
          } catch {
            // ignore
          }
        }

        // Cleanup
        return () => {
          // Save before dispose
          if (lessonSlug && univerAPIRef.current && !skipSaveRef.current) {
            saveWorkbookSnapshot(lessonSlug, univerAPIRef.current);
            console.log(
              `[UniverSpreadsheet] Saved snapshot on unmount for "${lessonSlug}".`
            );
          } else if (skipSaveRef.current) {
            console.log(
              `[UniverSpreadsheet] Skipped save on unmount (reset flagged) for "${lessonSlug}".`
            );
          }
          skipSaveRef.current = false;

          try {
            univerAPI.dispose();
          } catch {
            // ignore dispose errors
          }
          univerAPIRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return (
        <div
          ref={containerRef}
          style={{ height, width: "100%" }}
          className="border border-border rounded-md overflow-hidden"
        />
      );
    }
  )
);

export default UniverSpreadsheet;
