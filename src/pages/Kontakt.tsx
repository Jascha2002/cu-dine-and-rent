import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

export default function Kontakt() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam check
    if (honeypot) return;

    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };
    if (!trimmed.name || !trimmed.email || !trimmed.message) {
      toast({ title: "Bitte alle Felder ausfüllen.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      toast({ title: "Bitte eine gültige E-Mail-Adresse eingeben.", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Simulate send – replace with edge function later
    setTimeout(() => {
      setLoading(false);
      setForm({ name: "", email: "", message: "" });
      toast({ title: "Nachricht gesendet!", description: "Wir melden uns schnellstmöglich bei Ihnen." });
    }, 800);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 font-serif text-4xl md:text-5xl"
          >
            Kontakt
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl text-lg text-primary-foreground/85"
          >
            Wir freuen uns über Ihre Nachricht – ob Frage, Bestellung oder Catering-Anfrage.
          </motion.p>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-8">
            <h2 className="font-serif text-2xl">So erreichen Sie uns</h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <a href="tel:+493654222241" className="text-muted-foreground hover:text-primary hover:underline">
                    0365 – 4222241
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">E-Mail</p>
                  <a href="mailto:info@cu-kantine.de" className="text-muted-foreground hover:text-primary hover:underline">
                    info@cu-kantine.de
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-muted-foreground">
                    CU Kantine &amp; Catering<br />
                    Lange Straße 52<br />
                    07551 Gera
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="mb-6 font-serif text-2xl">Nachricht senden</h2>
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Kontaktformular">
              {/* Honeypot – hidden from real users */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Ihr Name"
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre@email.de"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nachricht</Label>
                <Textarea
                  id="message"
                  placeholder="Ihre Nachricht an uns…"
                  rows={5}
                  maxLength={2000}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Wird gesendet…" : "Nachricht senden"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
