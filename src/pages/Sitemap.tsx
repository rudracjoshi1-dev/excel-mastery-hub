import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { getAllLessons } from "@/data/lessons";

export default function Sitemap() {
  const lessons = getAllLessons();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Sitemap</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Main Pages</h2>
              <ul className="space-y-2">
                <li><Link to="/" className="text-primary hover:underline">Home</Link></li>
                <li><Link to="/learn" className="text-primary hover:underline">Learn Excel</Link></li>
                <li><Link to="/categories" className="text-primary hover:underline">Categories</Link></li>
                <li><Link to="/about" className="text-primary hover:underline">About Us</Link></li>
                <li><Link to="/contact" className="text-primary hover:underline">Contact Us</Link></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Lessons</h2>
              <ul className="space-y-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link to={`/learn/${lesson.slug}`} className="text-primary hover:underline">
                      Lesson {lesson.id}: {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Categories</h2>
              <ul className="space-y-2">
                <li><Link to="/categories/excel" className="text-primary hover:underline">Excel Basics</Link></li>
                <li><Link to="/categories/beginner" className="text-primary hover:underline">Beginner Guides</Link></li>
                <li><Link to="/categories/functions" className="text-primary hover:underline">Functions & Formulas</Link></li>
                <li><Link to="/categories/data-analysis" className="text-primary hover:underline">Data Analysis</Link></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Legal</h2>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                <li><Link to="/disclaimer" className="text-primary hover:underline">Disclaimer</Link></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
