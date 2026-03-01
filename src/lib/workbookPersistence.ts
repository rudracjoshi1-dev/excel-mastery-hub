const STORAGE_PREFIX = "univer-workbook-";

/**
 * Get the localStorage key for a lesson's workbook
 */
export function getWorkbookStorageKey(lessonId: string): string {
  return `${STORAGE_PREFIX}${lessonId}`;
}

/**
 * Load a saved workbook snapshot from localStorage.
 * Returns the parsed snapshot or null if not found / corrupted.
 */
export function loadWorkbookSnapshot(lessonId: string): Record<string, any> | null {
  try {
    const key = getWorkbookStorageKey(lessonId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic sanity check — must have sheets property
    if (parsed && typeof parsed === "object" && parsed.sheets) {
      return parsed;
    }
    console.warn(`[workbookPersistence] Corrupted snapshot for "${lessonId}", ignoring.`);
    return null;
  } catch (e) {
    console.warn(`[workbookPersistence] Failed to load snapshot for "${lessonId}":`, e);
    return null;
  }
}

/**
 * Save the current workbook snapshot to localStorage.
 * Uses univerAPI (any-typed since FUniver types are incomplete).
 */
export function saveWorkbookSnapshot(lessonId: string, univerAPI: any): boolean {
  try {
    const workbook = univerAPI.getActiveWorkbook?.();
    if (!workbook) {
      console.warn(`[workbookPersistence] No active workbook to save for "${lessonId}".`);
      return false;
    }
    const snapshot = workbook.save?.() ?? workbook.getSnapshot?.();
    if (!snapshot) {
      console.warn(`[workbookPersistence] getSnapshot() returned null for "${lessonId}".`);
      return false;
    }
    const key = getWorkbookStorageKey(lessonId);
    localStorage.setItem(key, JSON.stringify(snapshot));
    console.log(`[workbookPersistence] Saved snapshot for "${lessonId}" → key="${key}".`);
    return true;
  } catch (e) {
    console.error(`[workbookPersistence] Failed to save snapshot for "${lessonId}":`, e);
    return false;
  }
}

/**
 * Clear a saved workbook snapshot (e.g. on "Reset" action).
 */
export function clearWorkbookSnapshot(lessonId: string): void {
  try {
    localStorage.removeItem(getWorkbookStorageKey(lessonId));
  } catch {
    // ignore
  }
}
