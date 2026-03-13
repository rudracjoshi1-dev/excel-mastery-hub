/** Chart configuration persisted alongside workbook snapshots */
export type ChartType = "bar" | "line" | "pie";

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  /** Cell range descriptor e.g. "A1:D5" */
  range: string;
  /** Cached data snapshot for rendering in embedded mode */
  categories: string[];
  series: { name: string; data: number[] }[];
  /** Floating position inside the spreadsheet container (pixels) */
  x: number;
  y: number;
  width: number;
  height: number;
}
