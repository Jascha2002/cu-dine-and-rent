import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat, Users, PartyPopper, Briefcase, Heart, GraduationCap,
  ArrowRight, ArrowLeft, Check, Phone, Mail, MapPin, Sparkles, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import Layout from "@/components/layout/Layout";

import heroCatering from "@/assets/hero-catering.jpg";
import imgBusiness from "@/assets/catering/catering-business.png";
import imgBuffet2 from "@/assets/catering/catering-buffet-2.png";
import imgBuffetLachs from "@/assets/catering/catering-buffet-lachs.png";
import imgBuffet from "@/assets/catering/catering-buffet.png";
import imgBuffetplatten from "@/assets/catering/catering-buffetplatten.png";
import imgFrisch from "@/assets/catering/catering-frisch-fruchtig.png";

// --- data ---
const occasions = [
  { id: "firmenfeier", label: "Firmenfeier", icon: Briefcase },
  { id: "hochzeit", label: "Hochzeit", icon: Heart },
  { id: "geburtstag", label: "Geburtstag / Jubiläum", icon: PartyPopper },
  { id: "seminar", label: "Seminar / Tagung", icon: GraduationCap },
  { id: "vereinsfest", label: "Vereins-/Dorffest", icon: Users },
  { id: "sonstiges", label: "Sonstiges", icon: Sparkles },
];

type Package = {
  name: string;
  tier: "basis" | "komfort" | "premium";
  pricePerPerson: number;
  includes: string[];
  highlight?: string;
};

function computePackages(guests: number, occasion: string): Package[] {
  return [
    {
      name: "Basis-Paket", tier: "basis", pricePerPerson: 12.90,
      includes: [
        "Halbe belegte Brötchen & Canapés (2 pro Person)",
        "Kaffee, Tee & Wasser",
        "Ab 20 Personen (bei geringerer Anzahl ändert sich der Preis)",
      ],
    },
    {
      name: "Komfort-Paket", tier: "komfort", pricePerPerson: 35, highlight: "Beliebteste Wahl",
      includes: [
        "2 Vorspeisen nach Wahl",
        "2 Hauptgerichte nach Wahl",
        "1 Dessert nach Wahl",
        "Ab 20 Personen (bei geringerer Anzahl ändert sich der Preis)",
      ],
    },
    {
      name: "Premium-Paket", tier: "premium", pricePerPerson: 0,
      includes: [
        "Individuelles Angebot nach Ihren Wünschen",
        "Sektempfang, 3-Gänge-Menü oder Premium-Buffet",
        "Live-Cooking, Getränke-Flatrate, Komplett-Service",
        "Fragen Sie gerne nach – wir erstellen Ihr Angebot",
      ],
    },
  ];
}

const komfortAddons = [
  { label: "Getränkepauschale", price: "12,90 € p.P." },
  { label: "Tellerpauschale (Geschirr, Gläser, Besteck, Servietten)", price: "2,70 € p.P." },
];

const zubuchbareOptionen = [
  { label: "Servicemitarbeiter (1 auf 25 Personen)", price: "28 € / h", note: "Servieren, Ausgabe…" },
  { label: "Getränkeflatrate", price: "39,90 € p.P.", note: "ab 30 Personen" },
  { label: "Tischdeko", price: "9,90 € p.P.", note: "ab 20 Personen" },
  { label: "Live Cooking Station", price: "550 €", note: "ab 30 Personen" },
];

const tierColors: Record<string, string> = {
  basis: "border-border",
  komfort: "border-primary ring-2 ring-primary/20",
  premium: "border-accent ring-2 ring-accent/20",
};

// --- gallery images ---
const galleryImages = [
  { src: imgBuffet2, alt: "Deftige Wurst- und Käseplatten auf Schieferplatten" },
  { src: imgBuffet, alt: "Frisches Salatbuffet mit buntem Gemüse" },
  { src: imgBuffetLachs, alt: "Feines Lachs-Buffet" },
  { src: imgBuffetplatten, alt: "Reichhaltige Buffetplatten" },
  { src: imgFrisch, alt: "Frisch-fruchtiges Dessertbuffet" },
  { src: imgBusiness, alt: "Business-Catering für Firmenkunden" },
];

