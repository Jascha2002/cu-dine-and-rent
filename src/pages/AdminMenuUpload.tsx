import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode, initDemoMode } from "@/lib/demoMode";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Trash2, FileText, ExternalLink } from "lucide-react";

type MenuFile = { name: string; url: string; created_at: string };

export default function AdminMenuUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [speiseplan, setSpeiseplan] = useState<MenuFile | null>(null);
  const [snackkarte, setSnackkarte] = useState<MenuFile | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      initDemoMode();
      if (isDemoMode()) {
        loadFiles();
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!roles?.length) navigate("/admin");
    };
    check();
    loadFiles();
  }, [navigate]);

  const loadFiles = async () => {
    const { data: { publicUrl: spUrl } } = supabase.storage.from("menus").getPublicUrl("bistro-ophelia/speiseplan");
    const { data: { publicUrl: snUrl } } = supabase.storage.from("menus").getPublicUrl("bistro-ophelia/snackkarte");

    // Check if files exist by listing
    const { data: files } = await supabase.storage.from("menus").list("bistro-ophelia");
    if (files) {
      const sp = files.find((f) => f.name === "speiseplan");
      if (sp) setSpeiseplan({ name: sp.name, url: spUrl, created_at: sp.created_at });
      const sn = files.find((f) => f.name === "snackkarte");
      if (sn) setSnackkarte({ name: sn.name, url: snUrl, created_at: sn.created_at });
    }
  };

  const handleUpload = async (type: "speiseplan" | "snackkarte", file: File) => {
    if (isDemoMode()) {
      toast({ title: "Demo-Modus", description: "Kein Upload im Demo-Modus möglich." });
      return;
    }
    setUploading(type);
    const path = `bistro-ophelia/${type}`;
    // Remove old file first
    await supabase.storage.from("menus").remove([path]);
    const { error } = await supabase.storage.from("menus").upload(path, file, { upsert: true });
    setUploading(null);
    if (error) {
      toast({ title: "Upload fehlgeschlagen", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${type === "speiseplan" ? "Speiseplan" : "Snack-Karte"} hochgeladen` });
    loadFiles();
  };

  const handleDelete = async (type: "speiseplan" | "snackkarte") => {
    if (isDemoMode()) {
      toast({ title: "Demo-Modus", description: "Kein Löschen im Demo-Modus möglich." });
      return;
    }
    await supabase.storage.from("menus").remove([`bistro-ophelia/${type}`]);
    if (type === "speiseplan") setSpeiseplan(null);
    else setSnackkarte(null);
    toast({ title: "Datei gelöscht" });
  };

  const FileUploadCard = ({ title, file, type }: { title: string; file: MenuFile | null; type: "speiseplan" | "snackkarte" }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {file ? (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Aktuelle Datei</p>
                <p className="text-xs text-muted-foreground">Hochgeladen: {new Date(file.created_at).toLocaleDateString("de-DE")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={file.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3" /> Anzeigen</a>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(type)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Noch keine Datei hochgeladen.</p>
        )}
        <div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(type, f);
              }}
            />
            <Button asChild variant="outline" disabled={uploading === type}>
              <span><Upload className="mr-2 h-4 w-4" /> {uploading === type ? "Wird hochgeladen…" : "Neue Datei hochladen"}</span>
            </Button>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">PDF, JPG oder PNG – max. 10 MB</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="bg-muted/30 min-h-[80vh]">
        <div className="border-b border-border bg-card">
          <div className="container flex items-center gap-3 py-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-serif text-xl font-bold">Bistro Ophelia – Menü-Upload</h1>
              <p className="text-sm text-muted-foreground">Speiseplan und Snack-Karte verwalten</p>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FileUploadCard title="Wechselnder Speiseplan" file={speiseplan} type="speiseplan" />
            <FileUploadCard title="Snack-Karte" file={snackkarte} type="snackkarte" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
