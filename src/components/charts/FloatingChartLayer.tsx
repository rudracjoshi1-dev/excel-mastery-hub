import { lazy, Suspense } from "react";
import type { ChartConfig } from "./types";

const FloatingChart = lazy(() => import("./FloatingChart"));

interface FloatingChartLayerProps {
  charts: ChartConfig[];
  onUpdate?: (id: string, updates: Partial<ChartConfig>) => void;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

/**
 * Overlay layer that renders all floating charts on top of the spreadsheet.
 * Must be inside a position:relative container.
 */
export default function FloatingChartLayer({
  charts,
  onUpdate,
  onRemove,
  readOnly = false,
}: FloatingChartLayerProps) {
  if (charts.length === 0) return null;

  const noop = () => {};

  return (
    <Suspense fallback={null}>
      {charts.map((chart) => (
        <FloatingChart
          key={chart.id}
          config={chart}
          onUpdate={onUpdate ?? noop}
          onRemove={onRemove ?? noop}
          readOnly={readOnly}
        />
      ))}
    </Suspense>
  );
}
