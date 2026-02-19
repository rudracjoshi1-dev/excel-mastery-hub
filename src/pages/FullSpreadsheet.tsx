import { useEffect, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import type { FUniver } from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";

// Sorting plugins (stable — registered manually, no preset available)
import { UniverSheetsSortPlugin } from "@univerjs/sheets-sort";
import { UniverSheetsSortUIPlugin } from "@univerjs/sheets-sort-ui";
import SheetsSortUIEnUS from "@univerjs/sheets-sort-ui/locale/en-US";
import "@univerjs/sheets-sort-ui/lib/index.css";
// Filter plugins are dynamically imported for Phase 6+ lessons only

import { lessons } from "@/data/lessons";
import { arrayToCellData } from "@/components/lessons/UniverSpreadsheet";
import { getLessonByPath, shouldLoadHeavyPlugins } from "@/data/allLessons";
import { loadWorkbookSnapshot, saveWorkbookSnapshot } from "@/lib/workbookPersistence";
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
  const univerInstanceRef = useRef<any>(null);
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
  if (!containerRef.current) return;

  // Dispose any existing instance first
  if (univerAPIRef.current) {
    univerAPIRef.current.dispose();
    univerAPIRef.current = null;
    univerInstanceRef.current?.dispose();
    univerInstanceRef.current = null;
    isInitializedRef.current = false;
  }

  isInitializedRef.current = true;

  const container = containerRef.current;
  const phase = lessonMeta?.phase ?? 0;

  async function init() {
    try {
      // --- Build presets ---
      const presets: any[] = [UniverSheetsCorePreset({ container })];
      const localesToMerge: Record<string, any>[] = [
        UniverPresetSheetsCoreEnUS,
        SheetsSortUIEnUS,
      ];

      // Phase-based heavy plugins
      if (shouldLoadHeavyPlugins(phase)) {
        const [filterPresetMod, filterLocaleMod] = await Promise.all([
          import("@univerjs/preset-sheets-filter"),
          import("@univerjs/preset-sheets-filter/locales/en-US"),
        ]);
        await import("@univerjs/preset-sheets-filter/lib/index.css");

        presets.push(filterPresetMod.UniverSheetsFilterPreset());
        localesToMerge.push(filterLocaleMod.default ?? filterLocaleMod);
        console.log(`[FullSpreadsheet] Phase ${phase}: filter preset loaded`);
      }

      const finalLocales = mergeLocales(...localesToMerge);

      // --- Create Univer ---
      const { univerAPI, univer } = createUniver({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: finalLocales },
        presets,
      });

      univer.registerPlugin(UniverSheetsSortPlugin);
      univer.registerPlugin(UniverSheetsSortUIPlugin);

      univerAPIRef.current = univerAPI;
      univerInstanceRef.current = univer;

      // --- Load snapshot or default workbook ---
      const savedSnapshot = lessonSlug ? loadWorkbookSnapshot(lessonSlug) : null;

      if (savedSnapshot) {
        univerAPI.createWorkbook(savedSnapshot);
        console.log("FULL → snapshot loaded");
      } else {
        univerAPI.createWorkbook(workbookData);
        console.log("FULL → default workbook loaded");
      }

      // --- BroadcastChannel for real-time syncing ---
      const bc = new BroadcastChannel("univer-sync");
      bc.onmessage = (ev) => {
        if (ev.data.lessonSlug === lessonSlug && univerAPIRef.current) {
          univerAPIRef.current.createWorkbook(ev.data.snapshot);
          console.log(`[FullSpreadsheet] Received broadcast snapshot for "${lessonSlug}"`);
        }
      };

      // Listen for workbook changes to broadcast to embedded sheets
      const workbook = univerAPI.getActiveWorkbook();
      workbook.onSnapshotChanged?.(() => {
        const snapshot = univerAPIRef.current?.getWorkbookJSON();
        if (snapshot) {
          saveWorkbookSnapshot(lessonSlug!, univerAPIRef.current!);
          bc.postMessage({ lessonSlug, snapshot });
          console.log(`[FullSpreadsheet] Broadcast snapshot for "${lessonSlug}"`);
        }
      });

      // Cleanup
      return () => {
        bc.close();
      };
    } catch (err) {
      console.error("FULL → failed to initialize Univer:", err);
    }
  }

  init();

  return () => {
    if (lessonSlug && univerAPIRef.current) {
      saveWorkbookSnapshot(lessonSlug, univerAPIRef.current);
      console.log(`[FullSpreadsheet] Saved snapshot on unmount for "${lessonSlug}".`);
    }

    univerAPIRef.current?.dispose();
    univerInstanceRef.current?.dispose();
    isInitializedRef.current = false;
  };
}, [lessonSlug, lessonMeta, workbookData]);



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
