import { useEffect, useRef, useMemo, useState, useCallback, lazy, Suspense } from "react";
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

// Chart system
import type { ChartConfig, ChartType } from "@/components/charts/types";
import { getSelectedRange, readChartData, generateChartId } from "@/components/charts/chartUtils";
import ChartPanel from "@/components/charts/ChartPanel";

// Table system
import type { TableConfig, PivotConfig } from "@/components/tables/types";
import { createTable, restoreTableStyling, readTableData, readFieldHeaders } from "@/components/tables/tableUtils";

// Data toolbar (combined)
import DataToolbar from "@/components/DataToolbar";

// Pivot table (lazy loaded)
const PivotPanel = lazy(() => import("@/components/pivot/PivotPanel"));

export default function FullSpreadsheet() {
  const [searchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const containerRef = useRef<HTMLDivElement>(null);
  const univerAPIRef = useRef<FUniver | null>(null);
  const isInitializedRef = useRef(false);
  const dimensionsRef = useRef({ rowCount: 50, columnCount: 26 });

  // Chart state
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const chartsRef = useRef<ChartConfig[]>([]);
  chartsRef.current = charts;

  // Table state
  const [tables, setTables] = useState<TableConfig[]>([]);
  const tablesRef = useRef<TableConfig[]>([]);
  tablesRef.current = tables;

  // Pivot state
  const [pivots, setPivots] = useState<PivotConfig[]>([]);
  const pivotsRef = useRef<PivotConfig[]>([]);
  pivotsRef.current = pivots;
  const [pivotData, setPivotData] = useState<Record<string, string | number>[] | null>(null);
  const [pivotFields, setPivotFields] = useState<string[]>([]);
  const [pivotSourceRange, setPivotSourceRange] = useState<string>("");
  const [showPivot, setShowPivot] = useState(false);

  const lessonMeta = useMemo(() => {
    if (!lessonSlug) return null;
    return getLessonByPath(lessonSlug) ?? null;
  }, [lessonSlug]);

  const phase = lessonMeta?.phase ?? 0;
  const showDataTools = shouldLoadHeavyPlugins(phase);

  const lessonData = useMemo(() => {
    if (!lessonSlug) return null;
    return lessons.find((l) => l.slug === lessonSlug) ?? null;
  }, [lessonSlug]);

  const defaultPlaceholderData = [
    ["Column A", "Column B", "Column C", "Column D"],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ];

  const workbookData = useMemo(() => {
    const defaultInitialData = lessonData?.interactiveTask?.initialData ?? defaultPlaceholderData;
    let cellData: Record<number, Record<number, { v?: string | number; f?: string }>> =
      arrayToCellData(defaultInitialData);
    let rowCount = Math.max(50, defaultInitialData.length + 10);
    let columnCount = Math.max(26, (defaultInitialData[0]?.length ?? 0) + 5);

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

  // Helper: save current state
  const saveState = useCallback(() => {
    if (!lessonSlug || !univerAPIRef.current) return;
    const { rowCount, columnCount } = dimensionsRef.current;
    const extracted = extractCellDataFromAPI(univerAPIRef.current, rowCount, columnCount);
    if (!extracted) return;

    let cfRules: any[] = [];
    try {
      const workbook = univerAPIRef.current.getActiveWorkbook();
      const sheet = workbook?.getActiveSheet();
      if (sheet && typeof (sheet as any).getConditionalFormattingRules === "function") {
        cfRules = (sheet as any).getConditionalFormattingRules() ?? [];
      }
    } catch { /* CF plugin may not be loaded */ }

    saveWorkbookSnapshot(lessonSlug, extracted, rowCount, columnCount, cfRules, chartsRef.current, tablesRef.current, pivotsRef.current);
  }, [lessonSlug]);

  // Refresh chart data from the live spreadsheet
  const refreshChartData = useCallback(() => {
    if (!univerAPIRef.current) return;
    const api = univerAPIRef.current;
    setCharts((prev) => {
      const updated = prev.map((chart) => {
        const data = readChartData(api, chart.range);
        if (data) return { ...chart, categories: data.categories, series: data.series };
        return chart;
      });
      chartsRef.current = updated;
      return updated;
    });
  }, []);

  // Refresh pivot data when spreadsheet changes
  const refreshPivotData = useCallback(() => {
    if (!univerAPIRef.current || !showPivot || !pivotSourceRange) return;
    const data = readTableData(univerAPIRef.current, pivotSourceRange);
    if (data) setPivotData(data);
  }, [showPivot, pivotSourceRange]);

  // Create chart handler
  const handleCreateChart = useCallback(
    (type: ChartType, title: string) => {
      if (!univerAPIRef.current || !selectedRange) return;
      const data = readChartData(univerAPIRef.current, selectedRange);
      if (!data) return;

      const newChart: ChartConfig = {
        id: generateChartId(),
        type,
        title,
        range: selectedRange,
        categories: data.categories,
        series: data.series,
      };

      setCharts((prev) => {
        const next = [...prev, newChart];
        chartsRef.current = next;
        return next;
      });

      setTimeout(() => saveState(), 50);
    },
    [selectedRange, saveState]
  );

  const handleRemoveChart = useCallback(
    (id: string) => {
      setCharts((prev) => {
        const next = prev.filter((c) => c.id !== id);
        chartsRef.current = next;
        return next;
      });
      setTimeout(() => saveState(), 50);
    },
    [saveState]
  );

  // Create table handler
  const handleCreateTable = useCallback(() => {
    if (!univerAPIRef.current || !selectedRange) return;
    const table = createTable(univerAPIRef.current, selectedRange);
    if (!table) return;

    setTables((prev) => {
      const next = [...prev, table];
      tablesRef.current = next;
      return next;
    });

    setTimeout(() => saveState(), 50);
  }, [selectedRange, saveState]);

  // Create pivot handler
  const handleCreatePivot = useCallback(() => {
    if (!univerAPIRef.current || !selectedRange) return;

    const data = readTableData(univerAPIRef.current, selectedRange);
    const fields = readFieldHeaders(univerAPIRef.current, selectedRange);
    if (!data || !fields || fields.length < 2) return;

    setPivotData(data);
    setPivotFields(fields);
    setPivotSourceRange(selectedRange);
    setShowPivot(true);

    // Create initial pivot config
    const config: PivotConfig = {
      id: `pivot-${Date.now()}`,
      sourceRange: selectedRange,
      rowField: fields[0],
      colField: fields[1],
      valueField: fields[2] || fields[0],
      aggregation: "sum",
    };
    setPivots([config]);
    pivotsRef.current = [config];

    setTimeout(() => saveState(), 50);
  }, [selectedRange, saveState]);

  const handlePivotConfigChange = useCallback(
    (config: PivotConfig) => {
      setPivots([config]);
      pivotsRef.current = [config];
      setTimeout(() => saveState(), 50);
    },
    [saveState]
  );

  const handleClosePivot = useCallback(() => {
    setShowPivot(false);
    setPivots([]);
    pivotsRef.current = [];
    setTimeout(() => saveState(), 50);
  }, [saveState]);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const container = containerRef.current;

    // Load persisted charts, tables, pivots
    if (lessonSlug) {
      const snapshot = loadWorkbookSnapshot(lessonSlug);
      if (snapshot?.charts && snapshot.charts.length > 0) {
        setCharts(snapshot.charts);
        chartsRef.current = snapshot.charts;
      }
      if (snapshot?.tables && snapshot.tables.length > 0) {
        setTables(snapshot.tables);
        tablesRef.current = snapshot.tables;
      }
      if (snapshot?.pivots && snapshot.pivots.length > 0) {
        setPivots(snapshot.pivots);
        pivotsRef.current = snapshot.pivots;
      }
    }

    async function init() {
      const presets: any[] = [UniverSheetsCorePreset({ container })];
      const localesToMerge: Record<string, any>[] = [UniverPresetSheetsCoreEnUS, SheetsSortUIEnUS];

      if (shouldLoadHeavyPlugins(phase)) {
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

      // Restore CF rules
      if (lessonSlug) {
        const snapshot = loadWorkbookSnapshot(lessonSlug);
        if (snapshot?.cfRules && snapshot.cfRules.length > 0) {
          try {
            const workbook = univerAPI.getActiveWorkbook();
            const sheet = workbook?.getActiveSheet();
            if (sheet && typeof (sheet as any).addConditionalFormattingRule === "function") {
              for (const rule of snapshot.cfRules) {
                (sheet as any).addConditionalFormattingRule(rule);
              }
            }
          } catch (e) {
            console.warn("[FullSpreadsheet] failed to restore CF rules:", e);
          }
        }

        // Restore table styling
        if (snapshot?.tables && snapshot.tables.length > 0) {
          setTimeout(() => restoreTableStyling(univerAPI, snapshot.tables!), 100);
        }

        // Restore pivot from persisted config
        if (snapshot?.pivots && snapshot.pivots.length > 0) {
          const pc = snapshot.pivots[0];
          const data = readTableData(univerAPI, pc.sourceRange);
          const fields = readFieldHeaders(univerAPI, pc.sourceRange);
          if (data && fields) {
            setPivotData(data);
            setPivotFields(fields);
            setPivotSourceRange(pc.sourceRange);
            setShowPivot(true);
          }
        }
      }

      // Track selection changes
      if (showDataTools) {
        try {
          const workbook = univerAPI.getActiveWorkbook();
          if (workbook) {
            workbook.onSelectionChange(() => {
              const range = getSelectedRange(univerAPI);
              setSelectedRange(range);
            });
          }
        } catch { /* selection tracking optional */ }

        // Listen for cell edits to refresh charts and pivots
        try {
          const sheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
          if (sheet && typeof (sheet as any).onValueChange === "function") {
            (sheet as any).onValueChange(() => {
              refreshChartData();
              refreshPivotData();
            });
          }
        } catch { /* cell change tracking optional */ }
      }

      // Refresh chart data with live values after init
      if (showDataTools && chartsRef.current.length > 0) {
        setTimeout(() => refreshChartData(), 200);
      }
    }

    init();

    const handleBeforeUnload = () => saveState();

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveState();
      univerAPIRef.current?.dispose();
      isInitializedRef.current = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header bar */}
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

      {/* Data Tools toolbar (phase 6-7 only) */}
      {showDataTools && (
        <DataToolbar
          selectedRange={selectedRange}
          onCreateChart={handleCreateChart}
          onCreateTable={handleCreateTable}
          onCreatePivot={handleCreatePivot}
          hasActivePivot={showPivot}
        />
      )}

      {/* Spreadsheet container */}
      <div ref={containerRef} className="flex-1 min-h-0" style={{ minHeight: "40vh" }} />

      {/* Charts area */}
      {showDataTools && charts.length > 0 && (
        <div className="border-t border-border overflow-auto" style={{ maxHeight: "45vh" }}>
          <ChartPanel charts={charts} onRemove={handleRemoveChart} />
        </div>
      )}

      {/* Pivot table area */}
      {showDataTools && showPivot && pivotData && pivotFields.length > 0 && (
        <Suspense
          fallback={
            <div className="border-t border-border p-4 text-sm text-muted-foreground">
              Loading pivot table…
            </div>
          }
        >
          <PivotPanel
            fields={pivotFields}
            data={pivotData}
            sourceRange={pivotSourceRange}
            initialConfig={pivots[0]}
            onConfigChange={handlePivotConfigChange}
            onClose={handleClosePivot}
          />
        </Suspense>
      )}
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
