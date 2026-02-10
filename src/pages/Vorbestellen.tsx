import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShoppingCart, User, CreditCard, Check, Minus, Plus, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";

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
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { isOrderable, minutes, seconds };
}

const steps = [
  { icon: ShoppingCart, label: "Gericht wählen" },
  { icon: User, label: "Extras & Beilagen" },
  { icon: CreditCard, label: "Kontakt & Abholung" },
  { icon: Check, label: "Bestätigung" },
];

const sampleMenu = [
  { id: 1, name: "Schweinebraten mit Kartoffeln & Rotkohl", price: 6.5, remaining: 12, total: 20, vegetarian: false },
  { id: 2, name: "Hähnchenbrust mit Gemüsereis", price: 6.5, remaining: 8, total: 15, vegetarian: false },
  { id: 3, name: "Gemüse-Lasagne (vegetarisch)", price: 6.5, remaining: 15, total: 20, vegetarian: true },
  { id: 4, name: "Kartoffelsuppe mit Bockwurst", price: 2.5, remaining: 18, total: 25, vegetarian: false },
];

const extras = [
  { id: "salat", name: "Beilagensalat", price: 1.5 },
  { id: "suppe", name: "Tagessuppe", price: 2.0 },
  { id: "dessert", name: "Dessert des Tages", price: 1.5 },
  { id: "getraenk", name: "Softdrink 0,33l", price: 1.5 },
];

export default function Vorbestellen() {
  const { isOrderable, minutes, seconds } = useOrderableStatus();
  const [step, setStep] = useState(0);
  const [selectedDish, setSelectedDish] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", payment: "sumup" });

  const dish = sampleMenu.find((d) => d.id === selectedDish);
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const e = extras.find((x) => x.id === id);
    return sum + (e?.price ?? 0);
  }, 0);
  const total = ((dish?.price ?? 0) + extrasTotal) * quantity;

  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canProceed =
    step === 0 ? selectedDish !== null :
    step === 1 ? true :
    step === 2 ? contact.name.trim() && contact.phone.trim() : true;

  if (!isOrderable) {
    return (
      <Layout>
        <section className="container py-20 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-3 font-serif text-3xl">Vorbestellung aktuell nicht möglich</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Der Bestellzeitraum ist leider abgelaufen. Sie können werktags bis 11:15 Uhr für den gleichen Tag vorbestellen.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Telefonische Bestellung unter <a href="tel:+493654222241" className="text-primary hover:underline">0365 / 4222241</a>
          </p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Timer bar */}
      <div className="bg-accent text-accent-foreground">
        <div className="container flex items-center justify-center gap-2 py-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Bestellung noch möglich für <strong>{minutes}:{seconds.toString().padStart(2, "0")}</strong> Minuten
        </div>
      </div>

      <div className="container py-10">
        <h1 className="mb-2 font-serif text-3xl md:text-4xl">Mittagstisch vorbestellen</h1>
        <p className="mb-8 text-muted-foreground">BZO Gera/Zwötzen · Abholung 11:30 – 13:30 Uhr</p>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`hidden text-xs sm:block ${i <= step ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 0: Dish selection */}
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {sampleMenu.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDish === item.id ? "ring-2 ring-primary" : "border-border/50"
                    }`}
                    onClick={() => setSelectedDish(item.id)}
                  >
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="shrink-0 font-serif text-lg font-bold text-primary">
                          {item.price.toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={item.remaining <= 5 ? "text-accent font-medium" : "text-muted-foreground"}>
                          {item.remaining} von {item.total} verfügbar
                        </span>
                        {item.vegetarian && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Vegetarisch
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 1: Extras */}
            {step === 1 && (
              <div className="mx-auto max-w-xl space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Anzahl</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-xl font-bold">{quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(5, quantity + 1))}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extras & Beilagen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {extras.map((e) => (
                      <label
                        key={e.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                          selectedExtras.includes(e.id) ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedExtras.includes(e.id)}
                            onChange={() => toggleExtra(e.id)}
                            className="h-4 w-4 rounded border-border text-primary accent-primary"
                          />
                          <span className="font-medium">{e.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">+{e.price.toFixed(2).replace(".", ",")} €</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="mx-auto max-w-xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kontaktdaten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Ihr Name" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input id="phone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Für Rückfragen" />
                    </div>
                    <div>
                      <Label htmlFor="email">E-Mail (optional)</Label>
                      <Input id="email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Für Bestätigung" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Zahlungsart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={contact.payment} onValueChange={(v) => setContact({ ...contact, payment: v })}>
                      <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                        <RadioGroupItem value="sumup" id="sumup" />
                        <Label htmlFor="sumup" className="cursor-pointer">Online bezahlen (SumUp)</Label>
                      </div>
                      <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/50 p-3">
                        <RadioGroupItem value="bar" id="bar" />
                        <Label htmlFor="bar" className="cursor-pointer">Bar bei Abholung</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="mx-auto max-w-xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bestellübersicht</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{dish?.name}</span>
                      <span>{((dish?.price ?? 0) * quantity).toFixed(2).replace(".", ",")} €</span>
                    </div>
                    {quantity > 1 && <p className="text-sm text-muted-foreground">{quantity}× à {dish?.price.toFixed(2).replace(".", ",")} €</p>}

                    {selectedExtras.length > 0 && (
                      <>
                        <Separator />
                        {selectedExtras.map((id) => {
                          const e = extras.find((x) => x.id === id);
                          return (
                            <div key={id} className="flex justify-between text-sm">
                              <span>{quantity}× {e?.name}</span>
                              <span>{((e?.price ?? 0) * quantity).toFixed(2).replace(".", ",")} €</span>
                            </div>
                          );
                        })}
                      </>
                    )}

                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Gesamt</span>
                      <span className="text-primary">{total.toFixed(2).replace(".", ",")} €</span>
                    </div>

                    <Separator />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Name:</strong> {contact.name}</p>
                      <p><strong>Telefon:</strong> {contact.phone}</p>
                      {contact.email && <p><strong>E-Mail:</strong> {contact.email}</p>}
                      <p><strong>Zahlung:</strong> {contact.payment === "sumup" ? "Online (SumUp)" : "Bar bei Abholung"}</p>
                      <p><strong>Abholung:</strong> 11:30 – 13:30 Uhr, BZO Gera/Zwötzen</p>
                    </div>

                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                      Verbindlich bestellen
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Mit Klick auf „Verbindlich bestellen" akzeptieren Sie unsere AGB.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
          </Button>
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
              Weiter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Phone hint */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          Auch telefonisch unter{" "}
          <a href="tel:+493654222241" className="text-primary hover:underline">0365 / 4222241</a>
        </div>
      </div>
    </Layout>
  );
}
