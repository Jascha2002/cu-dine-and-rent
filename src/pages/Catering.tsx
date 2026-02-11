import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Users, PartyPopper, Briefcase, Heart, GraduationCap, ArrowRight, ArrowLeft, Check, Phone, Mail, MapPin, Sparkles, Star, Euro } from "lucide-react";
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
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const
    }
  })
};
const occasions = [{
  id: "firmenfeier",
  label: "Firmenfeier",
  icon: Briefcase
}, {
  id: "hochzeit",
  label: "Hochzeit",
  icon: Heart
}, {
  id: "geburtstag",
  label: "Geburtstag / Jubiläum",
  icon: PartyPopper
}, {
  id: "seminar",
  label: "Seminar / Tagung",
  icon: GraduationCap
}, {
  id: "vereinsfest",
  label: "Vereins-/Dorffest",
  icon: Users
}, {
  id: "sonstiges",
  label: "Sonstiges",
  icon: Sparkles
}];
type Package = {
  name: string;
  tier: "basis" | "komfort" | "premium";
  pricePerPerson: number;
  includes: string[];
  highlight?: string;
};
function computePackages(guests: number, occasion: string): Package[] {
  const base = occasion === "hochzeit" ? 4 : occasion === "seminar" ? 2 : 0;
  return [{
    name: "Basis-Paket",
    tier: "basis",
    pricePerPerson: 12 + base,
    includes: ["Hauptgericht nach Wahl (3 Optionen)", "Beilagen-Buffet", "Softgetränke inklusive", "Geschirr & Besteck", "Anlieferung & Abholung"]
  }, {
    name: "Komfort-Paket",
    tier: "komfort",
    pricePerPerson: 22 + base,
    highlight: "Beliebteste Wahl",
    includes: ["Vorspeisen-Auswahl (2 Optionen)", "Hauptgericht (4 Optionen inkl. vegetarisch)", "Dessert-Buffet", "Getränke-Flatrate (Soft + Bier)", "Servicepersonal (1 pro 25 Gäste)", "Tisch-Dekoration Standard", "Geschirr, Besteck & Gläser"]
  }, {
    name: "Premium-Paket",
    tier: "premium",
    pricePerPerson: 35 + base,
    includes: ["Sektempfang mit Häppchen", "3-Gänge-Menü oder Premium-Buffet", "Live-Cooking-Station", "Getränke-Flatrate (komplett)", "Servicepersonal (1 pro 15 Gäste)", "Individuelle Tisch-Dekoration", "Premium-Geschirr & Kristallgläser", "Auf-/Abbau inklusive"]
  }];
}
const tierColors: Record<string, string> = {
  basis: "border-border",
  komfort: "border-primary ring-2 ring-primary/20",
  premium: "border-accent ring-2 ring-accent/20"
};
export default function Catering() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState("");
  const [guests, setGuests] = useState(50);
  const [budget, setBudget] = useState<number[]>([22]);
  const [selectedTier, setSelectedTier] = useState("");
  const packages = useMemo(() => computePackages(guests, occasion), [guests, occasion]);
  const canProceed = step === 0 && occasion !== "" || step === 1 && guests >= 10 || step === 2 || step === 3;
  const steps = ["Anlass", "Details", "Pakete", "Anfrage"];
  return <Layout>
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCatering} alt="Catering-Buffet im Freien" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
        </div>
        <div className="container relative py-16 md:py-20 opacity-100 bg-black/0">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <h1 className="mb-3 font-serif text-3xl md:text-5xl">Catering-Service</h1>
            <p className="max-w-xl text-lg text-primary-foreground/80">
              Von der intimen Feier bis zum Großevent – wir bringen frische Küche aus Gera direkt zu Ihnen. Konfigurieren Sie Ihr individuelles Catering-Paket.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Configurator */}
      <section className="container py-12 md:py-16">
        {/* Progress */}
        <div className="mx-auto mb-10 max-w-2xl">
          <div className="flex items-center justify-between">
            {steps.map((label, i) => <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground hidden sm:block">{label}</span>
                </div>
                {i < steps.length - 1 && <div className={`mx-2 h-0.5 flex-1 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>)}
          </div>
        </div>

        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {/* Step 0 – Anlass */}
            {step === 0 && <motion.div key="s0" initial={{
            opacity: 0,
            x: 30
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -30
          }}>
                <h2 className="mb-2 font-serif text-2xl">Welcher Anlass?</h2>
                <p className="mb-6 text-muted-foreground">Wählen Sie den Anlass – so können wir das passende Paket zusammenstellen.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {occasions.map(o => {
                const Icon = o.icon;
                const active = occasion === o.id;
                return <button key={o.id} onClick={() => setOccasion(o.id)} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{o.label}</span>
                      </button>;
              })}
                </div>
              </motion.div>}

            {/* Step 1 – Details */}
            {step === 1 && <motion.div key="s1" initial={{
            opacity: 0,
            x: 30
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -30
          }}>
                <h2 className="mb-2 font-serif text-2xl">Wie viele Gäste?</h2>
                <p className="mb-8 text-muted-foreground">Personenanzahl und ungefähres Budget helfen uns, passende Pakete vorzuschlagen.</p>

                <div className="space-y-8">
                  <div>
                    <Label className="mb-3 block text-base font-medium">
                      Personenanzahl: <span className="text-primary font-bold">{guests}</span>
                    </Label>
                    <Slider value={[guests]} onValueChange={v => setGuests(v[0])} min={10} max={300} step={5} className="w-full" />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>10</span><span>300</span>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block text-base font-medium">
                      Budget pro Person: <span className="text-primary font-bold">{budget[0]} €</span>
                    </Label>
                    <Slider value={budget} onValueChange={setBudget} min={10} max={50} step={1} className="w-full" />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>10 €</span><span>50 €</span>
                    </div>
                  </div>
                </div>
              </motion.div>}

            {/* Step 2 – Pakete */}
            {step === 2 && <motion.div key="s2" initial={{
            opacity: 0,
            x: 30
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -30
          }}>
                <h2 className="mb-2 font-serif text-2xl">Unsere Paketvorschläge</h2>
                <p className="mb-6 text-muted-foreground">
                  Für {guests} Gäste · {occasions.find(o => o.id === occasion)?.label}
                </p>

                <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="grid gap-5 md:grid-cols-3">
                  {packages.map(pkg => {
                const active = selectedTier === pkg.tier;
                const total = pkg.pricePerPerson * guests;
                const fits = pkg.pricePerPerson <= budget[0];
                return <label key={pkg.tier} className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${active ? tierColors[pkg.tier] : "border-border"} ${!fits ? "opacity-60" : ""}`}>
                        <RadioGroupItem value={pkg.tier} className="sr-only" />
                        {pkg.highlight && <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground">
                            <Star className="mr-1 h-3 w-3" /> {pkg.highlight}
                          </Badge>}
                        <h3 className="mb-1 font-serif text-lg">{pkg.name}</h3>
                        <div className="mb-4 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{pkg.pricePerPerson} €</span>
                          <span className="text-sm text-muted-foreground">/ Person</span>
                        </div>
                        <ul className="space-y-1.5 text-sm">
                          {pkg.includes.map(item => <li key={item} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                              <span>{item}</span>
                            </li>)}
                        </ul>
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Gesamt ca.</span>
                          <span className="font-bold">{total.toLocaleString("de-DE")} €</span>
                        </div>
                        {!fits && <p className="mt-2 text-xs text-accent">Über Ihrem Budget von {budget[0]} €/Person</p>}
                      </label>;
              })}
                </RadioGroup>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Alle Preise sind Richtwerte. Wir erstellen Ihnen ein individuelles Angebot.
                </p>
              </motion.div>}

            {/* Step 3 – Anfrage */}
            {step === 3 && <motion.div key="s3" initial={{
            opacity: 0,
            x: 30
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -30
          }}>
                <h2 className="mb-2 font-serif text-2xl">Ihre Anfrage</h2>
                <p className="mb-6 text-muted-foreground">
                  Wir erstellen Ihnen ein unverbindliches Angebot – kostenlos und persönlich.
                </p>

                {/* Summary */}
                <Card className="mb-6 border-primary/20 bg-primary/5">
                  <CardContent className="flex flex-wrap gap-4 p-4 text-sm">
                    <span><strong>Anlass:</strong> {occasions.find(o => o.id === occasion)?.label}</span>
                    <span><strong>Gäste:</strong> {guests}</span>
                    <span><strong>Budget:</strong> {budget[0]} €/P.</span>
                    {selectedTier && <span><strong>Paket:</strong> {packages.find(p => p.tier === selectedTier)?.name}</span>}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="c-name">Name *</Label>
                        <Input id="c-name" placeholder="Ihr Name" />
                      </div>
                      <div>
                        <Label htmlFor="c-phone">Telefon *</Label>
                        <Input id="c-phone" type="tel" placeholder="Für Rückruf" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="c-email">E-Mail *</Label>
                      <Input id="c-email" type="email" placeholder="Für das Angebot" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="c-date">Gewünschter Termin</Label>
                        <Input id="c-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="c-location">Veranstaltungsort</Label>
                        <Input id="c-location" placeholder="Adresse / Ort" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="c-message">Besondere Wünsche</Label>
                      <Textarea id="c-message" rows={4} placeholder="Allergien, Diätwünsche, Zeitrahmen …" />
                    </div>

                    <Separator />

                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                      <ChefHat className="mr-2 h-4 w-4" /> Angebot anfordern
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Unverbindlich & kostenlos – Antwort innerhalb von 24 Stunden.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
            </Button>
            {step < 3 && <Button disabled={!canProceed} onClick={() => setStep(s => s + 1)}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>}
          </div>
        </div>
      </section>

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
            <MapPin className="h-4 w-4" /> Catering im Raum Gera & Ostthüringen
          </span>
        </div>
      </section>
    </Layout>;
}