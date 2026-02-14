import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShoppingCart, User, CreditCard, Check, Minus, Plus, Phone, ArrowLeft, ArrowRight, CalendarDays, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, startOfISOWeek, getISOWeek, getYear, isToday, isBefore } from "date-fns";
import { de } from "date-fns/locale";

const CATEGORY_LABELS: Record<string, string> = {
  menu1: "Menü 1", menu2: "Menü 2", vegetarisch: "Vegetarisch", suppe: "Tagessuppe", dessert: "Dessert",
};
const CATEGORY_ORDER = ["menu1", "menu2", "vegetarisch", "suppe", "dessert"];

type DishImage = { id: string; name: string; image_url: string };
type MenuItem = {
  id: string; day_of_week: number; category: string; name: string; description: string;
  price: number; dish_image_id: string | null; is_active: boolean; max_quantity: number;
  weekly_menu_id: string;
};
type CartItem = { menuItemId: string; date: string; quantity: number };

function useSameDayCutoff() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const cutoff = new Date(now);
  cutoff.setHours(11, 15, 0, 0);
  const canOrderToday = now.getDay() >= 1 && now.getDay() <= 4 && now < cutoff;
  const diff = Math.max(0, cutoff.getTime() - now.getTime());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { canOrderToday, minutes, seconds, now };
}

function getOrderableDates(now: Date, canOrderToday: boolean): Date[] {
  const dates: Date[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Current week remaining days (Mon=1..Thu=4)
  if (canOrderToday && today.getDay() >= 1 && today.getDay() <= 4) {
    dates.push(new Date(today));
  }
  // Future days this week
  for (let d = today.getDay() + 1; d <= 4; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + (d - today.getDay()));
    dates.push(date);
  }
  // Next week Mon-Thu (always available if menu is published)
  const nextMon = startOfISOWeek(addDays(today, 7));
  for (let i = 0; i < 4; i++) {
    dates.push(addDays(nextMon, i));
  }
  return dates;
}

const steps = [
  { icon: CalendarDays, label: "Tag & Gericht wählen" },
  { icon: ShoppingCart, label: "Warenkorb" },
  { icon: User, label: "Kontakt & Zahlung" },
  { icon: Check, label: "Bestätigung" },
];

