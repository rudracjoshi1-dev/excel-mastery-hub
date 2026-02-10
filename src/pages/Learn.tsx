import { Link } from "react-router-dom";
import { LearnLayout, AdPlaceholder } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, CheckCircle } from "lucide-react";
import { getAllLessons } from "@/data/lessons";

export default function Learn() {
  const lessons = getAllLessons();

  return (
    <LearnLayout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Learn Excel</h1>
            <p className="text-lg text-muted-foreground">
              Complete all 10 lessons to go from beginner to confident Excel user.
            </p>
          </div>

          <AdPlaceholder size="banner" className="mb-8" />

          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge>Lesson {lesson.id}</Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </Badge>
                    <Badge variant="secondary">{lesson.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {lesson.goals.slice(0, 2).map((goal, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="gap-2 shrink-0 ml-4">
                    <Link to={`/learn/${lesson.slug}`}>
                      Start <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </LearnLayout>
  );
}
