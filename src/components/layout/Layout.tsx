import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CookieBanner from "@/components/CookieBanner";
import DemoBanner from "@/components/DemoBanner";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
