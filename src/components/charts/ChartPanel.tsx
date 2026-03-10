import { lazy, Suspense } from "react";
import type { ChartConfig } from "./types";

const ChartRenderer = lazy(() => import("./ChartRenderer"));

interface ChartPanelProps {
  charts: ChartConfig[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

/**
 * Renders all charts for a spreadsheet. Used in both Full and Embedded modes.
 */
export default function ChartPanel({ charts, onRemove, readOnly = false }: ChartPanelProps) {
  if (charts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-3">
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-muted-foreground">Loading charts…</div>}>
        {charts.map((chart) => (
          <ChartRenderer
            key={chart.id}
            config={chart}
            onRemove={onRemove}
            readOnly={readOnly}
          />
        ))}
      </Suspense>
    </div>
  );
}
