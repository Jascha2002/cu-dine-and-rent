import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode, initDemoMode } from "@/lib/demoMode";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Users, Eye } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const locations = [
  "BZO Gera/Zwötzen",
  "Bistro Ophelia (Theaterkantine)",
  "AWO Gera",
  "IHK Gera",
];

const employmentTypes = ["Vollzeit", "Teilzeit", "Minijob", "Werkstudent", "Praktikum"];

interface JobForm {
  title: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  benefits: string;
  is_active: boolean;
}

const emptyForm: JobForm = {
  title: "", location: "", employment_type: "Vollzeit",
  description: "", requirements: "", benefits: "", is_active: true,
};

export default function AdminJobs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewApplications, setViewApplications] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      initDemoMode();
      if (isDemoMode()) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!roles?.length) { navigate("/admin"); }
    };
    check();
  }, [navigate]);

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["admin-applications", viewApplications],
    enabled: !!viewApplications,
    queryFn: async () => {
      const { data, error } = await supabase.from("job_applications").select("*").eq("job_id", viewApplications!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.location) {
      toast({ title: "Fehler", description: "Titel und Standort sind Pflichtfelder.", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("jobs").update(form).eq("id", editing);
      if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Gespeichert" }); }
    } else {
      const { error } = await supabase.from("jobs").insert(form);
      if (error) { toast({ title: "Fehler", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Stelle erstellt" }); }
    }
    setSaving(false);
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
    queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (!error) {
      toast({ title: "Gelöscht" });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    }
  };

  const startEdit = (job: any) => {
    setForm({
      title: job.title, location: job.location, employment_type: job.employment_type,
      description: job.description, requirements: job.requirements || "", benefits: job.benefits || "", is_active: job.is_active,
    });
    setEditing(job.id);
    setCreating(true);
  };

  return (
    <Layout>
      <div className="bg-muted/30 min-h-[80vh]">
        <div className="border-b border-border bg-card">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-serif text-xl font-bold">Stellenanzeigen verwalten</h1>
            </div>
            {!creating && (
              <Button onClick={() => { setCreating(true); setForm(emptyForm); setEditing(null); }}>
                <Plus className="mr-2 h-4 w-4" /> Neue Stelle
              </Button>
            )}
          </div>
        </div>

        <div className="container py-8">
          {creating && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editing ? "Stelle bearbeiten" : "Neue Stelle erstellen"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Titel *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Koch/Köchin" />
                  </div>
                  <div>
                    <Label>Standort *</Label>
                    <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                      <SelectTrigger><SelectValue placeholder="Standort wählen" /></SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Beschäftigungsart</Label>
                    <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                    <Label>Aktiv (sichtbar auf der Website)</Label>
                  </div>
                </div>
                <div>
                  <Label>Beschreibung</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label>Anforderungen (kommagetrennt)</Label>
                  <Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={2} placeholder="z.B. Ausbildung als Koch, Teamfähigkeit, HACCP-Kenntnisse" />
                </div>
                <div>
                  <Label>Wir bieten (kommagetrennt)</Label>
                  <Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} placeholder="z.B. Geregelte Arbeitszeiten, Faire Vergütung" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>{saving ? "Speichern…" : "Speichern"}</Button>
                  <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Abbrechen</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications modal */}
          {viewApplications && (
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Bewerbungen</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setViewApplications(null)}>Schließen</Button>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Bewerbungen vorhanden.</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((a) => (
                      <div key={a.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{a.name}</p>
                            <p className="text-sm text-muted-foreground">{a.email} {a.phone && `· ${a.phone}`}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("de-DE")}</span>
                        </div>
                        {a.message && <p className="mt-2 text-sm">{a.message}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job list */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="outline">{job.employment_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewApplications(job.id)} title="Bewerbungen">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(job)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
