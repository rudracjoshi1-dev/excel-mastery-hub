import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Have questions, feedback, or suggestions? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Email Us</CardTitle>
                <CardDescription>For general inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:hello@excelmastery.com" className="text-primary hover:underline">
                  hello@excelmastery.com
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Feedback</CardTitle>
                <CardDescription>Help us improve our lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Use the form below to share your thoughts.</p>
              </CardContent>
            </Card>
          </div>

          {/* Google Form Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
                <div>
                  <p className="text-muted-foreground mb-2">Google Form Embed Placeholder</p>
                  <p className="text-sm text-muted-foreground">Replace this with your Google Form iframe embed code</p>
                  <code className="block mt-4 text-xs bg-background p-2 rounded">
                    {'<iframe src="YOUR_GOOGLE_FORM_URL" ...></iframe>'}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
