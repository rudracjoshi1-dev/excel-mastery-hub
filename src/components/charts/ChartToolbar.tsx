import { useState } from "react";
import { BarChart3, LineChart, PieChart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChartType } from "./types";

interface ChartToolbarProps {
  selectedRange: string | null;
  onCreateChart: (type: ChartType, title: string) => void;
}

const chartTypes: { type: ChartType; label: string; icon: typeof BarChart3 }[] = [
  { type: "bar", label: "Column", icon: BarChart3 },
  { type: "line", label: "Line", icon: LineChart },
  { type: "pie", label: "Pie", icon: PieChart },
];

export default function ChartToolbar({ selectedRange, onCreateChart }: ChartToolbarProps) {
  const [activeType, setActiveType] = useState<ChartType>("bar");

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
      <span className="text-xs font-semibold text-muted-foreground mr-1">Charts:</span>

      <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-background">
        {chartTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              activeType === type
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
            onCreateChart(activeType, `${activeType === "bar" ? "Column" : activeType === "line" ? "Line" : "Pie"} Chart`);
          }
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Create Chart
      </Button>

      {selectedRange ? (
        <span className="text-xs text-muted-foreground">
          Selected: <code className="bg-muted px-1 rounded">{selectedRange}</code>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground italic">
          Select a data range first (headers in row 1, categories in column A)
        </span>
      )}
    </div>
  );
}
