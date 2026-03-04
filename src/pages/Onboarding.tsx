import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Rocket, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LogoUpload from "@/components/LogoUpload";
import ColorPaletteSelector, { type ColorChoice } from "@/components/ColorPaletteSelector";
import { toneOptions } from "@/config/serviceTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [tone, setTone] = useState("standard");
  const [primaryColor, setPrimaryColor] = useState<ColorChoice | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<ColorChoice | null>(null);
  const [accentColor, setAccentColor] = useState<ColorChoice | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || "");
    }
  }, [profile]);

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoDataUrl || !user) return null;
    // Convert data URL to blob
    const res = await fetch(logoDataUrl);
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : blob.type.includes("svg") ? "svg" : "jpg";
    const path = `${user.id}/logo.${ext}`;

    const { error } = await supabase.storage.from("logos").upload(path, blob, { upsert: true });
    if (error) {
      console.error("Logo upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const logoUrl = await uploadLogo();

      const { error } = await supabase.from("branding_settings").upsert({
        user_id: user.id,
        logo_url: logoUrl,
        primary_color: primaryColor as any,
        secondary_color: secondaryColor as any,
        accent_color: accentColor as any,
        default_tone: tone,
        onboarding_completed: true,
      }, { onConflict: "user_id" });

      if (error) throw error;

      // Also update business name on profile if changed
      if (businessName.trim() && businessName !== profile?.business_name) {
        await supabase.from("profiles").update({ business_name: businessName.trim() }).eq("user_id", user.id);
      }

      toast({ title: "Branding saved!", description: "You're all set to create proposals." });
      navigate("/generate");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Mark onboarding as completed without saving branding
    if (user) {
      supabase.from("branding_settings").upsert({
        user_id: user.id,
        onboarding_completed: true,
        default_tone: "standard",
      }, { onConflict: "user_id" }).then();
    }
    navigate("/generate");
  };

  const fieldClass = "border-border bg-input text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Progress */}
        <div className="mb-6 text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Step 1 of 1
          </span>
          <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-primary" />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome to JetQuote
          </h1>
          <p className="mt-2 text-muted-foreground">
            Let's quickly set up your branding so your proposals look professional.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label className="text-secondary-foreground">Business Name</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Company LLC"
              className={fieldClass}
            />
          </div>

          {/* Logo */}
          <LogoUpload logoDataUrl={logoDataUrl} onLogoChange={setLogoDataUrl} />

          {/* Tone */}
          <div className="space-y-2">
            <Label className="text-secondary-foreground">Default Proposal Tone</Label>
            <Select
              value={tone}
              onValueChange={(v) => {
                setTone(v);
                if (v === "standard") {
                  setPrimaryColor(null);
                  setSecondaryColor(null);
                  setAccentColor(null);
                }
                if (v !== "luxury") setAccentColor(null);
              }}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {toneOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label} — {t.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <ColorPaletteSelector
            tone={tone}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={accentColor}
            onPrimaryChange={setPrimaryColor}
            onSecondaryChange={setSecondaryColor}
            onTertiaryChange={setAccentColor}
          />

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip for Now
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Save & Continue"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
