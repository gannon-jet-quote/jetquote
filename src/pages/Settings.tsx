import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setBusinessName(profile.business_name);
      setTitle(profile.title || "");
      setBusinessPhone(profile.business_phone || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !businessName.trim()) {
      toast({ title: "Missing fields", description: "First name, last name, and business name are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        business_name: businessName.trim(),
        title: title.trim() || null,
        business_phone: businessPhone.trim() || null,
      })
      .eq("user_id", profile!.user_id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await refreshProfile();
      toast({ title: "Profile updated" });
    }
  };

  const fieldClass = "border-border bg-input text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-lg px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="mb-8 text-muted-foreground">Update your personal and business information.</p>

          {!profile ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-border bg-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">First Name *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Last Name *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-secondary-foreground">Business Name *</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={fieldClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Owner" className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Business Phone</Label>
                  <Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(555) 123-4567" className={fieldClass} />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