export default function Vorbestellen() {
  const { canOrderToday, minutes, seconds, now } = useSameDayCutoff();
  const [step, setStep] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dishImages, setDishImages] = useState<DishImage[]>([]);
  const [publishedWeeks, setPublishedWeeks] = useState<{ id: string; year: number; week_number: number }[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", payment: "sumup" });
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Load published menus + images
  useEffect(() => {
    const load = async () => {
      const [menusRes, imagesRes] = await Promise.all([
        supabase.from("weekly_menus").select("id, year, week_number").eq("is_published", true),
        supabase.from("dish_images").select("id, name, image_url"),
      ]);
      const menus = menusRes.data || [];
      setPublishedWeeks(menus);
      setDishImages(imagesRes.data || []);
      if (menus.length > 0) {
        const ids = menus.map(m => m.id);
        const { data: items } = await supabase.from("daily_menu_items").select("*").in("weekly_menu_id", ids);
        setMenuItems((items || []).map(d => ({
          id: d.id, day_of_week: d.day_of_week, category: d.category, name: d.name,
          description: d.description || "", price: Number(d.price), dish_image_id: d.dish_image_id,
          is_active: d.is_active, max_quantity: d.max_quantity || 20, weekly_menu_id: d.weekly_menu_id,
        })));
      }
    };
    load();
  }, []);

  const orderableDates = useMemo(() => getOrderableDates(now, canOrderToday), [now, canOrderToday]);

  // Filter dates to only those with published menus
  const availableDates = useMemo(() => {
    return orderableDates.filter(date => {
      const week = getISOWeek(date);
      const year = getYear(date);
      const menu = publishedWeeks.find(m => m.week_number === week && m.year === year);
      if (!menu) return false;
      const dayOfWeek = (date.getDay() + 6) % 7; // 0=Mon
      return menuItems.some(i => i.weekly_menu_id === menu.id && i.day_of_week === dayOfWeek && i.is_active);
    });
  }, [orderableDates, publishedWeeks, menuItems]);

  const getItemsForDate = (date: Date) => {
    const week = getISOWeek(date);
    const year = getYear(date);
    const menu = publishedWeeks.find(m => m.week_number === week && m.year === year);
    if (!menu) return [];
    const dayOfWeek = (date.getDay() + 6) % 7;
    return menuItems.filter(i => i.weekly_menu_id === menu.id && i.day_of_week === dayOfWeek && i.is_active)
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  };

  const addToCart = (menuItemId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === menuItemId && c.date === dateStr);
      if (existing) return prev.map(c => c.menuItemId === menuItemId && c.date === dateStr ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId, date: dateStr, quantity: 1 }];
    });
  };

  const updateCartQty = (menuItemId: string, date: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItemId !== menuItemId || c.date !== date) return c;
      const q = c.quantity + delta;
      return q <= 0 ? null : { ...c, quantity: q };
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (menuItemId: string, date: string) => {
    setCart(prev => prev.filter(c => !(c.menuItemId === menuItemId && c.date === date)));
  };

  const cartTotal = cart.reduce((sum, c) => {
    const item = menuItems.find(i => i.id === c.menuItemId);
    return sum + (item?.price || 0) * c.quantity;
  }, 0);

  const canProceed = step === 0 ? cart.length > 0 : step === 1 ? true : step === 2 ? contact.name.trim() && contact.phone.trim() : true;

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase.from("preorders").insert({
        customer_name: contact.name, customer_phone: contact.phone, customer_email: contact.email,
        payment_method: contact.payment, total_amount: cartTotal,
      }).select().single();
      if (error) throw error;

      const items = cart.map(c => ({
        preorder_id: order.id, daily_menu_item_id: c.menuItemId,
        order_date: c.date, quantity: c.quantity,
        unit_price: menuItems.find(i => i.id === c.menuItemId)?.price || 0,
      }));
      const { error: itemsErr } = await supabase.from("preorder_items").insert(items);
      if (itemsErr) throw itemsErr;

      setOrderConfirmed(true);
      setStep(3);
      toast.success("Bestellung erfolgreich aufgegeben!");
    } catch (e) {
      toast.error("Fehler bei der Bestellung");
    }
    setSubmitting(false);
  };

  if (availableDates.length === 0 && menuItems.length === 0) {
    return (
      <Layout>
        <section className="container py-20 text-center">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-3 font-serif text-3xl">Aktuell keine Speisekarte verfügbar</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Es ist zurzeit keine Wochenkarte veröffentlicht. Bitte versuchen Sie es später erneut.
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
      {/* Timer bar for same-day */}
      {canOrderToday && (
        <div className="bg-accent text-accent-foreground">
          <div className="container flex items-center justify-center gap-2 py-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Bestellung für heute noch möglich für <strong>{minutes}:{seconds.toString().padStart(2, "0")}</strong> Min.
          </div>
        </div>
      )}

      <div className="container py-10">
        <h1 className="mb-2 font-serif text-3xl md:text-4xl">Mittagstisch vorbestellen</h1>
        <p className="mb-8 text-muted-foreground">BZO Gera/Zwötzen · Abholung 11:30 – 13:30 Uhr</p>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`hidden text-xs sm:block ${i <= step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`mx-2 h-0.5 flex-1 rounded ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

            {/* Step 0: Day & dish selection */}
            {step === 0 && (
              <div className="space-y-8">
                {availableDates.map(date => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const items = getItemsForDate(date);
                  const todayCutoffPassed = isToday(date) && !canOrderToday;
                  if (todayCutoffPassed || items.length === 0) return null;
                  return (
                    <div key={dateStr}>
                      <div className="mb-3 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h2 className="font-serif text-lg font-semibold">
                          {format(date, "EEEE, d. MMMM", { locale: de })}
                          {isToday(date) && <Badge variant="secondary" className="ml-2">Heute</Badge>}
                        </h2>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map(item => {
                          const img = dishImages.find(di => di.id === item.dish_image_id);
                          const inCart = cart.find(c => c.menuItemId === item.id && c.date === dateStr);
                          return (
                            <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md ${inCart ? "ring-2 ring-primary" : ""}`}>
                              {img && <img src={img.image_url} alt={img.name} className="h-36 w-full object-cover" />}
                              <CardContent className="p-4">
                                <div className="mb-1 flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[item.category]}</Badge>
                                  <span className="font-serif text-lg font-bold text-primary">{item.price.toFixed(2).replace(".", ",")} €</span>
                                </div>
                                <h3 className="mb-1 font-medium">{item.name}</h3>
                                {item.description && <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>}
                                {inCart ? (
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartQty(item.id, dateStr, -1)}><Minus className="h-3 w-3" /></Button>
                                    <span className="w-6 text-center font-bold">{inCart.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCartQty(item.id, dateStr, 1)}><Plus className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => removeFromCart(item.id, dateStr)}>Entfernen</Button>
                                  </div>
                                ) : (
                                  <Button variant="outline" className="w-full" onClick={() => addToCart(item.id, date)}>
                                    <Plus className="mr-2 h-4 w-4" /> Hinzufügen
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1: Cart overview */}
            {step === 1 && (
              <div className="mx-auto max-w-xl space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Warenkorb</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map(c => {
                      const item = menuItems.find(i => i.id === c.menuItemId);
                      const dateObj = new Date(c.date + "T00:00:00");
                      if (!item) return null;
                      return (
                        <div key={`${c.menuItemId}-${c.date}`} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{format(dateObj, "EEEE, d. MMM", { locale: de })}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(c.menuItemId, c.date, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-5 text-center text-sm font-bold">{c.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQty(c.menuItemId, c.date, 1)}><Plus className="h-3 w-3" /></Button>
                            <span className="ml-2 w-16 text-right font-medium">{(item.price * c.quantity).toFixed(2).replace(".", ",")} €</span>
                          </div>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Gesamt</span>
                      <span className="text-primary">{cartTotal.toFixed(2).replace(".", ",")} €</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Contact & Payment */}
            {step === 2 && (
              <div className="mx-auto max-w-xl space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Kontaktdaten</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label htmlFor="name">Name *</Label><Input id="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Ihr Name" /></div>
                    <div><Label htmlFor="phone">Telefon *</Label><Input id="phone" type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="Für Rückfragen" /></div>
                    <div><Label htmlFor="email">E-Mail (optional)</Label><Input id="email" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="Für Bestätigung" /></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Zahlungsart</CardTitle></CardHeader>
                  <CardContent>
                    <RadioGroup value={contact.payment} onValueChange={v => setContact({ ...contact, payment: v })}>
                      <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3"><RadioGroupItem value="sumup" id="sumup" /><Label htmlFor="sumup" className="cursor-pointer">Online bezahlen (SumUp)</Label></div>
                      <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/50 p-3"><RadioGroupItem value="bar" id="bar" /><Label htmlFor="bar" className="cursor-pointer">Bar bei Abholung</Label></div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && orderConfirmed && (
              <div className="mx-auto max-w-xl text-center">
                <div className="mb-6 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-8 w-8" /></div></div>
                <h2 className="mb-2 font-serif text-2xl">Bestellung aufgegeben!</h2>
                <p className="mb-6 text-muted-foreground">Vielen Dank. Ihre Bestellung wurde erfolgreich übermittelt.</p>
                <Card>
                  <CardContent className="space-y-3 p-6 text-left">
                    {cart.map(c => {
                      const item = menuItems.find(i => i.id === c.menuItemId);
                      const dateObj = new Date(c.date + "T00:00:00");
                      return (
                        <div key={`${c.menuItemId}-${c.date}`} className="flex justify-between text-sm">
                          <span>{c.quantity}× {item?.name} – {format(dateObj, "EEE d. MMM", { locale: de })}</span>
                          <span>{((item?.price || 0) * c.quantity).toFixed(2).replace(".", ",")} €</span>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between font-bold"><span>Gesamt</span><span className="text-primary">{cartTotal.toFixed(2).replace(".", ",")} €</span></div>
                    <Separator />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Name:</strong> {contact.name}</p>
                      <p><strong>Telefon:</strong> {contact.phone}</p>
                      <p><strong>Zahlung:</strong> {contact.payment === "sumup" ? "Online (SumUp)" : "Bar bei Abholung"}</p>
                      <p><strong>Abholung:</strong> 11:30 – 13:30 Uhr, BZO Gera/Zwötzen</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {!orderConfirmed && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}><ArrowLeft className="mr-2 h-4 w-4" /> Zurück</Button>
            {step < 2 && <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>Weiter <ArrowRight className="ml-2 h-4 w-4" /></Button>}
            {step === 2 && <Button onClick={submitOrder} disabled={!canProceed || submitting}>{submitting ? "Wird gesendet…" : "Verbindlich bestellen"}</Button>}
          </div>
        )}

        {/* Cart badge */}
        {step === 0 && cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="shadow-lg" onClick={() => setStep(1)}>
              <ShoppingCart className="mr-2 h-5 w-5" /> {cart.length} Artikel · {cartTotal.toFixed(2).replace(".", ",")} €
            </Button>
          </div>
        )}

        {/* Phone hint */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          Auch telefonisch unter <a href="tel:+493654222241" className="text-primary hover:underline">0365 / 4222241</a>
        </div>
      </div>
    </Layout>
  );
}
