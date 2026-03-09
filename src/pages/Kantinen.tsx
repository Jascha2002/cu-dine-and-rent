import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

import bzoAusgabe from "@/assets/kantinen/bzo-ausgabe.png";
import bzoEingang from "@/assets/kantinen/bzo-eingang.png";
import bzoLageplan from "@/assets/kantinen/bzo-lageplan.png";
import opheliaEingang from "@/assets/kantinen/ophelia-eingang.png";
import opheliaInnen from "@/assets/kantinen/ophelia-innen.png";

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
    address: "Lange Straße 52, 07551 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 06:30–18:30 Uhr",
    description: "Unser Hauptstandort – öffentliche Kantine mit täglichem Mittagstisch und Vorbestellmöglichkeit.",
    highlight: true,
    features: ["Öffentliche Kantine", "Vorbestellung möglich", "2 Menüs + Veggie", "Tagessuppe"],
    images: [bzoAusgabe, bzoEingang, bzoLageplan],
  },
  {
    id: "theater",
    name: "Bistro Ophelia",
    subtitle: "Betriebskantine Theater Gera",
    address: "Theaterplatz 1, 07548 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 07:30–18:00 Uhr",
    description: 'Nicht öffentliche Betriebskantine am Theater Gera. Reservierungen für den Abend gern per Mail an: bistro-ophelia@cu-kantine.de',
    highlight: false,
    features: ["Nicht öffentliche Kantine", "Wechselnder Speiseplan", "Snack-Karte", "Abendreservierung"],
    images: [opheliaInnen, opheliaEingang],
  },
  {
    id: "awo",
    name: "Weitere Kantine",
    address: "Gera",
    phone: "0365 / 4222241",
    hours: "Eröffnung im Sommer 2026",
    description: "Nicht öffentlich zugängliche Betriebskantine – Eröffnung im Sommer 2026.",
    highlight: false,
    features: ["Eröffnung 2026", "Betriebskantine"],
    images: [],
    comingSoon: true,
  },
  {
    id: "ihk",
    name: "IHK Gera",
    address: "Gaswerkstraße 23, 07546 Gera",
    phone: "0365 / 4222241",
    hours: "Mo–Fr 07:00–17:30 Uhr",
    description: "Öffentliche Kantine in der Industrie- und Handelskammer Ostthüringen. Eröffnung ab 7. April 2026.",
    highlight: false,
    features: ["Öffentliche Kantine", "Eröffnung ab 7. April 2026", "Tagesmenü", "Business-Lunch"],
    images: [],
    comingSoon: true,
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

                  {s.images && s.images.length > 0 && (
                    <div className={`mb-5 grid gap-2 ${s.images.length >= 3 ? "grid-cols-3" : s.images.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {s.images.map((img, idx) => (
                        <div key={idx} className="overflow-hidden rounded-lg">
                          <img
                            src={img}
                            alt={`${s.name} Bild ${idx + 1}`}
                            className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  )}

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
