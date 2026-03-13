import { useState, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Aggregation } from "./pivotUtils";
import type { PivotConfig } from "@/components/tables/types";

interface PivotConfigPanelProps {
  /** Available field names (column headers) */
  fields: string[];
  /** Source range string */
  sourceRange: string;
  /** Initial config to restore */
  initialConfig?: PivotConfig;
  /** Called when pivot config changes */
  onConfigChange?: (config: PivotConfig) => void;
  onClose: () => void;
}

/**
 * Compact configuration panel for pivot tables.
 * Results are written directly into spreadsheet cells, not rendered here.
 */
export default function PivotPanel({
  fields,
  sourceRange,
  initialConfig,
  onConfigChange,
  onClose,
}: PivotConfigPanelProps) {
  const [rowField, setRowField] = useState(initialConfig?.rowField || fields[0] || "");
  const [colField, setColField] = useState(initialConfig?.colField || fields[1] || "");
  const [valueField, setValueField] = useState(initialConfig?.valueField || fields[2] || fields[0] || "");
  const [aggregation, setAggregation] = useState<Aggregation>(initialConfig?.aggregation || "sum");
  const [destCell, setDestCell] = useState(initialConfig?.destCell || "G2");

  const notifyChange = useCallback(
    (rf: string, cf: string, vf: string, agg: Aggregation, dest: string) => {
      onConfigChange?.({
        id: initialConfig?.id || `pivot-${Date.now()}`,
        sourceRange,
        destCell: dest,
        rowField: rf,
        colField: cf,
        valueField: vf,
        aggregation: agg,
      });
    },
    [sourceRange, initialConfig?.id, onConfigChange]
  );

  const handleRowChange = (v: string) => { setRowField(v); notifyChange(v, colField, valueField, aggregation, destCell); };
  const handleColChange = (v: string) => { setColField(v); notifyChange(rowField, v, valueField, aggregation, destCell); };
  const handleValueChange = (v: string) => { setValueField(v); notifyChange(rowField, colField, v, aggregation, destCell); };
  const handleAggChange = (v: Aggregation) => { setAggregation(v); notifyChange(rowField, colField, valueField, v, destCell); };
  const handleDestChange = (v: string) => { setDestCell(v); notifyChange(rowField, colField, valueField, aggregation, v); };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border flex-wrap text-xs">
      <span className="font-semibold text-muted-foreground">Pivot Table</span>
      <span className="text-muted-foreground">Source: <code className="bg-muted px-1 rounded">{sourceRange}</code></span>

      <div className="h-4 w-px bg-border" />

      <FieldSelect label="Rows" value={rowField} options={fields} onChange={handleRowChange} />
      <FieldSelect label="Columns" value={colField} options={fields} onChange={handleColChange} />
      <FieldSelect label="Values" value={valueField} options={fields} onChange={handleValueChange} />

      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">Σ</span>
        <select
          value={aggregation}
          onChange={(e) => handleAggChange(e.target.value as Aggregation)}
          className="h-6 px-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="sum">Sum</option>
          <option value="count">Count</option>
          <option value="average">Average</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="font-medium text-muted-foreground">Dest:</span>
        <input
          value={destCell}
          onChange={(e) => handleDestChange(e.target.value.toUpperCase())}
          className="h-6 w-14 px-1.5 rounded border border-border bg-background text-xs text-center uppercase focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="G2"
        />
      </div>

      <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 ml-auto">
        <X className="h-3.5 w-3.5" />
      </Button>
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
    <div className="flex items-center gap-1">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 px-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  );
}
