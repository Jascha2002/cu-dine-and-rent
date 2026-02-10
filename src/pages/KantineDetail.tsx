import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, ArrowLeft, Download, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { standorte } from "./Kantinen";
import { useState, useEffect } from "react";

// Demo weekly menu
const demoMenu: Record<string, { menu1: string; menu2: string; veg: string; suppe: string; dessert: string; allergene?: string }> = {
  Montag: { menu1: "Schnitzel mit Kartoffelsalat", menu2: "Gulasch mit Klößen", veg: "Gemüselasagne", suppe: "Tomatensuppe", dessert: "Pudding", allergene: "A, C, G" },
  Dienstag: { menu1: "Hähnchenbrust mit Reis", menu2: "Rinderroulade mit Rotkohl", veg: "Spinat-Ricotta-Cannelloni", suppe: "Kartoffelsuppe", dessert: "Obstsalat", allergene: "A, G" },
  Mittwoch: { menu1: "Bratwurst mit Sauerkraut", menu2: "Fischfilet mit Petersilienkartoffeln", veg: "Thai-Gemüsecurry", suppe: "Linsensuppe", dessert: "Milchreis", allergene: "A, D, G" },
  Donnerstag: { menu1: "Schweinebraten mit Knödeln", menu2: "Putengeschnetzeltes", veg: "Falafel-Bowl", suppe: "Brokkolicremesuppe", dessert: "Quarkspeise", allergene: "A, G" },
  Freitag: { menu1: "Nudeln Bolognese", menu2: "Backfisch mit Remoulade", veg: "Gemüse-Quiche", suppe: "Minestrone", dessert: "Kuchen", allergene: "A, C, D, G" },
};

const kategorien = ["Fleisch", "Fisch", "Vegetarisch", "Vegan", "Suppe", "Dessert", "Salat"];

// Simulated favorites
const initialFavorites = [
  { name: "Schnitzel mit Kartoffelsalat", votes: 42, category: "Fleisch" },
  { name: "Gemüselasagne", votes: 35, category: "Vegetarisch" },
  { name: "Gulasch mit Klößen", votes: 28, category: "Fleisch" },
  { name: "Thai-Gemüsecurry", votes: 24, category: "Vegetarisch" },
  { name: "Bratwurst mit Sauerkraut", votes: 22, category: "Fleisch" },
  { name: "Fischfilet mit Petersilienkartoffeln", votes: 18, category: "Fisch" },
  { name: "Milchreis", votes: 15, category: "Dessert" },
  { name: "Tomatensuppe", votes: 12, category: "Suppe" },
  { name: "Falafel-Bowl", votes: 10, category: "Vegan" },
  { name: "Quarkspeise", votes: 8, category: "Dessert" },
];

function getKW() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime() + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
  const oneWeek = 604800000;
  return Math.ceil((diff / oneWeek + start.getDay() / 7));
}

