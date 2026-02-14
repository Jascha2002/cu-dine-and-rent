import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, ArrowLeft, Download, ThumbsUp, Mail, FileText, CalendarDays, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { standorte } from "./Kantinen";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getISOWeek, getYear, startOfISOWeek, addDays, format } from "date-fns";
import { de } from "date-fns/locale";

const kategorien = ["Fleisch", "Fisch", "Vegetarisch", "Vegan", "Suppe", "Dessert", "Salat"];
const CATEGORY_LABELS: Record<string, string> = {
  menu1: "Menü 1", menu2: "Menü 2", vegetarisch: "Vegetarisch", suppe: "Tagessuppe", dessert: "Dessert",
};
const CATEGORY_ORDER = ["menu1", "menu2", "vegetarisch", "suppe", "dessert"];
const DAY_NAMES = ["Montag", "Dienstag", "Mittwoch", "Donnerstag"];

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

type DishImage = { id: string; name: string; image_url: string };
type MenuItem = {
  id: string; day_of_week: number; category: string; name: string;
  description: string; price: number; dish_image_id: string | null; is_active: boolean;
};

function getKW() {
  return getISOWeek(new Date());
}

function BistroOpheliaMenus() {
  const [speiseplanUrl, setSpeiseplanUrl] = useState<string | null>(null);
  const [snackkarteUrl, setSnackkarteUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: files } = await supabase.storage.from("menus").list("bistro-ophelia");
      if (files) {
        if (files.find((f) => f.name === "speiseplan")) {
          const { data } = supabase.storage.from("menus").getPublicUrl("bistro-ophelia/speiseplan");
          setSpeiseplanUrl(data.publicUrl);
        }
        if (files.find((f) => f.name === "snackkarte")) {
          const { data } = supabase.storage.from("menus").getPublicUrl("bistro-ophelia/snackkarte");
          setSnackkarteUrl(data.publicUrl);
        }
      }
    };
    load();
  }, []);

  if (!speiseplanUrl && !snackkarteUrl) return null;

  return (
    <section className="mb-14">
      <h2 className="mb-6 font-serif text-2xl md:text-3xl">Speisekarten</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {speiseplanUrl && (
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <FileText className="h-10 w-10 shrink-0 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">Wechselnder Speiseplan</h3>
                <p className="text-sm text-muted-foreground">Aktuelle Wochenkarte</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={speiseplanUrl} target="_blank" rel="noopener noreferrer">Anzeigen</a>
              </Button>
            </CardContent>
          </Card>
        )}
        {snackkarteUrl && (
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <FileText className="h-10 w-10 shrink-0 text-accent" />
              <div className="flex-1">
                <h3 className="font-semibold">Snack-Karte</h3>
                <p className="text-sm text-muted-foreground">Snacks & Getränke</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={snackkarteUrl} target="_blank" rel="noopener noreferrer">Anzeigen</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

function WeeklyMenuFromDB({ kantineId }: { kantineId: string }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dishImages, setDishImages] = useState<DishImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState(0);
  const [year, setYear] = useState(0);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const currentWeek = getISOWeek(now);
      const currentYear = getYear(now);

      // Find published menu for current week
      const { data: menu } = await supabase
        .from("weekly_menus")
        .select("id, week_number, year")
        .eq("is_published", true)
        .eq("week_number", currentWeek)
        .eq("year", currentYear)
        .maybeSingle();

      if (!menu) {
        setLoading(false);
        return;
      }

      setWeekNumber(menu.week_number);
      setYear(menu.year);

      const [itemsRes, imagesRes] = await Promise.all([
        supabase.from("daily_menu_items").select("*").eq("weekly_menu_id", menu.id).eq("is_active", true),
        supabase.from("dish_images").select("id, name, image_url"),
      ]);

      setMenuItems((itemsRes.data || []).map(d => ({
        id: d.id, day_of_week: d.day_of_week, category: d.category, name: d.name,
        description: d.description || "", price: Number(d.price), dish_image_id: d.dish_image_id,
        is_active: d.is_active,
      })));
      setDishImages(imagesRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const groupedByDay = useMemo(() => {
    const days: Record<number, MenuItem[]> = {};
    for (const item of menuItems) {
      if (!days[item.day_of_week]) days[item.day_of_week] = [];
      days[item.day_of_week].push(item);
    }
    // Sort items within each day by category order
    for (const day in days) {
      days[day].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
    }
    return days;
  }, [menuItems]);

  if (loading) {
    return (
      <section id="wochenkarte" className="mb-14">
        <h2 className="mb-6 font-serif text-2xl md:text-3xl">Wochenkarte</h2>
        <p className="text-muted-foreground">Laden…</p>
      </section>
    );
  }

  if (menuItems.length === 0) {
    return (
      <section id="wochenkarte" className="mb-14">
        <h2 className="mb-6 font-serif text-2xl md:text-3xl">Wochenkarte</h2>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Für diese Woche ist noch keine Speisekarte verfügbar.</p>
            <Link to="/vorbestellen">
              <Button variant="outline" size="sm">Vorbestellungen prüfen</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="wochenkarte" className="mb-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl md:text-3xl">Wochenkarte – KW {weekNumber}</h2>
        <Link to="/vorbestellen">
          <Button size="sm" className="gap-1">Jetzt vorbestellen</Button>
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Tag</TableHead>
                {CATEGORY_ORDER.map(cat => (
                  <TableHead key={cat}>{CATEGORY_LABELS[cat]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[0, 1, 2, 3].map(dayIdx => {
                const items = groupedByDay[dayIdx] || [];
                if (items.length === 0) return null;
                return (
                  <TableRow key={dayIdx}>
                    <TableCell className="font-medium">{DAY_NAMES[dayIdx]}</TableCell>
                    {CATEGORY_ORDER.map(cat => {
                      const item = items.find(i => i.category === cat);
                      return (
                        <TableCell key={cat}>
                          {item ? (
                            <div>
                              <span>{item.name}</span>
                              {item.price > 0 && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({item.price.toFixed(2).replace(".", ",")} €)
                                </span>
                              )}
                            </div>
                          ) : "–"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
        <p className="mt-2 text-xs text-muted-foreground">Änderungen vorbehalten.</p>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {[0, 1, 2, 3].map(dayIdx => {
          const items = groupedByDay[dayIdx] || [];
          if (items.length === 0) return null;
          return (
            <Card key={dayIdx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{DAY_NAMES[dayIdx]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {items.map(item => {
                  const img = dishImages.find(di => di.id === item.dish_image_id);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {img && <img src={img.image_url} alt={img.name} className="h-12 w-12 rounded object-cover" />}
                      <div className="flex-1">
                        <span className="font-medium text-primary">{CATEGORY_LABELS[item.category]}:</span>{" "}
                        {item.name}
                        {item.price > 0 && (
                          <span className="ml-1 text-muted-foreground">
                            ({item.price.toFixed(2).replace(".", ",")} €)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
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
          {(standort as any).subtitle && (
            <p className="mb-2 text-sm text-primary-foreground/70">{(standort as any).subtitle}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {standort.address}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {standort.hours}</span>
            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {standort.phone}</span>
            {id === "theater" && (
              <a href="mailto:bistro-ophelia@cu-kantine.de" className="flex items-center gap-1 hover:text-primary-foreground">
                <Mail className="h-4 w-4" /> bistro-ophelia@cu-kantine.de
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container py-10 md:py-16">
        {/* Description */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 max-w-2xl text-muted-foreground">
          {standort.description}
        </motion.p>

        {/* Bistro Ophelia menu downloads */}
        {id === "theater" && <BistroOpheliaMenus />}

        {/* Weekly menu from DB (only for BZO) */}
        {id === "bzo" && <WeeklyMenuFromDB kantineId="bzo" />}

        {/* Favorite dishes voting (only for BZO) */}
        {id === "bzo" && (
          <section id="voting">
            <h2 className="mb-6 font-serif text-2xl md:text-3xl">Lieblingsgerichte</h2>
            <div className="grid gap-8 lg:grid-cols-2">
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
                      <Input placeholder="Name des Gerichts…" value={newDish} onChange={(e) => setNewDish(e.target.value)} maxLength={100} />
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
        )}
      </div>
    </Layout>
  );
}
