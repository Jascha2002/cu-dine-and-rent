import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";

const footerSections = [
  {
    title: "Über CU Kantine",
    content: (
      <p className="text-sm leading-relaxed text-primary-foreground/70">
        Frische Küche, fairer Preis, kurze Wege und Regionalität – das ist unser Anspruch. Seit Jahren versorgen wir
        Gera mit gutem, gesundem Essen.
      </p>
    ),
  },
  {
    title: "Schnelllinks",
    links: [
      { label: "Startseite", path: "/" },
      { label: "Vorbestellen", path: "/vorbestellen" },
      { label: "Catering", path: "/catering" },
      { label: "Vermietung", path: "/vermietung" },
      { label: "Über uns", path: "/ueber-uns" },
      { label: "Kontakt", path: "/kontakt" },
    ],
  },
  {
    title: "Standorte",
    links: [
      { label: "BZO Gera/Zwötzen", path: "/kantinen/bzo" },
      { label: "Theater Gera", path: "/kantinen/theater" },
      { label: "AWO Gera", path: "/kantinen/awo" },
      { label: "IHK Gera", path: "/kantinen/ihk" },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Mittagstisch vorbestellen", path: "/vorbestellen" },
      { label: "Wochenkarten", path: "/kantinen/bzo" },
      { label: "Lieblingsgerichte", path: "/kantinen/bzo#voting" },
      { label: "Equipment mieten", path: "/vermietung" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 font-serif text-lg">{section.title}</h4>
              {section.content}
              {section.links && (
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.path + link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h4 className="mb-4 font-serif text-lg">Kontakt</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                BZO, 07551 Gera/Zwötzen
              </li>
              <li>
                <a href="tel:+493654222241" className="flex items-center gap-2 hover:text-primary-foreground">
                  <Phone className="h-4 w-4 shrink-0" /> 0365 / 4222241
                </a>
              </li>
              <li>
                <a href="mailto:info@cu-kantine.de" className="flex items-center gap-2 hover:text-primary-foreground">
                  <Mail className="h-4 w-4 shrink-0" /> info@cu-kantine.de
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary-foreground"
                >
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-4 text-xs text-primary-foreground/50">
          <span>© {new Date().getFullYear()} CU Kantine & Catering. Alle Rechte vorbehalten.</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/impressum" className="hover:text-primary-foreground">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-primary-foreground">Datenschutz</Link>
            <Link to="/agb-vorbestellung" className="hover:text-primary-foreground">AGB Vorbestellung</Link>
            <Link to="/agb-vermietung" className="hover:text-primary-foreground">AGB Vermietung</Link>
            <Link to="/widerruf" className="hover:text-primary-foreground">Widerruf</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
