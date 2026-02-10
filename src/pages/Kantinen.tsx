import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

export const standorte = [
  {
    id: "bzo",
    name: "BZO Gera/Zwötzen",
    address: "Bildungszentrum Ost, 07551 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 11:30–13:30 Uhr",
    description: "Unser Hauptstandort im Bildungszentrum Ost – mit täglichem Mittagstisch und Vorbestellmöglichkeit.",
    highlight: true,
    features: ["Vorbestellung möglich", "2 Menüs + Veggie", "Tagessuppe"],
  },
  {
    id: "theater",
    name: "Theater Gera",
    address: "Theaterplatz, 07545 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 11:30–14:00 Uhr",
    description: "Direkt am Theaterplatz – frische Küche in kulturellem Ambiente.",
    highlight: false,
    features: ["Tagesmenü", "Salat-Bar"],
  },
  {
    id: "awo",
    name: "AWO Gera",
    address: "AWO Zentrum, 07545 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 11:00–13:30 Uhr",
    description: "Verlässliche Mittagsversorgung im AWO Zentrum für Mitarbeiter und Gäste.",
    highlight: false,
    features: ["Tagesmenü", "Dessert"],
  },
  {
    id: "ihk",
    name: "IHK Gera",
    address: "Gaswerkstraße, 07546 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 11:30–13:30 Uhr",
    description: "Frische Mittagsküche in der Industrie- und Handelskammer Ostthüringen.",
    highlight: false,
    features: ["Tagesmenü", "Business-Lunch"],
  },
];

export default function Kantinen() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-14 md:py-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 font-serif text-4xl md:text-5xl"
          >
            Unsere Kantinen
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="max-w-xl text-primary-foreground/80"
          >
            4 Standorte in Gera – täglich frisch, regional und zu fairem Preis. Einheitspreis: 6,50 € pro Hauptgericht.
          </motion.p>
        </div>
      </section>

      <section className="container py-12 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {standorte.map((s, i) => (
            <motion.div key={s.id} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className={`group relative overflow-hidden transition-shadow hover:shadow-lg ${s.highlight ? "border-accent ring-2 ring-accent/20" : "border-border/50"}`}>
                {s.highlight && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <Star className="h-3 w-3" /> Vorbestellung
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="mb-2 font-serif text-2xl">{s.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{s.description}</p>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" /> {s.address}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0 text-primary" /> {s.hours}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0 text-primary" /> {s.phone}
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {s.features.map((f) => (
                      <span key={f} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>

                  <Button asChild variant={s.highlight ? "default" : "outline"} className={s.highlight ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}>
                    <Link to={`/kantinen/${s.id}`} className="flex items-center gap-1">
                      Speiseplan & Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
