import { useState, useMemo, useCallback } from "react";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computePivot, type Aggregation, type PivotResult } from "./pivotUtils";
import type { PivotConfig } from "@/components/tables/types";

interface PivotPanelProps {
  /** Available field names (column headers) */
  fields: string[];
  /** Flat data rows from the source range */
  data: Record<string, string | number>[];
  /** Source range string */
  sourceRange: string;
  /** Initial config to restore */
  initialConfig?: PivotConfig;
  /** Called when pivot config changes */
  onConfigChange?: (config: PivotConfig) => void;
  onClose: () => void;
  readOnly?: boolean;
}

export default function PivotPanel({
  fields,
  data,
  sourceRange,
  initialConfig,
  onConfigChange,
  onClose,
  readOnly = false,
}: PivotPanelProps) {
  const [rowField, setRowField] = useState(initialConfig?.rowField || fields[0] || "");
  const [colField, setColField] = useState(initialConfig?.colField || fields[1] || "");
  const [valueField, setValueField] = useState(initialConfig?.valueField || fields[2] || fields[0] || "");
  const [aggregation, setAggregation] = useState<Aggregation>(initialConfig?.aggregation || "sum");

  const pivotResult = useMemo<PivotResult | null>(() => {
    if (!rowField || !colField || !valueField || data.length === 0) return null;
    try {
      return computePivot(data, rowField, colField, valueField, aggregation);
    } catch {
      return null;
    }
  }, [data, rowField, colField, valueField, aggregation]);

  const notifyChange = useCallback(
    (rf: string, cf: string, vf: string, agg: Aggregation) => {
      onConfigChange?.({
        id: initialConfig?.id || `pivot-${Date.now()}`,
        sourceRange,
        rowField: rf,
        colField: cf,
        valueField: vf,
        aggregation: agg,
      });
    },
    [sourceRange, initialConfig?.id, onConfigChange]
  );

  const handleRowChange = (v: string) => { setRowField(v); notifyChange(v, colField, valueField, aggregation); };
  const handleColChange = (v: string) => { setColField(v); notifyChange(rowField, v, valueField, aggregation); };
  const handleValueChange = (v: string) => { setValueField(v); notifyChange(rowField, colField, v, aggregation); };
  const handleAggChange = (v: Aggregation) => { setAggregation(v); notifyChange(rowField, colField, valueField, v); };

  return (
    <div className="flex flex-col border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Pivot Table</span>
          <span className="text-xs text-muted-foreground">Source: {sourceRange}</span>
        </div>
        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Field selectors */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border text-xs">
          <FieldSelect label="Rows" value={rowField} options={fields} onChange={handleRowChange} />
          <FieldSelect label="Columns" value={colField} options={fields} onChange={handleColChange} />
          <FieldSelect label="Values" value={valueField} options={fields} onChange={handleValueChange} />
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground">Σ</span>
            <select
              value={aggregation}
              onChange={(e) => handleAggChange(e.target.value as Aggregation)}
              className="h-7 px-2 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="sum">Sum</option>
              <option value="count">Count</option>
              <option value="average">Average</option>
            </select>
          </div>
        </div>
      )}

      {/* Pivot table */}
      <div className="overflow-auto" style={{ maxHeight: "350px" }}>
        {pivotResult ? (
          <PivotTable result={pivotResult} rowField={rowField} colField={colField} valueField={valueField} aggregation={aggregation} />
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Select fields to generate the pivot table
          </div>
        )}
      </div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 px-2 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}

function PivotTable({
  result,
  rowField,
  colField,
  valueField,
  aggregation,
}: {
  result: PivotResult;
  rowField: string;
  colField: string;
  valueField: string;
  aggregation: string;
}) {
  const { rowLabels, colLabels, values, rowTotals, colTotals, grandTotal } = result;
  const aggLabel = aggregation === "sum" ? "Sum" : aggregation === "count" ? "Count" : "Avg";

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          <th className="sticky top-0 z-10 px-3 py-2 text-left font-semibold border border-border"
              style={{ backgroundColor: "hsl(215, 55%, 52%)", color: "white" }}>
            {aggLabel} of {valueField}
          </th>
          {colLabels.map((col) => (
            <th
              key={col}
              className="sticky top-0 z-10 px-3 py-2 text-right font-semibold border border-border"
              style={{ backgroundColor: "hsl(215, 55%, 52%)", color: "white" }}
            >
              {col}
            </th>
          ))}
          <th
            className="sticky top-0 z-10 px-3 py-2 text-right font-bold border border-border"
            style={{ backgroundColor: "hsl(215, 40%, 40%)", color: "white" }}
          >
            Grand Total
          </th>
        </tr>
      </thead>
      <tbody>
        {rowLabels.map((row, ri) => (
          <tr key={row}>
            <td
              className="px-3 py-1.5 font-medium border border-border"
              style={{ backgroundColor: ri % 2 === 0 ? "hsl(215, 60%, 95%)" : "white" }}
            >
              {row}
            </td>
            {values[ri].map((val, ci) => (
              <td
                key={ci}
                className="px-3 py-1.5 text-right tabular-nums border border-border"
                style={{ backgroundColor: ri % 2 === 0 ? "hsl(215, 60%, 95%)" : "white" }}
              >
                {val.toLocaleString()}
              </td>
            ))}
            <td
              className="px-3 py-1.5 text-right font-semibold tabular-nums border border-border"
              style={{ backgroundColor: "hsl(215, 30%, 92%)" }}
            >
              {rowTotals[ri].toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td
            className="px-3 py-2 font-bold border border-border"
            style={{ backgroundColor: "hsl(215, 30%, 88%)" }}
          >
            Grand Total
          </td>
          {colTotals.map((total, ci) => (
            <td
              key={ci}
              className="px-3 py-2 text-right font-bold tabular-nums border border-border"
              style={{ backgroundColor: "hsl(215, 30%, 88%)" }}
            >
              {total.toLocaleString()}
            </td>
          ))}
          <td
            className="px-3 py-2 text-right font-bold tabular-nums border border-border"
            style={{ backgroundColor: "hsl(215, 25%, 82%)" }}
          >
            {grandTotal.toLocaleString()}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
