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
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, Save } from "lucide-react";
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

export default function AdminWeeklyMenus() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dishImages, setDishImages] = useState<DishImage[]>([]);
  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<WeeklyMenu | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [newImageName, setNewImageName] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeDay, setActiveDay] = useState("0");

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

  // Load data
  const loadData = useCallback(async () => {
    const [imgRes, menuRes] = await Promise.all([
      supabase.from("dish_images").select("*").order("name"),
      supabase.from("weekly_menus").select("*").order("year", { ascending: false }).order("week_number", { ascending: false }).limit(10),
    ]);
    setDishImages(imgRes.data || []);
    setWeeklyMenus(menuRes.data || []);
  }, []);

  useEffect(() => { if (!loading) loadData(); }, [loading, loadData]);

  // Load menu items when selecting a menu
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

  // Create new weekly menu
  const createMenu = async () => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const year = nextWeek.getFullYear();
    const week = getISOWeek(nextWeek);
    const { data, error } = await supabase.from("weekly_menus").insert({ year, week_number: week }).select().single();
    if (error) {
      if (error.code === "23505") toast.error(`KW ${week}/${year} existiert bereits`);
      else toast.error("Fehler beim Erstellen");
      return;
    }
    toast.success(`KW ${week}/${year} erstellt`);
    await loadData();
    setSelectedMenu(data);
  };

  // Add a menu item
  const addItem = (day: number, category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    setMenuItems(prev => [...prev, {
      day_of_week: day, category, name: "", description: "", price: cat?.defaultPrice || 0,
      dish_image_id: null, is_active: true, max_quantity: 20,
    }]);
  };

  // Update a menu item locally
  const updateItem = (index: number, field: string, value: any) => {
    setMenuItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Remove a menu item
  const removeItem = async (index: number) => {
    const item = menuItems[index];
    if (item.id) await supabase.from("daily_menu_items").delete().eq("id", item.id);
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  // Save all
  const saveAll = async () => {
    if (!selectedMenu) return;
    setSaving(true);
    try {
      // Upsert items
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

  // Toggle publish
  const togglePublish = async () => {
    if (!selectedMenu) return;
    const next = !selectedMenu.is_published;
    await supabase.from("weekly_menus").update({ is_published: next }).eq("id", selectedMenu.id);
    setSelectedMenu({ ...selectedMenu, is_published: next });
    setWeeklyMenus(prev => prev.map(m => m.id === selectedMenu.id ? { ...m, is_published: next } : m));
    toast.success(next ? "Veröffentlicht" : "Zurückgezogen");
  };

  // Upload dish image
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
              <TabsTrigger value="images">Bilderbibliothek</TabsTrigger>
            </TabsList>

            {/* === MENUS TAB === */}
            <TabsContent value="menus" className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedMenu?.id || ""} onValueChange={v => setSelectedMenu(weeklyMenus.find(m => m.id === v) || null)}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Woche wählen…" /></SelectTrigger>
                  <SelectContent>
                    {weeklyMenus.map(m => (
                      <SelectItem key={m.id} value={m.id}>KW {m.week_number}/{m.year} {m.is_published ? "✓" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={createMenu}><Plus className="mr-2 h-4 w-4" /> Neue Woche</Button>
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
                <Tabs value={activeDay} onValueChange={setActiveDay}>
                  <TabsList>
                    {DAYS.map((d, i) => <TabsTrigger key={i} value={String(i)}>{d}</TabsTrigger>)}
                  </TabsList>
                  {DAYS.map((_, dayIdx) => (
                    <TabsContent key={dayIdx} value={String(dayIdx)} className="space-y-4 mt-4">
                      {CATEGORIES.map(cat => {
                        const items = dayItems(dayIdx).filter(i => i.category === cat.value);
                        return (
                          <Card key={cat.value}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-base">{cat.label}</CardTitle>
                              {items.length === 0 && (
                                <Button variant="ghost" size="sm" onClick={() => addItem(dayIdx, cat.value)}>
                                  <Plus className="mr-1 h-4 w-4" /> Hinzufügen
                                </Button>
                              )}
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
                                        <div className="flex items-center gap-3">
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
              )}
            </TabsContent>

            {/* === IMAGES TAB === */}
            <TabsContent value="images" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">Gerichte-Bilder</h2>
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
