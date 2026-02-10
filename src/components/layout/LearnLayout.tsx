import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LearnSidebar } from "./LearnSidebar";

interface LearnLayoutProps {
  children: ReactNode;
}

/**
 * Layout for all /learn/* pages.
 * Header → Sidebar + Content → Footer.
 */
export function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 relative">
        <LearnSidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
