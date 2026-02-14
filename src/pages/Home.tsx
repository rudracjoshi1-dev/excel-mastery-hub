import { Link } from "react-router-dom";
import { Layout, AdPlaceholder } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Target, Users, CheckCircle, FileSpreadsheet, BarChart3, Calculator } from "lucide-react";
import { getAllLessons } from "@/data/lessons";

const features = [
  { icon: BookOpen, title: "75+ Structured Lessons", description: "From complete beginner to confident user" },
  { icon: Target, title: "Interactive Tasks", description: "Practice with hands-on spreadsheet exercises" },
  { icon: Users, title: "Beginner Friendly", description: "No prior experience required" },
  { icon: CheckCircle, title: "Real-World Examples", description: "Learn skills you'll actually use" },
];

export default function Home() {
  const lessons = getAllLessons().slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Free Excel Course for Beginners</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Master Microsoft Excel from Scratch
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 text-balance">
              Learn Excel step by step with interactive lessons designed for complete beginners. 
              No prior experience needed — just a willingness to learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/learn/lesson-1">
                  Start Lesson 1
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/learn">View All Lessons</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lesson Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Start Your Learning Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each lesson builds on the previous one, taking you from understanding what Excel is to creating charts and using formulas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Lesson {lesson.id}</Badge>
                    <Badge variant="secondary">{lesson.duration}</Badge>
                  </div>
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="gap-2 p-0 h-auto text-primary">
                    <Link to={`/learn/${lesson.slug}`}>
                      Start Lesson <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/learn">View All Lessons</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Ad Placeholder */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <AdPlaceholder size="banner" />
      </div>

      {/* Who Is This For */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Who Is This Course For?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <FileSpreadsheet className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Complete Beginners</h3>
                <p className="text-sm text-muted-foreground">Never opened Excel? Perfect. We start from the very beginning.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <BarChart3 className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Career Changers</h3>
                <p className="text-sm text-muted-foreground">Excel skills are essential in most office jobs. Get job-ready.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <Calculator className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Students</h3>
                <p className="text-sm text-muted-foreground">From tracking grades to managing budgets — Excel helps everywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-primary rounded-2xl p-8 lg:p-12 text-center text-primary-foreground">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Master Excel?</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Start with Lesson 1 and work through at your own pace. Each lesson takes 10-20 minutes.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/learn/lesson-1">
                Begin Your Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
