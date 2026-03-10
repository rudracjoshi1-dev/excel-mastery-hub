import { useEffect, useRef, memo } from "react";
import type { ChartConfig } from "./types";
import { buildEChartsOption } from "./chartUtils";

interface ChartRendererProps {
  config: ChartConfig;
  height?: number;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

/**
 * Renders a single ECharts chart from a ChartConfig.
 * Dynamically imports echarts to keep it out of the main bundle.
 */
const ChartRenderer = memo(({ config, height = 320, onRemove, readOnly = false }: ChartRendererProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    let disposed = false;

    (async () => {
      const echarts = await import("echarts");
      if (disposed || !chartRef.current) return;

      if (echartsInstanceRef.current) {
        echartsInstanceRef.current.dispose();
      }

      const instance = echarts.init(chartRef.current);
      echartsInstanceRef.current = instance;

      const option = buildEChartsOption(config);
      instance.setOption(option, true);

      const resizeObserver = new ResizeObserver(() => {
        instance.resize();
      });
      resizeObserver.observe(chartRef.current);

      return () => resizeObserver.disconnect();
    })();

    return () => {
      disposed = true;
      echartsInstanceRef.current?.dispose();
      echartsInstanceRef.current = null;
    };
  }, [config]);

  return (
    <div className="relative border border-border rounded-lg bg-card overflow-hidden">
      {!readOnly && onRemove && (
        <button
          onClick={() => onRemove(config.id)}
          className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          ✕ Remove
        </button>
      )}
      <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/30">
        {config.type === "bar" ? "Column" : config.type === "line" ? "Line" : "Pie"} Chart · Range: {config.range}
      </div>
      <div ref={chartRef} style={{ width: "100%", height }} />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";
export default ChartRenderer;
