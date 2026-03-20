import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, Clock, User, ChevronDown } from "lucide-react";
import cuLogo from "@/assets/CULogo.png";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Startseite", path: "/" },
  {
    label: "Kantinen",
    path: "/kantinen",
    children: [
      { label: "Alle Standorte", path: "/kantinen" },
      { label: "BZO Gera/Zwötzen", path: "/kantinen/bzo" },
      { label: "Bistro Ophelia", path: "/kantinen/theater" },
      { label: "Ab Sommer 2026", path: "/kantinen/awo" },
      { label: "IHK Gera", path: "/kantinen/ihk" },
    ],
  },
  { label: "Vorbestellen", path: "/vorbestellen", highlight: true },
  { label: "Vermietung", path: "/vermietung" },
  { label: "Catering", path: "/catering" },
  { label: "Über uns", path: "/ueber-uns" },
  { label: "Jobs", path: "/jobs" },
  { label: "Kontakt", path: "/kontakt" },
];

function useOrderableStatus() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const cutoff = new Date(now);
  cutoff.setHours(11, 15, 0, 0);
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const isOrderable = isWeekday && now < cutoff;
  const diff = Math.max(0, cutoff.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  return { isOrderable, hours, minutes, isWeekday };
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { isOrderable, hours, minutes } = useOrderableStatus();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between gap-4 py-1.5 text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+493654222241" className="flex items-center gap-1 hover:underline">
              <Phone className="h-3.5 w-3.5" /> 0365 / 4222241
            </a>
            <a href="mailto:info@cu-kantine.de" className="hidden items-center gap-1 hover:underline sm:flex">
              <Mail className="h-3.5 w-3.5" /> info@cu-kantine.de
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {isOrderable ? (
              <span>
                Heute bestellen noch{" "}
                <strong>
                  {hours > 0 ? `${hours} Std ${minutes} Min` : `${minutes} Min`}
                </strong>
              </span>
            ) : (
              <span>Für heute bestellen bis 11:15 Uhr · Folgetage jederzeit</span>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={cuLogo} alt="CU Kantine & Catering" className="h-10 md:h-12" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                    location.pathname.startsWith(item.path)
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {item.label} <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {dropdownOpen && (
                  <div className="absolute left-0 top-full w-56 rounded-lg border border-border bg-card p-1.5 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  item.highlight
                    ? isOrderable
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "text-muted-foreground"
                    : location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="ml-2">
              <User className="h-4 w-4" />
            </Button>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav aria-label="Mobile Navigation" className="border-t border-border bg-card px-4 py-4 lg:hidden">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                  item.highlight && isOrderable
                    ? "bg-accent text-accent-foreground"
                    : location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-6 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Admin-Login
          </Link>
        </nav>
      )}
    </header>
  );
}
