import { useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import type { FUniver } from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";

// Sorting plugin (stable)
import { UniverSheetsSortPlugin } from "@univerjs/sheets-sort";
import { UniverSheetsSortUIPlugin } from "@univerjs/sheets-sort-ui";
import SheetsSortUIEnUS from "@univerjs/sheets-sort-ui/locale/en-US";
import "@univerjs/sheets-sort-ui/lib/index.css";

import { lessons } from "@/data/lessons";
import { arrayToCellData } from "@/components/lessons/UniverSpreadsheet";
import { getLessonByPath, shouldLoadHeavyPlugins } from "@/data/allLessons";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full Spreadsheet page — opens in a new browser tab via /sheet?lesson=<slug>
 * 
 * Architecture notes:
 * - This page has its OWN Univer instance, completely isolated from embedded spreadsheets
 * - Heavy plugins (filter, conditional formatting) will be registered HERE only
 * - Dynamic imports for heavy plugins will be added in future iterations
 * - The embedded UniverSpreadsheet component remains lightweight
 */
export default function FullSpreadsheet() {
  const [searchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const containerRef = useRef<HTMLDivElement>(null);
  const univerAPIRef = useRef<FUniver | null>(null);
  const isInitializedRef = useRef(false);

  // Find lesson metadata for plugin gating
  const lessonMeta = useMemo(() => {
    if (!lessonSlug) return null;
    return getLessonByPath(lessonSlug) ?? null;
  }, [lessonSlug]);

  // Find lesson data if a lesson slug is provided (legacy lookup)
  const lessonData = useMemo(() => {
    if (!lessonSlug) return null;
    // Try the slug directly (top-level lesson)
    return lessons.find((l) => l.slug === lessonSlug) ?? null;
  }, [lessonSlug]);

  // Build workbook data from lesson or start blank
  const workbookData = useMemo(() => {
    const initialData = lessonData?.interactiveTask?.initialData;
    const cellData = initialData ? arrayToCellData(initialData) : {};
    const rowCount = initialData ? Math.max(50, initialData.length + 10) : 50;
    const columnCount = initialData
      ? Math.max(26, (initialData[0]?.length ?? 0) + 5)
      : 26;

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
  }, [lessonData]);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const mergedLocales = mergeLocales(
      UniverPresetSheetsCoreEnUS,
      SheetsSortUIEnUS
    );

    const { univerAPI, univer } = createUniver({
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergedLocales },
      presets: [
        UniverSheetsCorePreset({ container: containerRef.current }),
      ],
    });

    // Register plugins in safe order: core deps first, then UI
    univer.registerPlugin(UniverSheetsSortPlugin);
    univer.registerPlugin(UniverSheetsSortUIPlugin);

    // === Phase-based heavy plugin gating ===
    // Heavy plugins (filter, conditional formatting, pivot tables) are ONLY
    // registered for Phase 6–7 lessons. This prevents DI conflicts and
    // keeps the bundle lightweight for beginner lessons.
    const phase = lessonMeta?.phase ?? 0;
    if (shouldLoadHeavyPlugins(phase)) {
      // FUTURE: Dynamically import and register heavy plugins here.
      // Example (not yet active):
      //   const { UniverSheetsFilterPlugin } = await import("@univerjs/sheets-filter");
      //   const { UniverSheetsFilterUIPlugin } = await import("@univerjs/sheets-filter-ui");
      //   univer.registerPlugin(UniverSheetsFilterPlugin);
      //   univer.registerPlugin(UniverSheetsFilterUIPlugin);
      console.log(`[FullSpreadsheet] Phase ${phase}: heavy plugins eligible (not yet loaded)`);
    } else {
      console.log(`[FullSpreadsheet] Phase ${phase}: lightweight mode (no heavy plugins)`);
    }

    univerAPIRef.current = univerAPI;
    univerAPI.createWorkbook(workbookData);

    return () => {
      univerAPI.dispose();
      isInitializedRef.current = false;
    };
  }, []); // Mount once

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Compact header bar */}
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

      {/* Spreadsheet fills remaining space */}
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}
