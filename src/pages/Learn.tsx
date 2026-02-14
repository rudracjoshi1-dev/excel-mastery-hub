import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LearnLayout, AdPlaceholder } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import { phases } from "@/data/lessonHierarchy";
import { allLessons, TOTAL_LESSONS } from "@/data/allLessons";

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return phases;

    return phases
      .map((phase) => {
        const filteredLessons = phase.lessons
          .map((lesson) => {
            const lessonMatches =
              lesson.title.toLowerCase().includes(q) ||
              lesson.slug.toLowerCase().includes(q) ||
              lesson.id.toLowerCase().includes(q);

            const filteredSubs = lesson.subLessons.filter(
              (sub) =>
                sub.title.toLowerCase().includes(q) ||
                sub.slug.toLowerCase().includes(q)
            );

            if (lessonMatches || filteredSubs.length > 0) {
              return { ...lesson, subLessons: lessonMatches ? lesson.subLessons : filteredSubs };
            }
            return null;
          })
          .filter(Boolean) as typeof phase.lessons;

        if (filteredLessons.length > 0) {
          return { ...phase, lessons: filteredLessons };
        }
        return null;
      })
      .filter(Boolean) as typeof phases;
  }, [searchQuery]);

  const totalVisible = filteredPhases.reduce(
    (acc, p) => acc + p.lessons.length + p.lessons.reduce((a, l) => a + l.subLessons.length, 0),
    0
  );

  return (
    <LearnLayout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Learn Excel</h1>
            <p className="text-lg text-muted-foreground">
              Complete all {TOTAL_LESSONS} lessons to go from beginner to confident Excel user.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons by name, topic, or function…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground text-center mb-6">
              Showing {totalVisible} result{totalVisible !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}

          <AdPlaceholder size="banner" className="mb-8" />

          {filteredPhases.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-2">No lessons found for "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredPhases.map((phase) => (
                <div key={phase.number}>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      Phase {phase.number}
                    </Badge>
                    <h2 className="text-xl font-semibold text-foreground">{phase.title}</h2>
                  </div>

                  <div className="space-y-3">
                    {phase.lessons.map((lesson) => {
                      const meta = allLessons.find((m) => m.slug === lesson.slug && !m.parentSlug);
                      return (
                        <Card key={lesson.slug} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Badge>Lesson {lesson.id}</Badge>
                              {meta && (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {meta.duration}
                                </Badge>
                              )}
                              {meta && <Badge variant="secondary">{meta.difficulty}</Badge>}
                            </div>
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col gap-3">
                              {lesson.subLessons.length > 0 && (
                                <ul className="text-sm text-muted-foreground space-y-1 pl-1">
                                  {lesson.subLessons.map((sub) => (
                                    <li key={sub.slug}>
                                      <Link
                                        to={`/learn/${lesson.slug}/${sub.slug}`}
                                        className="hover:text-primary transition-colors hover:underline"
                                      >
                                        → {sub.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <div className="flex justify-end">
                                <Button asChild size="sm" className="gap-2">
                                  <Link to={`/learn/${lesson.slug}`}>
                                    Start <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LearnLayout>
  );
}
