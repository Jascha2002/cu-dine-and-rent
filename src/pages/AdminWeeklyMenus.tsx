import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, Save, Search } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag"];
const CATEGORIES = [
  { value: "menu1", label: "Menü 1", defaultPrice: 6.5 },
  { value: "menu2", label: "Menü 2", defaultPrice: 6.5 },
  { value: "vegetarisch", label: "Vegetarisch", defaultPrice: 6.5 },
  { value: "suppe", label: "Tagessuppe", defaultPrice: 2.5 },
  { value: "dessert", label: "Dessert", defaultPrice: 0 },
];

type DishImage = { id: string; name: string; image_url: string; tags: string[] };
type MenuDish = { id: string; name: string; category: string; default_price: number; dish_image_id: string | null };
type MenuItem = {
  id?: string;
  day_of_week: number;
  category: string;
  name: string;
  description: string;
  price: number;
  dish_image_id: string | null;
  is_active: boolean;
  max_quantity: number;
};
type WeeklyMenu = { id: string; year: number; week_number: number; is_published: boolean };

function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Returns the Monday of ISO week */
function getDateOfISOWeek(week: number, year: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  return monday;
}

function formatDateRange(week: number, year: number) {
  const monday = getDateOfISOWeek(week, year);
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  const fmt = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
  return `${fmt(monday)} – ${fmt(friday)}`;
}