export default function Catering() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState("");
  const [guests, setGuests] = useState(50);
  const [budget, setBudget] = useState<number[]>([22]);
  const [selectedTier, setSelectedTier] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const packages = useMemo(() => computePackages(guests, occasion), [guests, occasion]);
  const canProceed = (step === 0 && occasion !== "") || (step === 1 && guests >= 10) || step === 2 || step === 3;
  const steps = ["Anlass", "Details", "Pakete", "Anfrage"];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      {/* ───── Hero ───── */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCatering} alt="Catering-Buffet im Freien" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
        </div>
        <div className="container relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground">
              <ChefHat className="mr-1 h-3 w-3" /> Catering aus Gera
            </Badge>
            <h1 className="mb-4 font-serif text-3xl md:text-5xl lg:text-6xl leading-tight">
              Catering & Events – frisch, regional, persönlich
            </h1>
            <p className="mb-4 text-2xl font-bold italic text-accent">
              „Weniger BLAA, mehr MHH…!"
            </p>
            <p className="mb-8 text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
              Ob Firmenfeier, Hochzeit oder Vereinsfest – wir bringen frische Küche aus
              Gera direkt zu Ihnen. Mit Liebe zubereitet, individuell geplant und immer mit
              dem gewissen Etwas.
            </p>
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8"
            >
              Jetzt Anfrage starten <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ───── Intro / Beschreibung ───── */}
      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 font-serif text-2xl md:text-4xl text-foreground">
              Ihr Event – unser Handwerk
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Bei CU Kantine & Catering steht Genuss im Mittelpunkt. Wir verwenden frische,
              regionale Zutaten und bereiten alles mit Sorgfalt und Leidenschaft zu. Egal ob
              ein elegantes 3-Gänge-Menü, ein rustikales Grillbuffet oder feine Häppchen zum
              Sektempfang – wir gestalten Ihr Catering ganz nach Ihren Wünschen.
            </p>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ChefHat,
              title: "Frisch & regional",
              text: "Alle Speisen werden frisch zubereitet – mit Zutaten aus der Region Gera und Ostthüringen.",
            },
            {
              icon: Users,
              title: "10 bis 300+ Gäste",
              text: "Vom intimen Dinner bis zum Großevent – wir passen Umfang und Service flexibel an Ihre Feier an.",
            },
            {
              icon: Star,
              title: "Rundum-sorglos",
              text: "Lieferung, Aufbau, Service und Abbau – auf Wunsch kümmern wir uns um alles, damit Sie feiern können.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-serif text-lg text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── Bildergalerie / Collage ───── */}
      <section className="bg-muted/50">
        <div className="container py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-3 font-serif text-2xl md:text-4xl text-foreground">
              Eindrücke unserer Veranstaltungen
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Von herzhaften Buffets bis zu edlen Platten – lassen Sie sich inspirieren.
            </p>
          </motion.div>

          {/* Masonry-style collage */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`overflow-hidden rounded-xl ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  style={{ aspectRatio: i === 0 ? "4/3" : "3/2" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Leistungen im Detail ───── */}
      <section className="container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 font-serif text-2xl md:text-3xl text-foreground">
              Was wir für Sie leisten
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              {[
                "Individuelle Menü- und Buffetplanung",
                "Frische Zubereitung am Veranstaltungstag",
                "Lieferung & Aufbau am Veranstaltungsort",
                "Geschirr, Besteck, Gläser & Tischdeko",
                "Professionelles Servicepersonal",
                "Getränkepauschalen & Barbetrieb",
                "Sonderwünsche: vegan, vegetarisch, allergiefrei",
                "Kompletter Abbau & Reinigung",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3"
          >
            <img src={imgBuffetplatten} alt="Buffetplatten" className="rounded-xl object-cover w-full aspect-square" loading="lazy" />
            <img src={imgFrisch} alt="Frisches Buffet" className="rounded-xl object-cover w-full aspect-square" loading="lazy" />
            <img src={imgBuffetLachs} alt="Lachs-Buffet" className="rounded-xl object-cover w-full aspect-[4/3] col-span-2" loading="lazy" />
          </motion.div>
        </div>
      </section>

      {/* ───── Konfigurator ───── */}
      <div ref={formRef} className="scroll-mt-24">
        <section className="bg-muted/30 border-t border-border">
          <div className="container py-16 md:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="mb-3 font-serif text-2xl md:text-4xl text-foreground">
                Catering konfigurieren & anfragen
              </h2>
              <p className="text-muted-foreground">
                In wenigen Schritten zu Ihrem individuellen Angebot – unverbindlich und kostenlos.
              </p>
            </div>

            {/* Progress */}
            <div className="mx-auto mb-10 max-w-2xl">
              <div className="flex items-center justify-between">
                {steps.map((label, i) => (
                  <div key={label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {i < step ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground hidden sm:block">{label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <AnimatePresence mode="wait">
                {/* Step 0 – Anlass */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <h3 className="mb-2 font-serif text-2xl text-foreground">Welcher Anlass?</h3>
                    <p className="mb-6 text-muted-foreground">Wählen Sie den Anlass – so können wir das passende Paket zusammenstellen.</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {occasions.map((o) => {
                        const Icon = o.icon;
                        const active = occasion === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => setOccasion(o.id)}
                            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-foreground">{o.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 1 – Details */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <h3 className="mb-2 font-serif text-2xl text-foreground">Wie viele Gäste?</h3>
                    <p className="mb-8 text-muted-foreground">Personenanzahl und ungefähres Budget helfen uns, passende Pakete vorzuschlagen.</p>
                    <div className="space-y-8">
                      <div>
                        <Label className="mb-3 block text-base font-medium">
                          Personenanzahl: <span className="text-primary font-bold">{guests}</span>
                        </Label>
                        <Slider value={[guests]} onValueChange={(v) => setGuests(v[0])} min={10} max={300} step={5} className="w-full" />
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>10</span><span>300</span></div>
                      </div>
                      <div>
                        <Label className="mb-3 block text-base font-medium">
                          Budget pro Person: <span className="text-primary font-bold">{budget[0]} €</span>
                        </Label>
                        <Slider value={budget} onValueChange={setBudget} min={10} max={50} step={1} className="w-full" />
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>10 €</span><span>50 €</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 – Pakete */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <h3 className="mb-2 font-serif text-2xl text-foreground">Unsere Paketvorschläge</h3>
                    <p className="mb-6 text-muted-foreground">
                      Für {guests} Gäste · {occasions.find((o) => o.id === occasion)?.label}
                    </p>
                    <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="grid gap-5 md:grid-cols-3">
                      {packages.map((pkg) => {
                        const active = selectedTier === pkg.tier;
                        const total = pkg.pricePerPerson * guests;
                        const fits = pkg.pricePerPerson <= budget[0];
                        return (
                          <label key={pkg.tier} className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${active ? tierColors[pkg.tier] : "border-border"} ${!fits ? "opacity-60" : ""}`}>
                            <RadioGroupItem value={pkg.tier} className="sr-only" />
                            {pkg.highlight && (
                              <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground">
                                <Star className="mr-1 h-3 w-3" /> {pkg.highlight}
                              </Badge>
                            )}
                            <h4 className="mb-1 font-serif text-lg text-foreground">{pkg.name}</h4>
                            <div className="mb-4 flex items-baseline gap-1">
                              {pkg.pricePerPerson > 0 ? (
                                <>
                                  <span className="text-2xl font-bold text-primary">{pkg.pricePerPerson.toFixed(2).replace(".", ",")} €</span>
                                  <span className="text-sm text-muted-foreground">/ Person</span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-primary">Auf Anfrage</span>
                              )}
                            </div>
                            <ul className="space-y-1.5 text-sm">
                              {pkg.includes.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                  <span className="text-muted-foreground">{item}</span>
                                </li>
                              ))}
                            </ul>
                            <Separator className="my-4" />
                            {pkg.pricePerPerson > 0 ? (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Gesamt ca.</span>
                                <span className="font-bold text-foreground">{(pkg.pricePerPerson * guests).toLocaleString("de-DE")} €</span>
                              </div>
                            ) : (
                              <div className="text-sm text-center text-muted-foreground">Individuelles Angebot</div>
                            )}
                            </div>
                            {!fits && <p className="mt-2 text-xs text-accent">Über Ihrem Budget von {budget[0]} €/Person</p>}
                          </label>
                        );
                      })}
                    </RadioGroup>
                    {/* Komfort Add-ons */}
                    {selectedTier === "komfort" && (
                      <div className="mt-6 space-y-4">
                        <h4 className="font-serif text-lg text-foreground">Im Komfort-Paket zusätzlich buchbar:</h4>
                        <div className="space-y-2">
                          {komfortAddons.map((a) => (
                            <div key={a.label} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2 text-sm">
                              <span>{a.label}</span>
                              <span className="font-medium text-primary">{a.price}</span>
                            </div>
                          ))}
                        </div>
                        <h4 className="font-serif text-lg text-foreground">Zubuchbare Optionen:</h4>
                        <div className="space-y-2">
                          {zubuchbareOptionen.map((o) => (
                            <div key={o.label} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2 text-sm">
                              <span>{o.label} {o.note && <span className="text-xs text-muted-foreground">({o.note})</span>}</span>
                              <span className="font-medium text-primary">{o.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      Bei geringerer Personenanzahl ändert sich der Preis. Fragen Sie gerne nach. Gerne erstellen wir Ihr individuelles Angebot.
                    </p>
                  </motion.div>
                )}

                {/* Step 3 – Anfrage */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <h3 className="mb-2 font-serif text-2xl text-foreground">Ihre Anfrage</h3>
                    <p className="mb-6 text-muted-foreground">
                      Wir erstellen Ihnen ein unverbindliches Angebot – kostenlos und persönlich.
                    </p>
                    <Card className="mb-6 border-primary/20 bg-primary/5">
                      <CardContent className="flex flex-wrap gap-4 p-4 text-sm">
                        <span><strong>Anlass:</strong> {occasions.find((o) => o.id === occasion)?.label}</span>
                        <span><strong>Gäste:</strong> {guests}</span>
                        <span><strong>Budget:</strong> {budget[0]} €/P.</span>
                        {selectedTier && <span><strong>Paket:</strong> {packages.find((p) => p.tier === selectedTier)?.name}</span>}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-4 p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><Label htmlFor="c-name">Name *</Label><Input id="c-name" placeholder="Ihr Name" /></div>
                          <div><Label htmlFor="c-phone">Telefon *</Label><Input id="c-phone" type="tel" placeholder="Für Rückruf" /></div>
                        </div>
                        <div><Label htmlFor="c-email">E-Mail *</Label><Input id="c-email" type="email" placeholder="Für das Angebot" /></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><Label htmlFor="c-date">Gewünschter Termin</Label><Input id="c-date" type="date" /></div>
                          <div><Label htmlFor="c-location">Veranstaltungsort</Label><Input id="c-location" placeholder="Adresse / Ort" /></div>
                        </div>
                        <div><Label htmlFor="c-message">Besondere Wünsche</Label><Textarea id="c-message" rows={4} placeholder="Allergien, Diätwünsche, Zeitrahmen …" /></div>
                        <Separator />
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                          <ChefHat className="mr-2 h-4 w-4" /> Angebot anfordern
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          Unverbindlich & kostenlos – Antwort innerhalb von 24 Stunden.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
                </Button>
                {step < 3 && (
                  <Button disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
                    Weiter <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ───── Contact bar ───── */}
      <section className="border-t border-border bg-card">
        <div className="container flex flex-wrap items-center justify-center gap-6 py-8 text-sm text-muted-foreground">
          <a href="tel:+493654222241" className="flex items-center gap-2 hover:text-primary">
            <Phone className="h-4 w-4" /> 0365 / 4222241
          </a>
          <a href="mailto:info@cu-kantine.de" className="flex items-center gap-2 hover:text-primary">
            <Mail className="h-4 w-4" /> info@cu-kantine.de
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Catering im Raum Gera & Ostthüringen
          </span>
        </div>
      </section>
    </Layout>
  );
}
