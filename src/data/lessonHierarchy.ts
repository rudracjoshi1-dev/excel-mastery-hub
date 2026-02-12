/**
 * Lesson hierarchy for the sidebar navigation.
 * SOURCE OF TRUTH for phases, lessons, and sub-lessons.
 *
 * Rules:
 *  - Slugs are derived from titles (kebab-case).
 *  - Sub-lesson URLs: /learn/{lessonSlug}/{sublessonSlug}
 *  - Lesson URLs:     /learn/{lessonSlug}
 *  - Do NOT hard-code specific URLs – build them from slugs.
 */

export interface SubLesson {
  title: string;
  slug: string;
}

export interface Lesson {
  /** Display id like "0.1", "1.2", "4.3" */
  id: string;
  title: string;
  slug: string;
  /** Lucide icon name for sidebar display */
  icon?: string;
  subLessons: SubLesson[];
}

export interface Phase {
  /** Display number: 0–7 */
  number: number;
  title: string;
  /** Hex or tailwind-friendly label colour */
  colorClass: string;
  /** Lucide icon name for sidebar display */
  icon?: string;
  lessons: Lesson[];
}

export const phases: Phase[] = [
  // ── PHASE 0 ──────────────────────────────────
  {
    number: 0,
    title: "Orientation & Absolute Basics",
    colorClass: "text-info",
    icon: "Compass",
    lessons: [
      {
        id: "0.1",
        title: "What Is Excel & How This Site Works",
        slug: "what-is-excel",
        icon: "MousePointerClick",
        subLessons: [
          { title: "Cells, Rows, Columns", slug: "cells-rows-columns" },
          { title: "Cell References (A1, B2)", slug: "cell-references" },
        ],
      },
      {
        id: "0.2",
        title: "Entering Data",
        slug: "entering-data",
        icon: "Keyboard",
        subLessons: [
          { title: "Data Types", slug: "data-types" },
          { title: "Auto-fill Handle", slug: "auto-fill-handle" },
        ],
      },
      {
        id: "0.3",
        title: "Basic Formatting (Visual Only)",
        slug: "basic-formatting",
        icon: "Paintbrush",
        subLessons: [
          { title: "Text Alignment", slug: "text-alignment" },
          { title: "Column Resizing", slug: "column-resizing" },
        ],
      },
    ],
  },

  // ── PHASE 1 ──────────────────────────────────
  {
    number: 1,
    title: "First Formulas (Foundations)",
    colorClass: "text-info",
    icon: "Calculator",
    lessons: [
      {
        id: "1.1",
        title: "What Is a Formula?",
        slug: "what-is-a-formula",
        icon: "FunctionSquare",
        subLessons: [
          { title: "Formula Bar", slug: "formula-bar" },
          { title: "Relative References (Intro)", slug: "relative-references" },
        ],
      },
      {
        id: "1.2",
        title: "SUM",
        slug: "sum",
        icon: "Plus",
        subLessons: [
          { title: "Manual Addition vs SUM", slug: "manual-vs-sum" },
          { title: "Common SUM Mistakes", slug: "common-sum-mistakes" },
        ],
      },
      {
        id: "1.3",
        title: "AVERAGE, MIN, MAX",
        slug: "average-min-max",
        icon: "BarChart3",
        subLessons: [
          { title: "When to Use Each Function", slug: "when-to-use-each" },
          { title: "Practice Scenarios", slug: "practice-scenarios" },
        ],
      },
      {
        id: "1.4",
        title: "COUNT & COUNTA",
        slug: "count-counta",
        icon: "Hash",
        subLessons: [
          { title: "COUNT vs COUNTA", slug: "count-vs-counta" },
        ],
      },
    ],
  },

  // ── PHASE 2 ──────────────────────────────────
  {
    number: 2,
    title: "Logical Thinking",
    colorClass: "text-info",
    icon: "GitBranch",
    lessons: [
      {
        id: "2.1",
        title: "IF",
        slug: "if",
        icon: "HelpCircle",
        subLessons: [
          { title: "IF Syntax", slug: "if-syntax" },
          { title: "Common Logic Mistakes", slug: "common-logic-mistakes" },
        ],
      },
      {
        id: "2.2",
        title: "AND / OR",
        slug: "and-or",
        icon: "ToggleLeft",
        subLessons: [
          { title: "AND vs OR Logic Tables", slug: "and-vs-or-tables" },
        ],
      },
      {
        id: "2.3",
        title: "Nested IF (Exploded)",
        slug: "nested-if",
        icon: "Layers",
        subLessons: [
          { title: "When Nesting Becomes Bad", slug: "when-nesting-bad" },
          { title: "Debugging Nested IFs", slug: "debugging-nested-ifs" },
        ],
      },
      {
        id: "2.4",
        title: "IFERROR & SWITCH",
        slug: "iferror-switch",
        icon: "ShieldAlert",
        subLessons: [
          { title: "Error Types", slug: "error-types" },
          { title: "SWITCH vs Nested IF", slug: "switch-vs-nested-if" },
        ],
      },
    ],
  },

  // ── PHASE 3 ──────────────────────────────────
  {
    number: 3,
    title: "Conditional Maths",
    colorClass: "text-info",
    icon: "Sigma",
    lessons: [
      {
        id: "3.1",
        title: "SUMIF",
        slug: "sumif",
        icon: "Filter",
        subLessons: [
          { title: "Criteria Syntax", slug: "criteria-syntax" },
        ],
      },
      {
        id: "3.2",
        title: "SUMIFS",
        slug: "sumifs",
        icon: "ListFilter",
        subLessons: [
          { title: "Order of Arguments", slug: "order-of-arguments" },
        ],
      },
      {
        id: "3.3",
        title: "COUNTIF / COUNTIFS",
        slug: "countif-countifs",
        icon: "ListChecks",
        subLessons: [
          { title: "Wildcards", slug: "wildcards" },
        ],
      },
    ],
  },

  // ── PHASE 4 ──────────────────────────────────
  {
    number: 4,
    title: "Lookup & Reference Power",
    colorClass: "text-info",
    icon: "Search",
    lessons: [
      {
        id: "4.1",
        title: "VLOOKUP (Legacy)",
        slug: "vlookup",
        icon: "SearchCode",
        subLessons: [
          { title: "Exact vs Approximate", slug: "exact-vs-approximate" },
          { title: "VLOOKUP Limitations", slug: "vlookup-limitations" },
        ],
      },
      {
        id: "4.2",
        title: "XLOOKUP",
        slug: "xlookup",
        icon: "SearchCheck",
        subLessons: [
          { title: "Why XLOOKUP Wins", slug: "why-xlookup-wins" },
          { title: "Error Handling in XLOOKUP", slug: "xlookup-error-handling" },
        ],
      },
      {
        id: "4.3",
        title: "INDEX + MATCH",
        slug: "index-match",
        icon: "Crosshair",
        subLessons: [
          { title: "MATCH Types", slug: "match-types" },
          { title: "Two-Direction Lookup", slug: "two-direction-lookup" },
        ],
      },
    ],
  },

  // ── PHASE 5 ──────────────────────────────────
  {
    number: 5,
    title: "Text, Dates & Cleanup",
    colorClass: "text-info",
    icon: "Type",
    lessons: [
      {
        id: "5.1",
        title: "LEFT / RIGHT / MID",
        slug: "left-right-mid",
        icon: "Scissors",
        subLessons: [
          { title: "Extracting Substrings", slug: "extracting-substrings" },
        ],
      },
      {
        id: "5.2",
        title: "LEN / TRIM",
        slug: "len-trim",
        icon: "Eraser",
        subLessons: [
          { title: "Cleaning Whitespace", slug: "cleaning-whitespace" },
        ],
      },
      {
        id: "5.3",
        title: "CONCAT / TEXTJOIN",
        slug: "concat-textjoin",
        icon: "Link",
        subLessons: [
          { title: "Joining with Delimiters", slug: "joining-with-delimiters" },
        ],
      },
      {
        id: "5.4",
        title: "TODAY / NOW / DATEDIF",
        slug: "today-now-datedif",
        icon: "Calendar",
        subLessons: [
          { title: "Date Calculations", slug: "date-calculations" },
        ],
      },
    ],
  },

  // ── PHASE 6 ──────────────────────────────────
  {
    number: 6,
    title: "Sheet Features",
    colorClass: "text-destructive",
    icon: "Table2",
    lessons: [
      {
        id: "6.1",
        title: "Filters",
        slug: "filters",
        icon: "SlidersHorizontal",
        subLessons: [
          { title: "Applying Filters", slug: "applying-filters" },
          { title: "Advanced Filter Options", slug: "advanced-filter-options" },
        ],
      },
      {
        id: "6.2",
        title: "Tables",
        slug: "tables",
        icon: "Table",
        subLessons: [
          { title: "Converting Ranges to Tables", slug: "converting-ranges" },
          { title: "Dynamic Table Rows", slug: "dynamic-table-rows" },
        ],
      },
      {
        id: "6.3",
        title: "Conditional Formatting",
        slug: "conditional-formatting",
        icon: "Palette",
        subLessons: [
          { title: "Heatmaps", slug: "heatmaps" },
          { title: "Rules-Based Highlights", slug: "rules-based-highlights" },
        ],
      },
      {
        id: "6.4",
        title: "Data Validation",
        slug: "data-validation",
        icon: "CheckSquare",
        subLessons: [
          { title: "Dropdowns", slug: "dropdowns" },
          { title: "Input Rules", slug: "input-rules" },
        ],
      },
    ],
  },

  // ── PHASE 7 ──────────────────────────────────
  {
    number: 7,
    title: "Analysis & Reporting",
    colorClass: "text-destructive",
    icon: "PieChart",
    lessons: [
      {
        id: "7.1",
        title: "Pivot Tables",
        slug: "pivot-tables",
        icon: "TableProperties",
        subLessons: [
          { title: "Building a Pivot Table", slug: "building-pivot-table" },
          { title: "Pivot Table Challenges", slug: "pivot-table-challenges" },
        ],
      },
      {
        id: "7.2",
        title: "Charts",
        slug: "charts",
        icon: "LineChart",
        subLessons: [
          { title: "Chart Types & When to Use", slug: "chart-types" },
          { title: "Guided Chart Challenge", slug: "guided-chart-challenge" },
        ],
      },
      {
        id: "7.3",
        title: "Dashboards (Mini)",
        slug: "dashboards",
        icon: "LayoutDashboard",
        subLessons: [
          { title: "Dashboard Layout", slug: "dashboard-layout" },
          { title: "Dashboard Challenge", slug: "dashboard-challenge" },
        ],
      },
    ],
  },
];

/** Helper to build a lesson URL */
export function lessonUrl(lessonSlug: string): string {
  return `/learn/${lessonSlug}`;
}

/** Helper to build a sub-lesson URL */
export function subLessonUrl(lessonSlug: string, subLessonSlug: string): string {
  return `/learn/${lessonSlug}/${subLessonSlug}`;
}

/** Flat list of all lessons across all phases */
export function getAllHierarchyLessons() {
  return phases.flatMap((phase) => phase.lessons);
}
