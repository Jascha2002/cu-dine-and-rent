import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Users, MapPin, Phone, Mail, Check, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import feldkuecheImg from "@/assets/rental-feldkueche.jpg";
import outdoorbarImg from "@/assets/rental-outdoorbar.jpg";
import grillImg from "@/assets/rental-grill.jpg";
import zeltImg from "@/assets/rental-zelt.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

const equipment = [
  {
    id: "feldkueche",
    name: "Feldküche (Gulaschkanone)",
    image: feldkuecheImg,
    description: "Mobile Großküche für Events mit bis zu 200 Personen. Ideal für Firmen-, Vereins- und Dorffeste.",
    pricePerDay: 150,
    deposit: 200,
    capacity: "bis 200 Portionen",
    variants: [
      { label: "Nur Equipment", price: 150 },
      { label: "Mit Personal & Anlieferung", price: 350 },
    ],
    features: ["Holz-/Kohlebefeuert", "200L Kessel", "Inkl. Kochgeschirr", "Auf Anhänger"],
  },
  {
    id: "outdoorbar",
    name: "Outdoor-Bar (mobil)",
    image: outdoorbarImg,
    description: "Rustikale mobile Bar mit Zapfanlage für Ihr Outdoor-Event. Perfekt für Hochzeiten und Feiern.",
    pricePerDay: 120,
    deposit: 150,
    capacity: "50–300 Gäste",
    variants: [
      { label: "Nur Bar-Möbel", price: 120 },
      { label: "Mit Zapfanlage & Kühlung", price: 200 },
      { label: "Komplett mit Barpersonal", price: 450 },
    ],
    features: ["Echtholz-Tresen", "LED-Beleuchtung", "Modular erweiterbar", "Wetterfest"],
  },
  {
    id: "grill",
    name: "Profi-Grillstation",
    image: grillImg,
    description: "Große Smoker-Grillstation für professionelles BBQ auf Ihrem Event.",
    pricePerDay: 80,
    deposit: 100,
    capacity: "bis 100 Portionen",
    variants: [
      { label: "Nur Grill", price: 80 },
      { label: "Mit Grillmeister", price: 280 },
    ],
    features: ["Smoker-Funktion", "Große Grillfläche", "Inkl. Reinigung", "Holzkohle inklusive"],
  },
  {
    id: "zelt",
    name: "Partyzelt & Ausstattung",
    image: zeltImg,
    description: "Festzelte inkl. Tische, Stühle und Beleuchtung. Komplett-Ausstattung für Ihre Veranstaltung.",
    pricePerDay: 200,
    deposit: 300,
    capacity: "bis 80 Sitzplätze",
    variants: [
      { label: "Zelt (6×12m)", price: 200 },
      { label: "Zelt + Möbel", price: 320 },
      { label: "Komplett mit Auf-/Abbau", price: 500 },
    ],
    features: ["Wasserdicht", "Seitenwände", "Tische & Stühle", "Lichterketten"],
  },
];

export default function Vermietung() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const selectedItem = equipment.find((e) => e.id === selected);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mb-3 font-serif text-3xl md:text-5xl">Equipment-Vermietung</h1>
            <p className="max-w-xl text-lg text-primary-foreground/80">
              Professionelles Catering-Equipment für Ihr Event – von der Feldküche bis zum Partyzelt. Lieferung im Raum Gera und Umgebung.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="container py-12 md:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
          <motion.h2 variants={fadeUp} custom={0} className="mb-2 font-serif text-2xl md:text-3xl">
            Unser Equipment
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground">
            Wählen Sie aus unserem Sortiment – auf Wunsch mit Personal und Lieferung.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {equipment.map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              custom={i + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Card className={`group overflow-hidden transition-all hover:shadow-lg ${selected === item.id ? "ring-2 ring-primary" : "border-border/50"}`}>
                <div className="relative h-56 overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <h3 className="font-serif text-xl text-primary-foreground">{item.name}</h3>
                    <Badge variant="secondary" className="shrink-0">ab {item.pricePerDay} €/Tag</Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="mb-4 text-sm text-muted-foreground">{item.description}</p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {item.features.map((f) => (
                      <span key={f} className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        <Check className="h-3 w-3 text-primary" /> {f}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {item.capacity}</span>
                    <span className="flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Kaution: {item.deposit} €</span>
                  </div>

                  {/* Variants */}
                  <div className="mb-4 space-y-1.5">
                    {item.variants.map((v) => (
                      <div key={v.label} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                        <span>{v.label}</span>
                        <span className="font-medium text-primary">{v.price} €/Tag</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={selected === item.id ? "default" : "outline"}
                      onClick={() => { setSelected(item.id); setShowForm(true); }}
                    >
                      Unverbindlich anfragen <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Inquiry Form */}
      {showForm && (
        <section id="anfrage" className="bg-muted">
          <div className="container py-12 md:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
              <h2 className="mb-2 font-serif text-2xl md:text-3xl">Unverbindliche Anfrage</h2>
              <p className="mb-6 text-muted-foreground">
                {selectedItem ? `Anfrage für: ${selectedItem.name}` : "Füllen Sie das Formular aus – wir melden uns schnellstmöglich."}
              </p>

              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="r-name">Name *</Label>
                      <Input id="r-name" placeholder="Ihr Name" />
                    </div>
                    <div>
                      <Label htmlFor="r-phone">Telefon *</Label>
                      <Input id="r-phone" type="tel" placeholder="Für Rückruf" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="r-email">E-Mail</Label>
                    <Input id="r-email" type="email" placeholder="Für schriftliches Angebot" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="r-date">Gewünschtes Datum</Label>
                      <Input id="r-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="r-guests">Gästeanzahl (ca.)</Label>
                      <Input id="r-guests" type="number" placeholder="z.B. 80" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="r-location">Veranstaltungsort</Label>
                    <Input id="r-location" placeholder="Adresse / Ort" />
                  </div>
                  <div>
                    <Label htmlFor="r-message">Nachricht / Sonderwünsche</Label>
                    <Textarea id="r-message" rows={4} placeholder="Ihre Anfrage…" />
                  </div>

                  <Separator />

                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                    Anfrage absenden
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Unverbindlich & kostenlos – wir erstellen Ihnen ein individuelles Angebot.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact bar */}
      <section className="border-t border-border bg-card">
        <div className="container flex flex-wrap items-center justify-center gap-6 py-8 text-sm text-muted-foreground">
          <a href="tel:+493654222241" className="flex items-center gap-2 hover:text-primary">
            <Phone className="h-4 w-4" /> 0365 / 4222241
          </a>
          <a href="mailto:info@cu-kantine.de" className="flex items-center gap-2 hover:text-primary">
            <Mail className="h-4 w-4" /> info@cu-kantine.de
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Lieferung im Raum Gera & Ostthüringen
          </span>
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Auf-/Abbau-Service verfügbar
          </span>
        </div>
      </section>
    </Layout>
  );
}
