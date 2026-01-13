import { Link } from "react-router-dom";
import { Grid3X3, Mail, ExternalLink } from "lucide-react";

const footerLinks = {
  learn: [
    { name: "All Lessons", href: "/learn" },
    { name: "Lesson 1: What is Excel", href: "/learn/lesson-1" },
    { name: "Lesson 5: Basic Formulas", href: "/learn/lesson-5" },
    { name: "Lesson 8: Common Functions", href: "/learn/lesson-8" },
  ],
  categories: [
    { name: "Excel Basics", href: "/categories/excel" },
    { name: "Beginner Guides", href: "/categories/beginner" },
    { name: "Functions", href: "/categories/functions" },
    { name: "Data Analysis", href: "/categories/data-analysis" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Sitemap", href: "/sitemap" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Grid3X3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ExcelMastery</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Learn Microsoft Excel from scratch with our beginner-friendly, interactive lessons. 
              Master spreadsheets step by step.
            </p>
            <a
              href="mailto:hello@excelmastery.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              hello@excelmastery.com
            </a>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Learn Excel</h3>
            <ul className="space-y-3">
              {footerLinks.learn.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} ExcelMastery. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for Excel learners everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
