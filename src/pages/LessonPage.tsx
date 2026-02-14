import { useParams, Link, Navigate } from "react-router-dom";
import { LearnLayout, AdPlaceholder } from "@/components/layout";
import { UniverInteractiveLesson } from "@/components/lessons/UniverInteractiveLesson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Clock, Target, AlertTriangle, CheckCircle, Lightbulb, Construction } from "lucide-react";
import { getLessonBySlug, type LessonData } from "@/data/lessons";
import {
  getLessonMeta,
  getSubLessonMeta,
  type LessonMeta,
} from "@/data/allLessons";

/**
 * Renders a full lesson with written content (from lessons.ts).
 */
function FullLessonContent({ lesson }: { lesson: LessonData }) {
  return (
    <>
      {/* Learning Goals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.goals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <AdPlaceholder size="banner" className="mb-8" />

      {/* Concept Explanation */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Understanding the Concept</h2>
        <div className="prose prose-gray max-w-none space-y-4">
          {lesson.conceptExplanation.map((para, idx) => (
            <p key={idx} className="text-muted-foreground leading-relaxed">{para}</p>
          ))}
        </div>
      </section>

      {/* Real World Use Cases */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Real-World Use Cases</h2>
        <ul className="space-y-2">
          {lesson.realWorldUseCases.map((useCase, idx) => (
            <li key={idx} className="flex items-center gap-2 text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-warning shrink-0" />
              {useCase}
            </li>
          ))}
        </ul>
      </section>

      {/* Worked Example */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Worked Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{lesson.workedExample.scenario}</p>
          <ol className="list-decimal list-inside space-y-2">
            {lesson.workedExample.steps.map((step, idx) => (
              <li key={idx} className="text-sm text-foreground">{step}</li>
            ))}
          </ol>
          <div className="bg-background rounded-lg p-4 border">
            <p className="font-medium text-sm text-success">{lesson.workedExample.result}</p>
          </div>
        </CardContent>
      </Card>

      {/* Common Mistakes */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warning" />
          Common Beginner Mistakes
        </h2>
        <div className="space-y-4">
          {lesson.commonMistakes.map((item, idx) => (
            <Card key={idx} className="border-warning/20">
              <CardContent className="pt-4">
                <p className="font-semibold text-foreground mb-1">❌ {item.mistake}</p>
                <p className="text-sm text-muted-foreground mb-2"><strong>Why:</strong> {item.why}</p>
                <p className="text-sm text-success"><strong>Fix:</strong> {item.fix}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Interactive Task */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Interactive Task</h2>
        <UniverInteractiveLesson
          instructions={lesson.interactiveTask.instructions}
          initialData={lesson.interactiveTask.initialData}
          expectedResult={lesson.interactiveTask.expectedResult}
          hints={lesson.hints}
          answerExplanation={lesson.answerExplanation}
          validationRules={lesson.interactiveTask.validationRules}
          lessonSlug={lesson.slug}
        />
      </section>

      <AdPlaceholder size="banner" className="my-8" />

      {/* Summary */}
      <Card className="mb-8 bg-accent/50">
        <CardHeader>
          <CardTitle className="text-lg">Lesson Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {lesson.summary.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

/**
 * Placeholder content for lessons not yet written.
 * Includes the embedded spreadsheet for practice.
 */
function PlaceholderContent({ meta }: { meta: LessonMeta }) {
  const placeholderData = [
    ["Column A", "Column B", "Column C", "Column D"],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ];

  return (
    <>
      {/* Coming Soon Notice */}
      <Card className="mb-8 border-warning/30 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Construction className="h-6 w-6 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Lesson Content Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                The full lesson content for <strong>{meta.title}</strong> is currently being written. 
                In the meantime, you can practise with the embedded spreadsheet below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Goals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Learning goals for this lesson will be added soon.
          </p>
        </CardContent>
      </Card>

      <AdPlaceholder size="banner" className="mb-8" />

      <Separator className="my-8" />

      {/* Interactive Spreadsheet — always present */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Practice Spreadsheet</h2>
        <UniverInteractiveLesson
          instructions="Use the spreadsheet below to practise. Full instructions will be added when the lesson content is ready."
          initialData={placeholderData}
          expectedResult={placeholderData}
          hints={["This lesson's hints are coming soon."]}
          answerExplanation="Detailed explanations will be available when the lesson content is published."
          validationRules={[]}
          lessonSlug={meta.parentSlug ? `${meta.parentSlug}/${meta.slug}` : meta.slug}
        />
      </section>

      <AdPlaceholder size="banner" className="my-8" />
    </>
  );
}

/**
 * Unified lesson page — handles both top-level lessons (/learn/:slug)
 * and sub-lessons (/learn/:slug/:subSlug).
 *
 * Rendering priority:
 *  1. If full content exists in lessons.ts → render rich content
 *  2. Otherwise → render placeholder with embedded spreadsheet
 */
export default function LessonPage() {
  const { slug, subSlug } = useParams<{ slug: string; subSlug?: string }>();

  // Resolve lesson metadata from the registry
  const meta = subSlug && slug
    ? getSubLessonMeta(slug, subSlug)
    : slug
      ? getLessonMeta(slug)
      : undefined;

  // Also check for full content in the legacy lessons.ts
  const fullContent = slug ? getLessonBySlug(slug) : undefined;

  // If neither registry nor legacy data found, redirect
  if (!meta && !fullContent) {
    return <Navigate to="/learn" replace />;
  }

  // Determine what to render
  const hasFullContent = !subSlug && fullContent;
  const displayTitle = hasFullContent ? fullContent.title : meta?.title ?? "Lesson";
  const displayId = meta?.displayId ?? (fullContent ? String(fullContent.id) : "");
  const phase = meta?.phase ?? 0;
  const difficulty = meta?.difficulty ?? "beginner";
  const duration = meta?.duration ?? fullContent?.duration ?? "15 min";
  const category = meta?.category ?? fullContent?.category ?? "";

  return (
    <LearnLayout>
      <article className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge>Lesson {displayId}</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </Badge>
              <Badge variant="secondary">{category}</Badge>
              <Badge
                variant={phase >= 6 ? "destructive" : "outline"}
                className="text-[10px]"
              >
                Phase {phase} · {difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {displayTitle}
            </h1>
            {hasFullContent && (
              <p className="text-lg text-muted-foreground">{fullContent.overview}</p>
            )}
            {!hasFullContent && meta && (
              <p className="text-lg text-muted-foreground">
                Learn about {meta.title.toLowerCase()} in this hands-on lesson with an interactive spreadsheet.
              </p>
            )}
          </header>

          {/* Main content: full or placeholder */}
          {hasFullContent ? (
            <FullLessonContent lesson={fullContent} />
          ) : meta ? (
            <PlaceholderContent meta={meta} />
          ) : null}

          {/* Navigation */}
          <nav className="flex justify-between items-center pt-8 border-t border-border">
            {(meta?.prevSlug || fullContent?.prevLesson) ? (
              <Button asChild variant="outline" className="gap-2">
                <Link
                  to={
                    meta?.prevSlug
                      ? `/learn/${meta.prevSlug}`
                      : `/learn/${fullContent!.prevLesson!.slug}`
                  }
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {(meta?.nextSlug || fullContent?.nextLesson) ? (
              <Button asChild className="gap-2">
                <Link
                  to={
                    meta?.nextSlug
                      ? `/learn/${meta.nextSlug}`
                      : `/learn/${fullContent!.nextLesson!.slug}`
                  }
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default">
                <Link to="/learn">Complete! View All Lessons</Link>
              </Button>
            )}
          </nav>
        </div>
      </article>
    </LearnLayout>
  );
}
