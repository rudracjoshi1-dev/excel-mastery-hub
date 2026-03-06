/**
 * Shared workbook persistence layer using localStorage.
 * Both Embedded and Full spreadsheet views use the same key per lesson,
 * ensuring two-way sync: edits in either view are visible in the other.
 */

const STORAGE_PREFIX = "univer-workbook-";

export function getStorageKey(lessonSlug: string): string {
  return `${STORAGE_PREFIX}${lessonSlug}`;
}

/**
 * Save a 2D cell-data snapshot to localStorage for a given lesson.
 */
export function saveWorkbookSnapshot(
  lessonSlug: string,
  cellData: Record<number, Record<number, { v?: string | number; f?: string }>>,
  rowCount: number,
  columnCount: number
): void {
  try {
    const key = getStorageKey(lessonSlug);
    const payload = JSON.stringify({ cellData, rowCount, columnCount, ts: Date.now() });
    localStorage.setItem(key, payload);
  } catch (e) {
    console.warn("[workbookPersistence] save failed:", e);
  }
}

export interface WorkbookSnapshot {
  cellData: Record<number, Record<number, { v?: string | number; f?: string }>>;
  rowCount: number;
  columnCount: number;
  ts: number;
}

/**
 * Load a previously-saved snapshot, or return null to fall back to defaults.
 */
export function loadWorkbookSnapshot(lessonSlug: string): WorkbookSnapshot | null {
  try {
    const key = getStorageKey(lessonSlug);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as WorkbookSnapshot;
  } catch (e) {
    console.warn("[workbookPersistence] load failed:", e);
    return null;
  }
}

/**
 * Clear persisted data for a lesson (used on Reset).
 */
export function clearWorkbookSnapshot(lessonSlug: string): void {
  try {
    localStorage.removeItem(getStorageKey(lessonSlug));
  } catch (e) {
    console.warn("[workbookPersistence] clear failed:", e);
  }
}
