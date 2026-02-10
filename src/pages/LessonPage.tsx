import { useParams, Link, Navigate } from "react-router-dom";
import { LearnLayout, AdPlaceholder } from "@/components/layout";
import { InteractiveLesson } from "@/components/lessons/InteractiveLesson";
import { UniverInteractiveLesson } from "@/components/lessons/UniverInteractiveLesson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Clock, Target, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { getLessonBySlug } from "@/data/lessons";

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = slug ? getLessonBySlug(slug) : undefined;

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  return (
    <LearnLayout>
      <article className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge>Lesson {lesson.id}</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {lesson.duration}
              </Badge>
              <Badge variant="secondary">{lesson.category}</Badge>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{lesson.title}</h1>
            <p className="text-lg text-muted-foreground">{lesson.overview}</p>
          </header>

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
            {lesson.id === 1 ? (
              <UniverInteractiveLesson
                instructions={lesson.interactiveTask.instructions}
                initialData={lesson.interactiveTask.initialData}
                expectedResult={lesson.interactiveTask.expectedResult}
                hints={lesson.hints}
                answerExplanation={lesson.answerExplanation}
                validationRules={lesson.interactiveTask.validationRules}
              />
            ) : (
              <InteractiveLesson
                instructions={lesson.interactiveTask.instructions}
                initialData={lesson.interactiveTask.initialData}
                expectedResult={lesson.interactiveTask.expectedResult}
                hints={lesson.hints}
                answerExplanation={lesson.answerExplanation}
                validationRules={lesson.interactiveTask.validationRules}
              />
            )}
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

          {/* Navigation */}
          <nav className="flex justify-between items-center pt-8 border-t border-border">
            {lesson.prevLesson ? (
              <Button asChild variant="outline" className="gap-2">
                <Link to={`/learn/${lesson.prevLesson.slug}`}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous:</span> Lesson {lesson.prevLesson.id}
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {lesson.nextLesson ? (
              <Button asChild className="gap-2">
                <Link to={`/learn/${lesson.nextLesson.slug}`}>
                  <span className="hidden sm:inline">Next:</span> Lesson {lesson.nextLesson.id}
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
