import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Hinweis"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-card p-4 shadow-lg md:p-6"
    >
      <div className="container flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.
          Weitere Informationen finden Sie in unserer{" "}
          <Link to="/datenschutz" className="text-primary underline hover:text-primary/80">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" size="sm" onClick={decline}>
            Ablehnen
          </Button>
          <Button size="sm" onClick={accept}>
            Akzeptieren
          </Button>
        </div>
      </div>
    </div>
  );
}
