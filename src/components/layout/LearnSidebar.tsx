import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Circle,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  X,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  phases,
  lessonUrl,
  subLessonUrl,
  type Phase,
  type Lesson,
} from "@/data/lessonHierarchy";

// ─── Persist expanded state ───────────────────────────────────────
const STORAGE_KEY = "learn-sidebar-state";

interface SidebarState {
  expandedPhases: number[];
  expandedLessons: string[];
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

// ─── Shared nav content ───────────────────────────────────────────
interface NavContentProps {
  state: SidebarState;
  pathname: string;
  togglePhase: (n: number) => void;
  toggleLesson: (slug: string) => void;
  onNavigate?: () => void;
}

function NavContent({ state, pathname, togglePhase, toggleLesson, onNavigate }: NavContentProps) {
  const isLessonActive = (lesson: Lesson) =>
    pathname === lessonUrl(lesson.slug) ||
    pathname.startsWith(lessonUrl(lesson.slug) + "/");

  const isSubLessonActive = (lesson: Lesson, subSlug: string) =>
    pathname === subLessonUrl(lesson.slug, subSlug);

  return (
    <nav className="p-3 space-y-1" aria-label="Course navigation">
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
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

// ─── Main export ──────────────────────────────────────────────────
export function LearnSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [state, setState] = useState<SidebarState>(loadState);

  // Auto-expand active phase/lesson
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

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const togglePhase = useCallback(
    (n: number) =>
      setState((prev) => ({
        ...prev,
        expandedPhases: prev.expandedPhases.includes(n)
          ? prev.expandedPhases.filter((x) => x !== n)
          : [...prev.expandedPhases, n],
      })),
    []
  );

  const toggleLesson = useCallback(
    (slug: string) =>
      setState((prev) => ({
        ...prev,
        expandedLessons: prev.expandedLessons.includes(slug)
          ? prev.expandedLessons.filter((x) => x !== slug)
          : [...prev.expandedLessons, slug],
      })),
    []
  );

  const navProps: NavContentProps = {
    state,
    pathname,
    togglePhase,
    toggleLesson,
  };

  return (
    <>
      {/* ── Mobile trigger (fixed bottom-left FAB) ─────────────── */}
      <div className="lg:hidden fixed bottom-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              aria-label="Open course menu"
            >
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
            <SheetHeader className="px-4 py-3 border-b border-border">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                Course Outline
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <NavContent {...navProps} onNavigate={() => setMobileOpen(false)} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Desktop collapsed mini-rail ────────────────────────── */}
      {collapsed && (
        <aside className="hidden lg:flex flex-col items-center w-14 border-r border-sidebar-border bg-sidebar-background shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <Button
            variant="ghost"
            size="icon"
            className="mt-3 mb-3 h-8 w-8"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1.5">
            {phases.map((phase) => (
              <button
                key={phase.number}
                onClick={() => {
                  setCollapsed(false);
                  if (!state.expandedPhases.includes(phase.number)) {
                    togglePhase(phase.number);
                  }
                }}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200",
                  "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105"
                )}
                title={`Phase ${phase.number}: ${phase.title}`}
              >
                {phase.number}
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* ── Desktop full sidebar ───────────────────────────────── */}
      {!collapsed && (
        <aside className="hidden lg:flex flex-col w-[280px] border-r border-sidebar-border bg-sidebar-background shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
                Course Outline
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <NavContent {...navProps} />
          </ScrollArea>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-sidebar-border">
            <p className="text-[10px] text-muted-foreground/60 text-center tracking-wide uppercase">
              {phases.length} phases · {phases.reduce((a, p) => a + p.lessons.length, 0)} lessons
            </p>
          </div>
        </aside>
      )}
    </>
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
  onNavigate?: () => void;
}

function PhaseGroup({
  phase,
  expanded,
  expandedLessons,
  onTogglePhase,
  onToggleLesson,
  isLessonActive,
  isSubLessonActive,
  onNavigate,
}: PhaseGroupProps) {
  return (
    <div className="mb-0.5">
      <button
        onClick={() => onTogglePhase(phase.number)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors duration-150",
          "hover:bg-sidebar-accent/60",
          expanded && "bg-sidebar-accent/30"
        )}
        aria-expanded={expanded}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-90"
          )}
        />
        <span
          className={cn(
            "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold shrink-0",
            phase.number <= 5
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {phase.number}
        </span>
        <span className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
          {phase.title}
        </span>
      </button>

      {expanded && (
        <div className="ml-[22px] pl-3 border-l-2 border-sidebar-border/60 space-y-px mt-1 mb-2">
          {phase.lessons.map((lesson) => (
            <LessonItem
              key={lesson.slug}
              lesson={lesson}
              expanded={expandedLessons.includes(lesson.slug)}
              onToggle={onToggleLesson}
              isActive={isLessonActive(lesson)}
              isSubLessonActive={isSubLessonActive}
              onNavigate={onNavigate}
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
  onNavigate?: () => void;
}

function LessonItem({
  lesson,
  expanded,
  onToggle,
  isActive,
  isSubLessonActive,
  onNavigate,
}: LessonItemProps) {
  const hasSubLessons = lesson.subLessons.length > 0;

  return (
    <div>
      <div className="flex items-center group">
        {/* Chevron toggle */}
        {hasSubLessons ? (
          <button
            onClick={() => onToggle(lesson.slug)}
            className="p-1 rounded hover:bg-sidebar-accent/50 transition-colors"
            aria-expanded={expanded}
            aria-label={`Toggle sub-lessons for ${lesson.title}`}
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 text-muted-foreground/60 transition-transform duration-200",
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
          onClick={onNavigate}
          className={cn(
            "flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-all duration-150 min-w-0",
            isActive
              ? "bg-primary/10 text-primary font-medium shadow-sm"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 group-hover:bg-sidebar-accent/30"
          )}
        >
          {/* Progress placeholder */}
          <Circle
            className={cn(
              "h-2.5 w-2.5 shrink-0 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground/30"
            )}
          />
          <span className="text-muted-foreground text-[11px] font-mono shrink-0 tabular-nums">
            {lesson.id}
          </span>
          <span className="truncate">{lesson.title}</span>
        </Link>
      </div>

      {/* Sub-lessons */}
      {expanded && hasSubLessons && (
        <div className="ml-5 pl-3 border-l border-sidebar-border/40 space-y-px mt-0.5 mb-1">
          {lesson.subLessons.map((sub) => {
            const active = isSubLessonActive(lesson, sub.slug);
            return (
              <Link
                key={sub.slug}
                to={subLessonUrl(lesson.slug, sub.slug)}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-all duration-150 min-w-0",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Circle
                  className={cn(
                    "h-2 w-2 shrink-0",
                    active ? "text-primary" : "text-muted-foreground/25"
                  )}
                />
                <span className="truncate">{sub.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
