import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ColorChoice } from "@/components/ColorPaletteSelector";
import type { Json } from "@/integrations/supabase/types";

export interface BrandingSettings {
  logo_url: string | null;
  primary_color: ColorChoice | null;
  secondary_color: ColorChoice | null;
  accent_color: ColorChoice | null;
  default_tone: string;
  onboarding_completed: boolean;
}

const defaultBrandingSettings: BrandingSettings = {
  logo_url: null,
  primary_color: null,
  secondary_color: null,
  accent_color: null,
  default_tone: "standard",
  onboarding_completed: false,
};

const toColorChoice = (value: Json | null): ColorChoice | null =>
  (value as unknown as ColorChoice) ?? null;

export function useBrandingSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("branding_settings")
          .select("*")
          .eq("user_id", user.id);

        console.log("useBrandingSettings branding_settings", { count: data?.length ?? 0, error });

        if (error) throw error;

        const row = data?.[0];
        if (row) {
          setSettings({
            logo_url: row.logo_url,
            primary_color: toColorChoice(row.primary_color),
            secondary_color: toColorChoice(row.secondary_color),
            accent_color: toColorChoice(row.accent_color),
            default_tone: row.default_tone || "standard",
            onboarding_completed: row.onboarding_completed,
          });
        } else {
          setSettings(defaultBrandingSettings);
          const { error: insertError } = await supabase.from("branding_settings").upsert({
            user_id: user.id,
            default_tone: defaultBrandingSettings.default_tone,
            onboarding_completed: defaultBrandingSettings.onboarding_completed,
          }, { onConflict: "user_id" });
          if (insertError) console.error("useBrandingSettings default branding upsert error:", insertError);
        }
      } catch (error) {
        console.error("useBrandingSettings load error:", error);
        setSettings(defaultBrandingSettings);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  return { settings, loading };
}
