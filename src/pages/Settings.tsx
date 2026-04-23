import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoUpload from "@/components/LogoUpload";
import ColorPaletteSelector, { type ColorChoice } from "@/components/ColorPaletteSelector";
import { toneOptions, getServicesByCategory } from "@/config/serviceTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { buildAppUrl } from "@/lib/appBaseUrl";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { settings: branding, loading: brandingLoading } = useBrandingSettings();
  const { toast } = useToast();

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [username, setUsername] = useState("");
  const [primaryServiceType, setPrimaryServiceType] = useState("");

  // Payment preferences
  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [paymentLinkOrInstructions, setPaymentLinkOrInstructions] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Review preferences
  const [reviewPlatform, setReviewPlatform] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [reviewSignatureName, setReviewSignatureName] = useState("");

  // Branding fields
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [tone, setTone] = useState("standard");
  const [primaryColor, setPrimaryColor] = useState<ColorChoice | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<ColorChoice | null>(null);
  const [accentColor, setAccentColor] = useState<ColorChoice | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setBusinessName(profile.business_name);
      setTitle(profile.title || "");
      setBusinessPhone(profile.business_phone || "");
      setUsername((profile as any).username || "");
      setPrimaryServiceType((profile as any).primary_service_type || "");
      setPaymentMethodName((profile as any).payment_method_name || "");
      setPaymentLinkOrInstructions((profile as any).payment_link_or_instructions || "");
      setPaymentNote((profile as any).payment_note || "");
      setReviewPlatform((profile as any).review_platform || "");
      setReviewLink((profile as any).review_link || "");
      setReviewSignatureName((profile as any).review_signature_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (branding) {
      setTone(branding.default_tone || "standard");
      setPrimaryColor(branding.primary_color);
      setSecondaryColor(branding.secondary_color);
      setAccentColor(branding.accent_color);
      if (branding.logo_url) setLogoDataUrl(branding.logo_url);
    }
  }, [branding]);

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoDataUrl || !user) return null;
    // If it's already a URL (not data:), keep it
    if (!logoDataUrl.startsWith("data:")) return logoDataUrl;
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !businessName.trim()) {
      toast({ title: "Missing fields", description: "First name, last name, and business name are required.", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      // Save profile
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          business_name: businessName.trim(),
          title: title.trim() || null,
          business_phone: businessPhone.trim() || null,
          username: username.trim().toLowerCase() || null,
          primary_service_type: primaryServiceType || null,
          payment_method_name: paymentMethodName.trim() || null,
          payment_link_or_instructions: paymentLinkOrInstructions.trim() || null,
          payment_note: paymentNote.trim() || null,
          review_platform: reviewPlatform.trim() || null,
          review_link: reviewLink.trim() || null,
          review_signature_name: reviewSignatureName.trim() || null,
        } as any)
        .eq("user_id", profile!.user_id);

      if (profileErr) throw profileErr;

      // Save branding
      const logoUrl = await uploadLogo();
      const { error: brandErr } = await supabase.from("branding_settings").upsert({
        user_id: user!.id,
        logo_url: logoUrl,
        primary_color: primaryColor as any,
        secondary_color: secondaryColor as any,
        accent_color: accentColor as any,
        default_tone: tone,
        onboarding_completed: true,
      }, { onConflict: "user_id" });

      if (brandErr) throw brandErr;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await refreshProfile();
      toast({ title: "Settings updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "border-border bg-input text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-lg px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="mb-8 text-muted-foreground">Update your profile and branding defaults.</p>

          {!profile || brandingLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              {/* Profile Section */}
              <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Profile</h2>
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
                    <Label className="text-secondary-foreground">Job Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Owner" className={fieldClass} />
                    <p className="text-xs text-muted-foreground">Example: Owner, Manager, Technician, Operations Director</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-secondary-foreground">Business Phone</Label>
                    <Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(555) 123-4567" className={fieldClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Primary Service Type *</Label>
                  <Select value={primaryServiceType} onValueChange={setPrimaryServiceType}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select your primary service" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground max-h-72">
                      {Object.entries(getServicesByCategory()).map(([category, services]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category}</div>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.label}>
                              {s.icon} {s.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Locks the Service Type on your public quote request form so customers can't pick the wrong one.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Quote Request Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                    placeholder="e.g. jetwashpros"
                    className={fieldClass}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your public quote request link: {username ? buildAppUrl(`/request/${username}`) : "Set a username to enable"}
                  </p>
                </div>
              </div>

              {/* Payment Preferences Section */}
              <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Payment Preferences</h2>
                <p className="text-xs text-muted-foreground">Set your preferred payment method so you can request payment from clients after completing a job.</p>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Payment Method Name</Label>
                  <Input
                    value={paymentMethodName}
                    onChange={(e) => setPaymentMethodName(e.target.value)}
                    placeholder="e.g. Venmo, PayPal, Zelle, Square, Stripe"
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Payment Link or Instructions</Label>
                  <Input
                    value={paymentLinkOrInstructions}
                    onChange={(e) => setPaymentLinkOrInstructions(e.target.value)}
                    placeholder="e.g. https://venmo.com/YourHandle or Zelle: 555-555-5555"
                    className={fieldClass}
                  />
                  <p className="text-xs text-muted-foreground">Enter a payment URL or plain text instructions for your clients.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Payment Note (optional)</Label>
                  <Input
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="e.g. Deposit required to confirm booking"
                    className={fieldClass}
                  />
                </div>
              </div>

              {/* Review Preferences Section */}
              <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Review Preferences</h2>
                <p className="text-xs text-muted-foreground">Set your review link so you can request reviews from clients after receiving payment.</p>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Review Platform</Label>
                  <Select value={reviewPlatform} onValueChange={setReviewPlatform}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground">
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Yelp">Yelp</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Review Link</Label>
                  <Input
                    value={reviewLink}
                    onChange={(e) => setReviewLink(e.target.value)}
                    placeholder="e.g. https://g.page/r/YOUR-ID/review"
                    className={fieldClass}
                  />
                  <p className="text-xs text-muted-foreground">Required to send review requests. Paste your Google, Facebook, Yelp, or other review URL.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Review Signature Name (optional)</Label>
                  <Input
                    value={reviewSignatureName}
                    onChange={(e) => setReviewSignatureName(e.target.value)}
                    placeholder="e.g. The JetWash Team"
                    className={fieldClass}
                  />
                  <p className="text-xs text-muted-foreground">Override the sign-off name in review request emails. Defaults to your first and last name.</p>
                </div>
              </div>

              {/* Branding Section */}
              <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Branding Defaults</h2>
                <p className="text-xs text-muted-foreground">These defaults will pre-fill when creating new proposals.</p>

                <LogoUpload logoDataUrl={logoDataUrl} onLogoChange={setLogoDataUrl} />

                <div className="space-y-2">
                  <Label className="text-secondary-foreground">Default Tone</Label>
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

                <ColorPaletteSelector
                  tone={tone}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  tertiaryColor={accentColor}
                  onPrimaryChange={setPrimaryColor}
                  onSecondaryChange={setSecondaryColor}
                  onTertiaryChange={setAccentColor}
                />
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
