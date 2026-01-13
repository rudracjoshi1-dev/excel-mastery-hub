import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getAllLessons, LessonData } from "@/data/lessons";

const categoryInfo: Record<string, { title: string; description: string; filter: (l: LessonData) => boolean }> = {
  excel: {
    title: "Excel Basics",
    description: "Foundation lessons covering what Excel is and how to work with data effectively.",
    filter: (l) => l.category === "Excel Basics",
  },
  beginner: {
    title: "Beginner Guides",
    description: "Perfect for those just starting out with spreadsheets.",
    filter: (l) => l.difficulty === "beginner",
  },
  functions: {
    title: "Functions & Formulas",
    description: "Learn to use Excel's powerful built-in functions.",
    filter: (l) => l.category === "Functions",
  },
  "data-analysis": {
    title: "Data Analysis",
    description: "Techniques for sorting, filtering, and visualising your data.",
    filter: (l) => l.category === "Data Analysis",
  },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const info = category ? categoryInfo[category] : undefined;

  if (!info) {
    return <Navigate to="/categories" replace />;
  }

  const lessons = getAllLessons().filter(info.filter);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <Badge className="mb-4">{lessons.length} Lessons</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{info.title}</h1>
            <p className="text-lg text-muted-foreground">{info.description}</p>
          </header>

          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Lesson {lesson.id}</Badge>
                    <Badge variant="secondary">{lesson.duration}</Badge>
                  </div>
                  <CardTitle>{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="gap-2">
                    <Link to={`/learn/${lesson.slug}`}>
                      Start Lesson <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
