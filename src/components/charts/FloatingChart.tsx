import { useEffect, useRef, useState, useCallback, memo } from "react";
import type { ChartConfig } from "./types";
import { buildEChartsOption } from "./chartUtils";
import { X, GripHorizontal } from "lucide-react";

interface FloatingChartProps {
  config: ChartConfig;
  onUpdate: (id: string, updates: Partial<ChartConfig>) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

const MIN_W = 280;
const MIN_H = 200;

const FloatingChart = memo(({ config, onUpdate, onRemove, readOnly = false }: FloatingChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  // Init / update echarts
  useEffect(() => {
    if (!chartRef.current) return;
    let disposed = false;

    (async () => {
      const echarts = await import("echarts");
      if (disposed || !chartRef.current) return;

      if (echartsRef.current) echartsRef.current.dispose();

      const instance = echarts.init(chartRef.current);
      echartsRef.current = instance;
      instance.setOption(buildEChartsOption(config), true);

      const ro = new ResizeObserver(() => instance.resize());
      ro.observe(chartRef.current);
      return () => ro.disconnect();
    })();

    return () => {
      disposed = true;
      echartsRef.current?.dispose();
      echartsRef.current = null;
    };
  }, [config]);

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: config.x, oy: config.y };
    setDragging(true);
  }, [config.x, config.y, readOnly]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const newX = Math.max(0, dragStart.current.ox + dx);
      const newY = Math.max(0, dragStart.current.oy + dy);
      if (containerRef.current) {
        containerRef.current.style.left = `${newX}px`;
        containerRef.current.style.top = `${newY}px`;
      }
    };
    const onUp = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setDragging(false);
      onUpdate(config.id, {
        x: Math.max(0, dragStart.current.ox + dx),
        y: Math.max(0, dragStart.current.oy + dy),
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, config.id, onUpdate]);

  // Resize handlers
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: config.width, h: config.height };
    setResizing(true);
  }, [config.width, config.height, readOnly]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const dw = e.clientX - resizeStart.current.mx;
      const dh = e.clientY - resizeStart.current.my;
      const newW = Math.max(MIN_W, resizeStart.current.w + dw);
      const newH = Math.max(MIN_H, resizeStart.current.h + dh);
      if (containerRef.current) {
        containerRef.current.style.width = `${newW}px`;
        containerRef.current.style.height = `${newH}px`;
      }
      echartsRef.current?.resize();
    };
    const onUp = (e: MouseEvent) => {
      const dw = e.clientX - resizeStart.current.mx;
      const dh = e.clientY - resizeStart.current.my;
      setResizing(false);
      onUpdate(config.id, {
        width: Math.max(MIN_W, resizeStart.current.w + dw),
        height: Math.max(MIN_H, resizeStart.current.h + dh),
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, config.id, onUpdate]);

  const typeLabel = config.type === "bar" ? "Column" : config.type === "line" ? "Line" : "Pie";

  return (
    <div
      ref={containerRef}
      className="absolute bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden flex flex-col pointer-events-auto"
      style={{
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        cursor: dragging ? "grabbing" : "default",
        userSelect: dragging || resizing ? "none" : "auto",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 bg-muted/60 border-b border-border shrink-0"
        onMouseDown={onDragStart}
        style={{ cursor: readOnly ? "default" : "grab" }}
      >
        {!readOnly && <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        <span className="text-[11px] font-medium text-foreground truncate flex-1">
          {config.title}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {typeLabel} · {config.range}
        </span>
        {!readOnly && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(config.id); }}
            className="ml-1 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Chart area */}
      <div ref={chartRef} className="flex-1 min-h-0" />

      {/* Resize handle */}
      {!readOnly && (
        <div
          onMouseDown={onResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{
            background: "linear-gradient(135deg, transparent 50%, hsl(var(--border)) 50%)",
          }}
        />
      )}
    </div>
  );
});

FloatingChart.displayName = "FloatingChart";
export default FloatingChart;
