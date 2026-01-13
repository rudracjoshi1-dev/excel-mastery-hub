import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, BookOpen } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">About ExcelMastery</h1>
          
          <div className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg">
              ExcelMastery is a free educational platform dedicated to teaching Microsoft Excel to complete beginners. 
              We believe everyone deserves access to quality spreadsheet education, regardless of their background or budget.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose my-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">For Everyone</h3>
                  <p className="text-sm text-muted-foreground">Designed for complete beginners with zero experience</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">Practical Skills</h3>
                  <p className="text-sm text-muted-foreground">Real-world examples you'll actually use</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground">Learn by Doing</h3>
                  <p className="text-sm text-muted-foreground">Interactive tasks in every lesson</p>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8">Our Mission</h2>
            <p>
              Excel skills are essential in today's workplace. From tracking expenses to analysing data, 
              spreadsheets are everywhere. Our mission is to make Excel accessible to everyone through 
              clear, structured, beginner-friendly lessons.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Our Approach</h2>
            <p>
              Each lesson follows a consistent structure: we explain concepts clearly, show real-world examples, 
              let you practice with interactive tasks, and provide hints when you need help. We never assume 
              prior knowledge and build each lesson on the one before.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
