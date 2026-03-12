import { useState } from "react";
import {
  BarChart3,
  LineChart,
  PieChart,
  Plus,
  TableProperties,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChartType } from "@/components/charts/types";

interface DataToolbarProps {
  selectedRange: string | null;
  onCreateChart: (type: ChartType, title: string) => void;
  onCreateTable: () => void;
  onCreatePivot: () => void;
  hasActivePivot?: boolean;
}

const chartTypes: { type: ChartType; label: string; icon: typeof BarChart3 }[] = [
  { type: "bar", label: "Column", icon: BarChart3 },
  { type: "line", label: "Line", icon: LineChart },
  { type: "pie", label: "Pie", icon: PieChart },
];

export default function DataToolbar({
  selectedRange,
  onCreateChart,
  onCreateTable,
  onCreatePivot,
  hasActivePivot,
}: DataToolbarProps) {
  const [activeChartType, setActiveChartType] = useState<ChartType>("bar");

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border flex-wrap">
      {/* Data Tools Section */}
      <span className="text-xs font-semibold text-muted-foreground">Data Tools:</span>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs h-7"
        disabled={!selectedRange}
        onClick={onCreateTable}
      >
        <TableProperties className="h-3.5 w-3.5" />
        Create Table
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs h-7"
        disabled={!selectedRange}
        onClick={onCreatePivot}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        {hasActivePivot ? "Update Pivot" : "Create Pivot Table"}
      </Button>

      {/* Divider */}
      <div className="h-5 w-px bg-border mx-1" />

      {/* Charts Section */}
      <span className="text-xs font-semibold text-muted-foreground">Charts:</span>

      <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-background">
        {chartTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveChartType(type)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              activeChartType === type
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <Button
        size="sm"
        variant="default"
        className="gap-1.5 text-xs h-7"
        disabled={!selectedRange}
        onClick={() => {
          if (selectedRange) {
            const label = activeChartType === "bar" ? "Column" : activeChartType === "line" ? "Line" : "Pie";
            onCreateChart(activeChartType, `${label} Chart`);
          }
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Create Chart
      </Button>

      {/* Range indicator */}
      {selectedRange ? (
        <span className="text-xs text-muted-foreground ml-auto">
          Selected: <code className="bg-muted px-1 rounded">{selectedRange}</code>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground italic ml-auto">
          Select a data range to use data tools
        </span>
      )}
    </div>
  );
}
