/**
 * Bulk lesson registry — auto-generated from lessonHierarchy.ts
 *
 * Every lesson AND sub-lesson gets an entry with metadata that drives:
 *   - Embedded vs Full-only rendering
 *   - Phase-based plugin gating in FullSpreadsheet
 *   - "Open Full Mode" button visibility
 *   - Placeholder content for lessons not yet written
 *
 * Content authors: fill in the `content` field per-entry when ready.
 */

import { phases } from "./lessonHierarchy";

// ── Types ─────────────────────────────────────────────────────────

export interface LessonMeta {
  /** Unique slug used in URL, e.g. "what-is-excel" or "cells-rows-columns" */
  slug: string;
  /** Parent lesson slug (null for top-level lessons) */
  parentSlug: string | null;
  /** Full URL path segment, e.g. "what-is-excel/cells-rows-columns" */
  fullPath: string;
  /** Display id like "0.1", "0.1.1" */
  displayId: string;
  /** Lesson title */
  title: string;
  /** Phase number 0–7 */
  phase: number;
  /** Rendering mode */
  mode: "embedded" | "fullOnly";
  /** Whether the "Open Full Spreadsheet" button should appear */
  showFullModeButton: boolean;
  /** Category derived from phase title */
  category: string;
  /** Difficulty derived from phase number */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Estimated duration placeholder */
  duration: string;
  /** Whether full lesson content has been written */
  hasContent: boolean;
  /** Navigation helpers */
  prevSlug: string | null;
  nextSlug: string | null;
}

// ── Build the registry ────────────────────────────────────────────

function getDifficulty(phase: number): "beginner" | "intermediate" | "advanced" {
  if (phase <= 2) return "beginner";
  if (phase <= 5) return "intermediate";
  return "advanced";
}

function getDuration(phase: number): string {
  if (phase <= 1) return "10–15 min";
  if (phase <= 3) return "15–20 min";
  if (phase <= 5) return "15–25 min";
  return "20–30 min";
}

function buildRegistry(): LessonMeta[] {
  const entries: LessonMeta[] = [];

  for (const phase of phases) {
    for (const lesson of phase.lessons) {
      // Parent lesson entry
      entries.push({
        slug: lesson.slug,
        parentSlug: null,
        fullPath: lesson.slug,
        displayId: lesson.id,
        title: lesson.title,
        phase: phase.number,
        mode: "embedded",
        showFullModeButton: phase.number >= 6,
        category: phase.title,
        difficulty: getDifficulty(phase.number),
        duration: getDuration(phase.number),
        hasContent: false,
        prevSlug: null, // filled below
        nextSlug: null, // filled below
      });

      // Sub-lesson entries
      for (let si = 0; si < lesson.subLessons.length; si++) {
        const sub = lesson.subLessons[si];
        const subIndex = si + 1;
        entries.push({
          slug: sub.slug,
          parentSlug: lesson.slug,
          fullPath: `${lesson.slug}/${sub.slug}`,
          displayId: `${lesson.id}.${subIndex}`,
          title: sub.title,
          phase: phase.number,
          mode: "embedded",
          showFullModeButton: phase.number >= 6,
          category: phase.title,
          difficulty: getDifficulty(phase.number),
          duration: getDuration(phase.number),
          hasContent: false,
          prevSlug: null,
          nextSlug: null,
        });
      }
    }
  }

  // Wire up prev/next navigation across ALL entries (flat order)
  for (let i = 0; i < entries.length; i++) {
    entries[i].prevSlug = i > 0 ? entries[i - 1].fullPath : null;
    entries[i].nextSlug = i < entries.length - 1 ? entries[i + 1].fullPath : null;
  }

  return entries;
}

export const allLessons: LessonMeta[] = buildRegistry();

// ── Lookup helpers ────────────────────────────────────────────────

/** Find a top-level lesson by slug */
export function getLessonMeta(slug: string): LessonMeta | undefined {
  return allLessons.find((l) => l.slug === slug && l.parentSlug === null);
}

/** Find a sub-lesson by parent + sub slug */
export function getSubLessonMeta(
  parentSlug: string,
  subSlug: string
): LessonMeta | undefined {
  return allLessons.find(
    (l) => l.parentSlug === parentSlug && l.slug === subSlug
  );
}

/** Find any lesson by its fullPath */
export function getLessonByPath(fullPath: string): LessonMeta | undefined {
  return allLessons.find((l) => l.fullPath === fullPath);
}

/** Get all lessons for a given phase */
export function getLessonsByPhase(phase: number): LessonMeta[] {
  return allLessons.filter((l) => l.phase === phase);
}

/** Total count */
export const TOTAL_LESSONS = allLessons.length;

/** Check if a lesson should load heavy plugins in Full Mode */
export function shouldLoadHeavyPlugins(phase: number): boolean {
  return phase >= 6;
}