export default function KantineDetail() {
  const { id } = useParams<{ id: string }>();
  const standort = standorte.find((s) => s.id === id);

  const [favorites, setFavorites] = useState(initialFavorites);
  const [newDish, setNewDish] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const voted = localStorage.getItem(`cu-voted-${id}`);
    if (voted) setHasVoted(true);
  }, [id]);

  if (!standort) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="mb-4 font-serif text-3xl">Standort nicht gefunden</h1>
          <Button asChild variant="outline"><Link to="/kantinen">Zurück zur Übersicht</Link></Button>
        </div>
      </Layout>
    );
  }

  const maxVotes = Math.max(...favorites.map((f) => f.votes));

  const handleVote = () => {
    if (!newDish.trim() || !newCategory || hasVoted) return;
    const existing = favorites.find((f) => f.name.toLowerCase() === newDish.trim().toLowerCase());
    let updated: typeof favorites;
    if (existing) {
      updated = favorites.map((f) => f.name.toLowerCase() === newDish.trim().toLowerCase() ? { ...f, votes: f.votes + 1 } : f);
    } else {
      updated = [...favorites, { name: newDish.trim(), votes: 1, category: newCategory }];
    }
    updated.sort((a, b) => b.votes - a.votes);
    setFavorites(updated.slice(0, 10));
    setNewDish("");
    setNewCategory("");
    setHasVoted(true);
    localStorage.setItem(`cu-voted-${id}`, "true");
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-10 md:py-16">
          <Link to="/kantinen" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" /> Alle Standorte
          </Link>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 font-serif text-3xl md:text-4xl">
            {standort.name}
          </motion.h1>
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {standort.address}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {standort.hours}</span>
            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {standort.phone}</span>
          </div>
        </div>
      </section>

      <div className="container py-10 md:py-16">
        {/* Description */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 max-w-2xl text-muted-foreground">
          {standort.description}
        </motion.p>

        {/* Weekly menu */}
        <section id="wochenkarte" className="mb-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl md:text-3xl">Wochenkarte – KW {getKW()}</h2>
            <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> PDF Export</Button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Tag</TableHead>
                    <TableHead>Menü 1 (6,50 €)</TableHead>
                    <TableHead>Menü 2 (6,50 €)</TableHead>
                    <TableHead>Vegetarisch (6,50 €)</TableHead>
                    <TableHead>Suppe (2,50 €)</TableHead>
                    <TableHead>Dessert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(demoMenu).map(([tag, m]) => (
                    <TableRow key={tag}>
                      <TableCell className="font-medium">{tag}</TableCell>
                      <TableCell>{m.menu1}</TableCell>
                      <TableCell>{m.menu2}</TableCell>
                      <TableCell>{m.veg}</TableCell>
                      <TableCell>{m.suppe}</TableCell>
                      <TableCell>{m.dessert}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <p className="mt-2 text-xs text-muted-foreground">Allergene: A = Gluten, C = Eier, D = Fisch, G = Milch. Änderungen vorbehalten.</p>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 md:hidden">
            {Object.entries(demoMenu).map(([tag, m]) => (
              <Card key={tag}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{tag}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><span className="font-medium text-primary">Menü 1:</span> {m.menu1} <span className="text-muted-foreground">(6,50 €)</span></div>
                  <div><span className="font-medium text-primary">Menü 2:</span> {m.menu2} <span className="text-muted-foreground">(6,50 €)</span></div>
                  <div><span className="font-medium text-primary">Veggie:</span> {m.veg} <span className="text-muted-foreground">(6,50 €)</span></div>
                  <div><span className="font-medium text-primary">Suppe:</span> {m.suppe} <span className="text-muted-foreground">(2,50 €)</span></div>
                  <div><span className="font-medium text-primary">Dessert:</span> {m.dessert}</div>
                  {m.allergene && <p className="text-xs text-muted-foreground">Allergene: {m.allergene}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Favorite dishes voting */}
        <section id="voting">
          <h2 className="mb-6 font-serif text-2xl md:text-3xl">Lieblingsgerichte</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Voting form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stimme für dein Lieblingsgericht</CardTitle>
              </CardHeader>
              <CardContent>
                {hasVoted ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ThumbsUp className="h-5 w-5 text-accent" /> Danke für deine Stimme! Du kannst einmal pro Gerät abstimmen.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="Name des Gerichts…"
                      value={newDish}
                      onChange={(e) => setNewDish(e.target.value)}
                      maxLength={100}
                    />
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                      <SelectContent>
                        {kategorien.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleVote} disabled={!newDish.trim() || !newCategory} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Abstimmen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top 10 ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Lieblingsgerichte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favorites.map((f, i) => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          <span className="mr-2 font-semibold text-primary">{i + 1}.</span>
                          {f.name}
                          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{f.category}</span>
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">{f.votes} Stimmen</span>
                      </div>
                      <Progress value={(f.votes / maxVotes) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
