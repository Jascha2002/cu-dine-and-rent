import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode, initDemoMode } from "@/lib/demoMode";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Truck,
  Settings,
  LogOut,
  ClipboardList,
  Users,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const menuItems = [
  { icon: CalendarDays, label: "Wochenkarten", description: "Speisekarten erstellen & verwalten", path: "/admin/weekly-menus" },
  { icon: ClipboardList, label: "Vorbestellungen", description: "Tagesübersicht & Küchenliste", path: "" },
  { icon: Truck, label: "Vermietung", description: "Buchungen & Anfragen", path: "" },
  { icon: MessageSquare, label: "Kontaktanfragen", description: "Eingegangene Nachrichten", path: "" },
  { icon: Users, label: "Stellenanzeigen", description: "Jobs verwalten & Bewerbungen", path: "/admin/jobs" },
  { icon: UtensilsCrossed, label: "Bistro Ophelia Menüs", description: "Speiseplan & Snack-Karte hochladen", path: "/admin/menu-upload" },
  { icon: Settings, label: "Einstellungen", description: "Bestellschluss, Kontingente", path: "" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      initDemoMode();
      if (isDemoMode()) {
        setDisplayName("Demo-Ansicht");
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setDisplayName(profile?.display_name || user.email || "Admin");
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Laden…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-[80vh]">
        {/* Header bar */}
        <div className="border-b border-border bg-card">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-serif text-xl font-bold">Admin-Dashboard</h1>
                <p className="text-sm text-muted-foreground">Willkommen, {displayName}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Abmelden
            </Button>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ClipboardList} label="Bestellungen heute" value="—" color="bg-primary" />
            <StatCard icon={UtensilsCrossed} label="Gerichte heute" value="—" color="bg-accent" />
            <StatCard icon={TrendingUp} label="Kontingent frei" value="—" color="bg-secondary-foreground" />
            <StatCard icon={MessageSquare} label="Offene Anfragen" value="—" color="bg-destructive" />
          </div>

          {/* Quick links */}
          <h2 className="mb-4 font-serif text-lg font-semibold">Verwaltung</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Card
                key={item.label}
                className={`transition-shadow hover:shadow-md ${item.path ? "cursor-pointer" : "cursor-default opacity-60"}`}
                onClick={() => item.path && navigate(item.path)}
              >
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
