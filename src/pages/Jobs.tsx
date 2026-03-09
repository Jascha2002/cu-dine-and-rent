import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase, Send, MessageCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen lang sein").max(100),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse ein").max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
});

const WHATSAPP_NUMBER = "493654222241";

export default function Jobs() {
  const { toast } = useToast();
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (jobId: string) => {
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Fehler", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("job_applications").insert({
      job_id: jobId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "",
      message: parsed.data.message || "",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Fehler", description: "Bewerbung konnte nicht gesendet werden.", variant: "destructive" });
      return;
    }
    toast({ title: "Bewerbung gesendet!", description: "Vielen Dank – wir melden uns bei Ihnen." });
    setForm({ name: "", email: "", phone: "", message: "" });
    setApplyingTo(null);
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-14 md:py-20">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 font-serif text-4xl md:text-5xl">
            Karriere bei CU Kantine
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-xl text-primary-foreground/80">
            Werden Sie Teil unseres Teams! Wir suchen engagierte Mitarbeiter für unsere Standorte in Gera.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-3 text-2xl font-bold italic text-accent">
            „Weniger BLAA, mehr MHH…!"
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-4 text-sm text-primary-foreground/70">
            Ansprechpartnerin: Josefine Fritzsche · <a href="mailto:fritzsche@cu-kantine.de" className="underline hover:text-primary-foreground">fritzsche@cu-kantine.de</a>
          </motion.p>
        </div>
      </section>

      <section className="container py-12 md:py-20">
        {/* WhatsApp quick apply */}
        <Card className="mb-10 border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <MessageCircle className="h-8 w-8 shrink-0 text-accent" />
            <div className="flex-1">
              <h3 className="font-serif text-lg font-semibold">Kurzbewerbung per WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Schicken Sie uns einfach eine Nachricht mit Ihrem Namen und der gewünschten Stelle.
              </p>
            </div>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hallo, ich interessiere mich für eine Stelle bei CU Kantine.")}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp öffnen
              </a>
            </Button>
          </CardContent>
        </Card>

        {isLoading && <p className="text-muted-foreground">Stellenanzeigen werden geladen…</p>}

        {!isLoading && jobs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="font-serif text-xl">Aktuell keine offenen Stellen</h3>
              <p className="mt-2 text-sm text-muted-foreground">Schauen Sie bald wieder vorbei oder senden Sie uns eine Initiativbewerbung per WhatsApp.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif text-xl md:text-2xl">{job.title}</CardTitle>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {job.location}</span>
                        <Badge variant="secondary">{job.employment_type}</Badge>
                      </div>
                    </div>
                    {expandedJob === job.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </CardHeader>

                {expandedJob === job.id && (
                  <CardContent className="space-y-6 border-t pt-6">
                    <div>
                      <h4 className="mb-2 font-semibold">Beschreibung</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
                    </div>
                    {job.requirements && (
                      <div>
                        <h4 className="mb-2 font-semibold">Anforderungen</h4>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {job.requirements.split(", ").map((r, idx) => <li key={idx}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                    {job.benefits && (
                      <div>
                        <h4 className="mb-2 font-semibold">Wir bieten</h4>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {job.benefits.split(", ").map((b, idx) => <li key={idx}>{b}</li>)}
                        </ul>
                      </div>
                    )}

                    {applyingTo === job.id ? (
                      <div className="rounded-lg border bg-muted/30 p-6">
                        <h4 className="mb-4 font-serif text-lg font-semibold">Jetzt bewerben</h4>
                        <div className="space-y-3">
                          <Input placeholder="Ihr Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
                          <Input placeholder="E-Mail-Adresse *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
                          <Input placeholder="Telefonnummer" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} />
                          <Textarea placeholder="Ihre Nachricht / Kurzvorstellung" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={4} />
                          <div className="flex gap-3">
                            <Button onClick={() => handleSubmit(job.id)} disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                              <Send className="mr-2 h-4 w-4" /> {submitting ? "Wird gesendet…" : "Bewerbung absenden"}
                            </Button>
                            <Button variant="ghost" onClick={() => setApplyingTo(null)}>Abbrechen</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => setApplyingTo(job.id)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <ArrowRight className="mr-2 h-4 w-4" /> Jetzt bewerben
                        </Button>
                        <Button asChild variant="outline">
                          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hallo, ich interessiere mich für die Stelle "${job.title}" am Standort ${job.location}.`)}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-4 w-4" /> Per WhatsApp bewerben
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
