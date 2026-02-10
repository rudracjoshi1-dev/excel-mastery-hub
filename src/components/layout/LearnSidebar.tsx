import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Circle, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  phases,
  lessonUrl,
  subLessonUrl,
  type Phase,
  type Lesson,
} from "@/data/lessonHierarchy";

// ─── Persist expanded state across navigations ────────────────────
const STORAGE_KEY = "learn-sidebar-state";

interface SidebarState {
  expandedPhases: number[];
  expandedLessons: string[]; // lesson slugs
}

function loadState(): SidebarState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { expandedPhases: [0], expandedLessons: [] };
}

function saveState(state: SidebarState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Component ────────────────────────────────────────────────────
export function LearnSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const [collapsed, setCollapsed] = useState(false);
  const [state, setState] = useState<SidebarState>(loadState);

  // Auto-expand the phase/lesson containing the current route
  useEffect(() => {
    for (const phase of phases) {
      for (const lesson of phase.lessons) {
        if (
          pathname === lessonUrl(lesson.slug) ||
          pathname.startsWith(lessonUrl(lesson.slug) + "/")
        ) {
          setState((prev) => {
            const ep = prev.expandedPhases.includes(phase.number)
              ? prev.expandedPhases
              : [...prev.expandedPhases, phase.number];
            const el = prev.expandedLessons.includes(lesson.slug)
              ? prev.expandedLessons
              : [...prev.expandedLessons, lesson.slug];
            return { expandedPhases: ep, expandedLessons: el };
          });
          return;
        }
      }
    }
  }, [pathname]);

  // Persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const togglePhase = (n: number) =>
    setState((prev) => ({
      ...prev,
      expandedPhases: prev.expandedPhases.includes(n)
        ? prev.expandedPhases.filter((x) => x !== n)
        : [...prev.expandedPhases, n],
    }));

  const toggleLesson = (slug: string) =>
    setState((prev) => ({
      ...prev,
      expandedLessons: prev.expandedLessons.includes(slug)
        ? prev.expandedLessons.filter((x) => x !== slug)
        : [...prev.expandedLessons, slug],
    }));

  const isLessonActive = (lesson: Lesson) =>
    pathname === lessonUrl(lesson.slug) ||
    pathname.startsWith(lessonUrl(lesson.slug) + "/");

  const isSubLessonActive = (lesson: Lesson, subSlug: string) =>
    pathname === subLessonUrl(lesson.slug, subSlug);

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col items-center w-12 border-r border-sidebar-border bg-sidebar-background py-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        {/* Phase number pills */}
        {phases.map((phase) => (
          <button
            key={phase.number}
            onClick={() => {
              setCollapsed(false);
              togglePhase(phase.number);
            }}
            className={cn(
              "w-7 h-7 rounded-md text-xs font-bold mb-1 transition-colors",
              "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            title={`Phase ${phase.number}: ${phase.title}`}
          >
            {phase.number}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-sidebar-border bg-sidebar-background shrink-0">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <span className="text-sm font-semibold text-sidebar-foreground">Course Outline</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1" aria-label="Course navigation">
          {phases.map((phase) => (
            <PhaseGroup
              key={phase.number}
              phase={phase}
              expanded={state.expandedPhases.includes(phase.number)}
              expandedLessons={state.expandedLessons}
              onTogglePhase={togglePhase}
              onToggleLesson={toggleLesson}
              isLessonActive={isLessonActive}
              isSubLessonActive={isSubLessonActive}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

// ─── Phase group ──────────────────────────────────────────────────
interface PhaseGroupProps {
  phase: Phase;
  expanded: boolean;
  expandedLessons: string[];
  onTogglePhase: (n: number) => void;
  onToggleLesson: (slug: string) => void;
  isLessonActive: (lesson: Lesson) => boolean;
  isSubLessonActive: (lesson: Lesson, subSlug: string) => boolean;
}

function PhaseGroup({
  phase,
  expanded,
  expandedLessons,
  onTogglePhase,
  onToggleLesson,
  isLessonActive,
  isSubLessonActive,
}: PhaseGroupProps) {
  return (
    <div>
      <button
        onClick={() => onTogglePhase(phase.number)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs font-bold uppercase tracking-wide transition-colors",
          "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
        aria-expanded={expanded}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            expanded && "rotate-90"
          )}
        />
        <span className={phase.colorClass}>P{phase.number}</span>
        <span className="truncate">{phase.title}</span>
      </button>

      {expanded && (
        <div className="ml-3 pl-3 border-l border-sidebar-border space-y-0.5 mt-0.5 mb-1">
          {phase.lessons.map((lesson) => (
            <LessonItem
              key={lesson.slug}
              lesson={lesson}
              expanded={expandedLessons.includes(lesson.slug)}
              onToggle={onToggleLesson}
              isActive={isLessonActive(lesson)}
              isSubLessonActive={isSubLessonActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lesson item ──────────────────────────────────────────────────
interface LessonItemProps {
  lesson: Lesson;
  expanded: boolean;
  onToggle: (slug: string) => void;
  isActive: boolean;
  isSubLessonActive: (lesson: Lesson, subSlug: string) => boolean;
}

function LessonItem({
  lesson,
  expanded,
  onToggle,
  isActive,
  isSubLessonActive,
}: LessonItemProps) {
  const hasSubLessons = lesson.subLessons.length > 0;

  return (
    <div>
      <div className="flex items-center">
        {/* Expand toggle (only if sub-lessons exist) */}
        {hasSubLessons ? (
          <button
            onClick={() => onToggle(lesson.slug)}
            className="p-1 hover:bg-sidebar-accent/50 rounded"
            aria-expanded={expanded}
            aria-label={`Toggle sub-lessons for ${lesson.title}`}
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform duration-200",
                expanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Lesson link */}
        <Link
          to={lessonUrl(lesson.slug)}
          className={cn(
            "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors truncate",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          {/* Progress placeholder */}
          <Circle className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          <span className="text-muted-foreground text-xs font-mono shrink-0">
            {lesson.id}
          </span>
          <span className="truncate">{lesson.title}</span>
        </Link>
      </div>

      {/* Sub-lessons */}
      {expanded && hasSubLessons && (
        <div className="ml-5 pl-3 border-l border-sidebar-border space-y-0.5 mt-0.5 mb-1">
          {lesson.subLessons.map((sub) => {
            const active = isSubLessonActive(lesson, sub.slug);
            return (
              <Link
                key={sub.slug}
                to={subLessonUrl(lesson.slug, sub.slug)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors truncate",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Circle className="h-2.5 w-2.5 shrink-0 text-muted-foreground/30" />
                <span className="truncate">{sub.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
