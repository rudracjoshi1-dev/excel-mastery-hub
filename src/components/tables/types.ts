/** Table configuration persisted alongside workbook snapshots */
export interface TableConfig {
  id: string;
  name: string;
  /** Cell range descriptor e.g. "A1:D10" */
  range: string;
  headers: string[];
}

/** Pivot table configuration */
export interface PivotConfig {
  id: string;
  /** Source range or table name */
  sourceRange: string;
  /** Destination anchor cell e.g. "G2" where pivot output starts */
  destCell: string;
  rowField: string;
  colField: string;
  valueField: string;
  aggregation: "sum" | "count" | "average";
}
