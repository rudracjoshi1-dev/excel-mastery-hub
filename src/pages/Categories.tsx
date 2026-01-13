import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, BookOpen, Calculator, BarChart3, ArrowRight } from "lucide-react";

const categories = [
  { slug: "excel", title: "Excel Basics", description: "Foundation lessons on what Excel is and how data works", icon: FileSpreadsheet, count: 4 },
  { slug: "beginner", title: "Beginner Guides", description: "All lessons suitable for complete beginners", icon: BookOpen, count: 10 },
  { slug: "functions", title: "Functions & Formulas", description: "SUM, AVERAGE, IF statements and more", icon: Calculator, count: 4 },
  { slug: "data-analysis", title: "Data Analysis", description: "Sorting, filtering, and creating charts", icon: BarChart3, count: 2 },
];

export default function Categories() {
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Browse by Category</h1>
            <p className="text-lg text-muted-foreground">Find lessons organized by topic and skill level.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/categories/${cat.slug}`}>
                <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <cat.icon className="h-10 w-10 text-primary" />
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="mt-4">{cat.title}</CardTitle>
                    <CardDescription>{cat.description}</CardDescription>
                    <p className="text-sm text-primary font-medium">{cat.count} lessons</p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
