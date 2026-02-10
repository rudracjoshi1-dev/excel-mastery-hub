import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LearnSidebar } from "./LearnSidebar";

interface LearnLayoutProps {
  children: ReactNode;
}

/**
 * Layout used for all /learn/* pages.
 * Renders Header + Sidebar + Content + Footer.
 */
export function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <LearnSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
