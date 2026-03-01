import { useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import "@univerjs/preset-sheets-core/lib/index.css";
import {
  loadWorkbookSnapshot,
  saveWorkbookSnapshot,
} from "@/lib/workbookPersistence";
import { getLessonBySlug } from "@/data/lessons";
import { arrayToCellData } from "@/components/lessons/UniverSpreadsheet";

/**
 * Full-tab spreadsheet at /sheet?lesson=<slug>
 * Shares persistence with the embedded UniverSpreadsheet via localStorage.
 */
export default function FullSpreadsheet() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonSlug = searchParams.get("lesson") ?? undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const univerAPIRef = useRef<any>(null);

  // Get default data from lesson if available
  const defaultWorkbookData = useMemo(() => {
    if (!lessonSlug) return null;
    const lesson = getLessonBySlug(lessonSlug);
    if (!lesson) {
      // Return a blank workbook
      return {
        id: "full-sheet",
        name: "Spreadsheet",
        appVersion: "",
        sheets: {
          "full-sheet": {
            id: "full-sheet",
            name: "Sheet1",
            cellData: {},
            rowCount: 30,
            columnCount: 15,
          },
        },
        sheetOrder: ["full-sheet"],
      };
    }
    const cellData = arrayToCellData(lesson.interactiveTask.initialData);
    return {
      id: "lesson-sheet",
      name: lesson.title,
      appVersion: "",
      sheets: {
        "lesson-sheet": {
          id: "lesson-sheet",
          name: "Practice",
          cellData,
          rowCount: Math.max(30, lesson.interactiveTask.initialData.length + 10),
          columnCount: Math.max(
            15,
            (lesson.interactiveTask.initialData[0]?.length ?? 4) + 5
          ),
        },
      },
      sheetOrder: ["lesson-sheet"],
    };
  }, [lessonSlug]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!lessonSlug) {
      console.warn("[FullSpreadsheet] No lesson slug in URL. Persistence disabled.");
    }

    const storageKey = lessonSlug
      ? `univer-workbook-${lessonSlug}`
      : undefined;

    console.log(`[FullSpreadsheet] lessonSlug="${lessonSlug}"`);
    console.log(`[FullSpreadsheet] storageKey="${storageKey}"`);

    // Try loading persisted data
    let workbookData: any = null;
    if (lessonSlug) {
      const saved = loadWorkbookSnapshot(lessonSlug);
      if (saved) {
        console.log(
          `[FullSpreadsheet] Loaded saved snapshot for "${lessonSlug}".`
        );
        workbookData = saved;
      }
    }

    // Fall back to lesson defaults
    if (!workbookData) {
      console.log(
        `[FullSpreadsheet] Using default data for "${lessonSlug ?? "no-slug"}".`
      );
      workbookData = defaultWorkbookData ?? {
        id: "blank",
        name: "Spreadsheet",
        sheets: {
          blank: {
            id: "blank",
            name: "Sheet1",
            cellData: {},
            rowCount: 30,
            columnCount: 15,
          },
        },
        sheetOrder: ["blank"],
      };
    }

    // Create Univer
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
    univerAPI.createWorkbook(workbookData);

    return () => {
      // Save on unmount
      if (lessonSlug && univerAPIRef.current) {
        saveWorkbookSnapshot(lessonSlug, univerAPIRef.current);
        console.log(
          `[FullSpreadsheet] Saved snapshot on unmount for "${lessonSlug}".`
        );
      }
      try {
        univerAPI.dispose();
      } catch {
        // ignore
      }
      univerAPIRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <h1 className="text-sm font-medium text-foreground">
          Full Spreadsheet{lessonSlug ? ` — ${lessonSlug}` : ""}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          ← Back to lesson
        </button>
      </header>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
