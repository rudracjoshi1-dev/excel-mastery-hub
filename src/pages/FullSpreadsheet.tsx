import { useEffect, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import type { FUniver } from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";

// Sorting plugins
import { UniverSheetsSortPlugin } from "@univerjs/sheets-sort";
import { UniverSheetsSortUIPlugin } from "@univerjs/sheets-sort-ui";
import SheetsSortUIEnUS from "@univerjs/sheets-sort-ui/locale/en-US";
import "@univerjs/sheets-sort-ui/lib/index.css";

import { lessons } from "@/data/lessons";
import { arrayToCellData } from "@/components/lessons/UniverSpreadsheet";
import { getLessonByPath, shouldLoadHeavyPlugins } from "@/data/allLessons";
import { saveWorkbookSnapshot, loadWorkbookSnapshot } from "@/lib/workbookPersistence";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full Spreadsheet page — opens in a new browser tab via /sheet?lesson=<slug>
 * Shares persisted workbook state with the embedded spreadsheet via localStorage.
 */
export default function FullSpreadsheet() {
  const [searchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const containerRef = useRef<HTMLDivElement>(null);
  const univerAPIRef = useRef<FUniver | null>(null);
  const isInitializedRef = useRef(false);
  const dimensionsRef = useRef({ rowCount: 50, columnCount: 26 });

  const lessonMeta = useMemo(() => {
    if (!lessonSlug) return null;
    return getLessonByPath(lessonSlug) ?? null;
  }, [lessonSlug]);

  const lessonData = useMemo(() => {
    if (!lessonSlug) return null;
    return lessons.find((l) => l.slug === lessonSlug) ?? null;
  }, [lessonSlug]);

  // Default placeholder data (matches PlaceholderContent in LessonPage)
  const defaultPlaceholderData = [
    ["Column A", "Column B", "Column C", "Column D"],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ];

  // Build workbook data: prefer persisted snapshot, fall back to lesson defaults
  const workbookData = useMemo(() => {
    // Try legacy lesson data first, then fall back to placeholder
    const defaultInitialData = lessonData?.interactiveTask?.initialData ?? defaultPlaceholderData;
    let cellData: Record<number, Record<number, { v?: string | number; f?: string }>> =
      arrayToCellData(defaultInitialData);
    let rowCount = Math.max(50, defaultInitialData.length + 10);
    let columnCount = Math.max(26, (defaultInitialData[0]?.length ?? 0) + 5);

    // Load persisted snapshot if available
    if (lessonSlug) {
      const snapshot = loadWorkbookSnapshot(lessonSlug);
      if (snapshot) {
        cellData = snapshot.cellData;
        rowCount = Math.max(rowCount, snapshot.rowCount);
        columnCount = Math.max(columnCount, snapshot.columnCount);
      }
    }

    dimensionsRef.current = { rowCount, columnCount };

    return {
      id: "full-workbook",
      sheetOrder: ["sheet-1"],
      name: lessonData?.title ?? "Spreadsheet",
      appVersion: "1.0.0",
      sheets: {
        "sheet-1": {
          id: "sheet-1",
          name: lessonData?.title ?? "Sheet1",
          rowCount,
          columnCount,
          cellData,
        },
      },
    };
  }, [lessonData, lessonSlug]);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const container = containerRef.current;
    const phase = lessonMeta?.phase ?? 0;

    async function init() {
      const presets: any[] = [UniverSheetsCorePreset({ container })];
      const localesToMerge: Record<string, any>[] = [UniverPresetSheetsCoreEnUS, SheetsSortUIEnUS];

      if (shouldLoadHeavyPlugins(phase)) {
        // Load all advanced presets in parallel
        const loadFilter = import("@univerjs/preset-sheets-filter")
          .then(async (mod) => {
            const locale = await import("@univerjs/preset-sheets-filter/locales/en-US");
            await import("@univerjs/preset-sheets-filter/lib/index.css");
            return { preset: mod.UniverSheetsFilterPreset(), locale: locale.default ?? locale };
          }).catch(e => { console.error("[FullSpreadsheet] filter load failed:", e); return null; });

        const loadCF = import("@univerjs/preset-sheets-conditional-formatting")
          .then(async (mod) => {
            const locale = await import("@univerjs/preset-sheets-conditional-formatting/locales/en-US");
            await import("@univerjs/preset-sheets-conditional-formatting/lib/index.css");
            return { preset: mod.UniverSheetsConditionalFormattingPreset(), locale: locale.default ?? locale };
          }).catch(e => { console.error("[FullSpreadsheet] CF load failed:", e); return null; });

        const results = await Promise.all([loadFilter, loadCF]);
        for (const r of results) {
          if (r) {
            presets.push(r.preset);
            localesToMerge.push(r.locale);
          }
        }
      }

      const finalLocales = mergeLocales(...localesToMerge);

      const { univerAPI, univer } = createUniver({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: finalLocales },
        presets,
      });

      univer.registerPlugin(UniverSheetsSortPlugin);
      univer.registerPlugin(UniverSheetsSortUIPlugin);

      univerAPIRef.current = univerAPI;
      univerAPI.createWorkbook(workbookData);
    }

    init();

    // Save state on unmount (tab close / navigation)
    const handleBeforeUnload = () => {
      if (lessonSlug && univerAPIRef.current) {
        const { rowCount, columnCount } = dimensionsRef.current;
        const extracted = extractCellDataFromAPI(univerAPIRef.current, rowCount, columnCount);
        if (extracted) {
          // Also extract CF rules if available
          let cfRules: any[] = [];
          try {
            const workbook = univerAPIRef.current.getActiveWorkbook();
            const sheet = workbook?.getActiveSheet();
            if (sheet && typeof (sheet as any).getConditionalFormattingRules === 'function') {
              cfRules = (sheet as any).getConditionalFormattingRules() ?? [];
            }
          } catch { /* CF plugin may not be loaded */ }
          saveWorkbookSnapshot(lessonSlug, extracted, rowCount, columnCount, cfRules);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also save on React unmount
      handleBeforeUnload();
      univerAPIRef.current?.dispose();
      isInitializedRef.current = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/30 shrink-0">
        {lessonSlug && (
          <Link to={`/learn/${lessonSlug}`} target="_self">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Lesson
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm truncate">
            {lessonMeta?.title ?? lessonData?.title ?? "Full Spreadsheet"}
          </span>
          {lessonMeta && (
            <span className="text-xs text-muted-foreground shrink-0">
              — Phase {lessonMeta.phase} · {shouldLoadHeavyPlugins(lessonMeta.phase) ? "Advanced Mode" : "Standard Mode"}
            </span>
          )}
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}

/** Extract cellData from live Univer API for persistence */
function extractCellDataFromAPI(
  univerAPI: FUniver,
  rowCount: number,
  colCount: number
): Record<number, Record<number, { v: string }>> | null {
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