export default function AdminWeeklyMenus() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dishImages, setDishImages] = useState<DishImage[]>([]);
  const [menuDishes, setMenuDishes] = useState<MenuDish[]>([]);
  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<WeeklyMenu | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [newImageName, setNewImageName] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeDay, setActiveDay] = useState("0");
  const [dishSearch, setDishSearch] = useState("");
  const [newWeekCount, setNewWeekCount] = useState(1);

  // Auth check
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!roles?.length) { await supabase.auth.signOut(); navigate("/admin"); return; }
      setLoading(false);
    };
    check();
  }, [navigate]);

  const loadData = useCallback(async () => {
    const [imgRes, menuRes, dishRes] = await Promise.all([
      supabase.from("dish_images").select("*").order("name"),
      supabase.from("weekly_menus").select("*").order("year", { ascending: false }).order("week_number", { ascending: false }).limit(20),
      supabase.from("menu_dishes").select("*").eq("is_active", true).order("name"),
    ]);
    setDishImages(imgRes.data || []);
    setWeeklyMenus(menuRes.data || []);
    setMenuDishes(dishRes.data || []);
  }, []);

  useEffect(() => { if (!loading) loadData(); }, [loading, loadData]);

  useEffect(() => {
    if (!selectedMenu) { setMenuItems([]); return; }
    const load = async () => {
      const { data } = await supabase.from("daily_menu_items").select("*").eq("weekly_menu_id", selectedMenu.id);
      setMenuItems((data || []).map(d => ({
        id: d.id, day_of_week: d.day_of_week, category: d.category, name: d.name,
        description: d.description || "", price: Number(d.price), dish_image_id: d.dish_image_id,
        is_active: d.is_active, max_quantity: d.max_quantity || 20,
      })));
    };
    load();
  }, [selectedMenu]);

  // Create new weekly menu(s)
  const createMenus = async () => {
    const now = new Date();
    // Find the latest existing week
    const existingWeeks = weeklyMenus.map(m => m.year * 100 + m.week_number);
    let startWeek: Date;
    if (existingWeeks.length > 0) {
      const latest = weeklyMenus[0];
      startWeek = getDateOfISOWeek(latest.week_number, latest.year);
      startWeek.setUTCDate(startWeek.getUTCDate() + 7);
    } else {
      startWeek = new Date(now);
      startWeek.setDate(now.getDate() + 7);
    }

    let created = 0;
    for (let i = 0; i < newWeekCount; i++) {
      const d = new Date(startWeek);
      d.setUTCDate(startWeek.getUTCDate() + i * 7);
      const year = d.getUTCFullYear();
      const week = getISOWeek(d);
      const { error } = await supabase.from("weekly_menus").insert({ year, week_number: week });
      if (!error) created++;
      else if (error.code !== "23505") { toast.error("Fehler beim Erstellen"); return; }
    }
    if (created > 0) {
      toast.success(`${created} Woche(n) erstellt`);
      await loadData();
    } else {
      toast.info("Wochen existieren bereits");
    }
  };

  const addItemFromDish = (day: number, category: string, dish: MenuDish) => {
    // Check for duplicates
    const existing = menuItems.find(i => i.day_of_week === day && i.name === dish.name);
    if (existing) { toast.error("Gericht bereits für diesen Tag angelegt"); return; }
    setMenuItems(prev => [...prev, {
      day_of_week: day, category, name: dish.name, description: "",
      price: dish.default_price, dish_image_id: dish.dish_image_id,
      is_active: true, max_quantity: 20,
    }]);
  };

  const addEmptyItem = (day: number, category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    setMenuItems(prev => [...prev, {
      day_of_week: day, category, name: "", description: "",
      price: cat?.defaultPrice || 0, dish_image_id: null,
      is_active: true, max_quantity: 20,
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setMenuItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = async (index: number) => {
    const item = menuItems[index];
    if (item.id) await supabase.from("daily_menu_items").delete().eq("id", item.id);
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    if (!selectedMenu) return;
    setSaving(true);
    try {
      for (const item of menuItems) {
        const payload = {
          weekly_menu_id: selectedMenu.id, day_of_week: item.day_of_week, category: item.category,
          name: item.name, description: item.description, price: item.price,
          dish_image_id: item.dish_image_id, is_active: item.is_active, max_quantity: item.max_quantity,
        };
        if (item.id) {
          await supabase.from("daily_menu_items").update(payload).eq("id", item.id);
        } else {
          const { data } = await supabase.from("daily_menu_items").insert(payload).select().single();
          if (data) item.id = data.id;
        }
      }
      toast.success("Gespeichert!");
    } catch { toast.error("Fehler beim Speichern"); }
    setSaving(false);
  };

  const togglePublish = async () => {
    if (!selectedMenu) return;
    const next = !selectedMenu.is_published;
    await supabase.from("weekly_menus").update({ is_published: next }).eq("id", selectedMenu.id);
    setSelectedMenu({ ...selectedMenu, is_published: next });
    setWeeklyMenus(prev => prev.map(m => m.id === selectedMenu.id ? { ...m, is_published: next } : m));
    toast.success(next ? "Veröffentlicht" : "Zurückgezogen");
  };

  const uploadDishImage = async () => {
    if (!newImageFile || !newImageName.trim()) return;
    setUploadingImage(true);
    const ext = newImageFile.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("dish-images").upload(path, newImageFile);
    if (upErr) { toast.error("Upload fehlgeschlagen"); setUploadingImage(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("dish-images").getPublicUrl(path);
    await supabase.from("dish_images").insert({ name: newImageName.trim(), image_url: publicUrl });
    toast.success("Bild hinzugefügt");
    setNewImageName(""); setNewImageFile(null); setUploadingImage(false); setImageDialogOpen(false);
    loadData();
  };

  const deleteDishImage = async (img: DishImage) => {
    const path = img.image_url.split("/dish-images/")[1];
    if (path) await supabase.storage.from("dish-images").remove([path]);
    await supabase.from("dish_images").delete().eq("id", img.id);
    setDishImages(prev => prev.filter(i => i.id !== img.id));
    toast.success("Bild gelöscht");
  };

  if (loading) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Laden…</p></div></Layout>;

  const dayItems = (day: number) => menuItems.filter(i => i.day_of_week === day);

  const filteredDishes = (category: string) => {
    const catFilter = category === "menu1" || category === "menu2" ? "menu1" : category;
    return menuDishes
      .filter(d => d.category === catFilter || (catFilter === "menu1" && d.category === "menu2"))
      .filter(d => !dishSearch || d.name.toLowerCase().includes(dishSearch.toLowerCase()));
  };

  return (
    <Layout>
      <div className="bg-muted/30 min-h-[80vh]">
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-3 py-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="font-serif text-xl font-bold">Wochenkarten-Verwaltung</h1>
          </div>
        </div>

        <div className="container py-8">
          <Tabs defaultValue="menus">
            <TabsList className="mb-6">
              <TabsTrigger value="menus">Wochenkarten</TabsTrigger>
              <TabsTrigger value="dishes">Gerichtekatalog</TabsTrigger>
              <TabsTrigger value="images">Bilderbibliothek</TabsTrigger>
            </TabsList>

            {/* === MENUS TAB === */}
            <TabsContent value="menus" className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedMenu?.id || ""} onValueChange={v => setSelectedMenu(weeklyMenus.find(m => m.id === v) || null)}>
                  <SelectTrigger className="w-80"><SelectValue placeholder="Woche wählen…" /></SelectTrigger>
                  <SelectContent>
                    {weeklyMenus.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        KW {m.week_number}/{m.year} — {formatDateRange(m.week_number, m.year)} {m.is_published ? "✓" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} max={12} value={newWeekCount} onChange={e => setNewWeekCount(parseInt(e.target.value) || 1)} className="w-16" />
                  <Button variant="outline" onClick={createMenus}><Plus className="mr-2 h-4 w-4" /> Woche(n) erstellen</Button>
                </div>
                {selectedMenu && (
                  <>
                    <Button variant={selectedMenu.is_published ? "destructive" : "default"} onClick={togglePublish}>
                      {selectedMenu.is_published ? <><EyeOff className="mr-2 h-4 w-4" /> Zurückziehen</> : <><Eye className="mr-2 h-4 w-4" /> Veröffentlichen</>}
                    </Button>
                    <Button onClick={saveAll} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? "Speichert…" : "Alles speichern"}</Button>
                  </>
                )}
              </div>

              {selectedMenu && (
                <>
                  <div className="rounded-lg border border-border bg-card p-3 text-sm font-medium">
                    KW {selectedMenu.week_number}/{selectedMenu.year} — {formatDateRange(selectedMenu.week_number, selectedMenu.year)}
                  </div>
                  <Tabs value={activeDay} onValueChange={setActiveDay}>
                    <TabsList>
                      {DAYS.map((d, i) => <TabsTrigger key={i} value={String(i)}>{d}</TabsTrigger>)}
                    </TabsList>
                    {DAYS.map((_, dayIdx) => (
                      <TabsContent key={dayIdx} value={String(dayIdx)} className="space-y-4 mt-4">
                        {CATEGORIES.map(cat => {
                          const items = dayItems(dayIdx).filter(i => i.category === cat.value);
                          const dishes = filteredDishes(cat.value);
                          return (
                            <Card key={cat.value}>
                              <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base">{cat.label}</CardTitle>
                                <div className="flex items-center gap-2">
                                  {items.length === 0 && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm"><Search className="mr-1 h-4 w-4" /> Aus Katalog wählen</Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-h-[70vh] overflow-y-auto">
                                        <DialogHeader><DialogTitle>Gericht wählen – {cat.label}</DialogTitle></DialogHeader>
                                        <Input placeholder="Suchen…" value={dishSearch} onChange={e => setDishSearch(e.target.value)} className="mb-3" />
                                        <div className="space-y-1">
                                          {dishes.map(d => {
                                            const img = dishImages.find(di => di.id === d.dish_image_id);
                                            return (
                                              <button key={d.id} onClick={() => { addItemFromDish(dayIdx, cat.value, d); setDishSearch(""); }}
                                                className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted transition-colors">
                                                {img ? <img src={img.image_url} alt={img.name} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
                                                <span className="text-sm">{d.name}</span>
                                              </button>
                                            );
                                          })}
                                          {dishes.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Keine Gerichte gefunden</p>}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {items.length === 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => addEmptyItem(dayIdx, cat.value)}>
                                      <Plus className="mr-1 h-4 w-4" /> Manuell
                                    </Button>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {items.map(item => {
                                  const idx = menuItems.indexOf(item);
                                  const img = dishImages.find(di => di.id === item.dish_image_id);
                                  return (
                                    <div key={idx} className="space-y-2 rounded-lg border border-border p-3">
                                      <div className="flex items-start gap-3">
                                        {img && <img src={img.image_url} alt={img.name} className="h-16 w-16 rounded-md object-cover" />}
                                        <div className="flex-1 space-y-2">
                                          <Input placeholder="Gerichtname" value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} />
                                          <Input placeholder="Beschreibung (optional)" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} />
                                          <div className="flex flex-wrap items-center gap-3">
                                            <div className="w-24">
                                              <Input type="number" step="0.50" value={item.price} onChange={e => updateItem(idx, "price", parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <div className="w-20">
                                              <Input type="number" value={item.max_quantity} onChange={e => updateItem(idx, "max_quantity", parseInt(e.target.value) || 0)} placeholder="Max" />
                                            </div>
                                            <Select value={item.dish_image_id || "none"} onValueChange={v => updateItem(idx, "dish_image_id", v === "none" ? null : v)}>
                                              <SelectTrigger className="w-40"><SelectValue placeholder="Bild wählen" /></SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="none">Kein Bild</SelectItem>
                                                {dishImages.map(di => <SelectItem key={di.id} value={di.id}>{di.name}</SelectItem>)}
                                              </SelectContent>
                                            </Select>
                                            <div className="flex items-center gap-2">
                                              <Switch checked={item.is_active} onCheckedChange={v => updateItem(idx, "is_active", v)} />
                                              <span className="text-xs text-muted-foreground">{item.is_active ? "Aktiv" : "Inaktiv"}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              )}
            </TabsContent>

            {/* === DISHES CATALOG TAB === */}
            <TabsContent value="dishes" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">Gerichtekatalog ({menuDishes.length} Gerichte)</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menuDishes.map(d => {
                  const img = dishImages.find(di => di.id === d.dish_image_id);
                  const catLabel = CATEGORIES.find(c => c.value === d.category)?.label || d.category;
                  return (
                    <Card key={d.id} className="flex items-center gap-3 p-3">
                      {img ? <img src={img.image_url} alt={img.name} className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
                        : <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{catLabel} · {d.default_price.toFixed(2)} €</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* === IMAGES TAB === */}
            <TabsContent value="images" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">Gerichte-Bilder ({dishImages.length})</h2>
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Upload className="mr-2 h-4 w-4" /> Bild hochladen</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Neues Gericht-Bild</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name des Gerichts</Label>
                        <Input value={newImageName} onChange={e => setNewImageName(e.target.value)} placeholder="z.B. Schnitzel Wiener Art" />
                      </div>
                      <div>
                        <Label>Bild</Label>
                        <Input type="file" accept="image/*" onChange={e => setNewImageFile(e.target.files?.[0] || null)} />
                      </div>
                      <Button onClick={uploadDishImage} disabled={uploadingImage || !newImageFile || !newImageName.trim()} className="w-full">
                        {uploadingImage ? "Lädt hoch…" : "Hochladen"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {dishImages.map(img => (
                  <Card key={img.id} className="overflow-hidden">
                    <img src={img.image_url} alt={img.name} className="aspect-square w-full object-cover" />
                    <CardContent className="p-3">
                      <p className="truncate text-sm font-medium">{img.name}</p>
                      <Button variant="ghost" size="sm" className="mt-1 w-full text-destructive" onClick={() => deleteDishImage(img)}>
                        <Trash2 className="mr-1 h-3 w-3" /> Löschen
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {dishImages.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <ImageIcon className="mx-auto mb-3 h-10 w-10" />
                    <p>Noch keine Bilder vorhanden</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
