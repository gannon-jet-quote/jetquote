import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ColorChoice } from "@/components/ColorPaletteSelector";

export interface BrandingSettings {
  logo_url: string | null;
  primary_color: ColorChoice | null;
  secondary_color: ColorChoice | null;
  accent_color: ColorChoice | null;
  default_tone: string;
  onboarding_completed: boolean;
}

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
      const { data } = await supabase
        .from("branding_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          logo_url: data.logo_url,
          primary_color: data.primary_color as any,
          secondary_color: data.secondary_color as any,
          accent_color: data.accent_color as any,
          default_tone: data.default_tone,
          onboarding_completed: data.onboarding_completed,
        });
      } else {
        setSettings(null);
      }
      setLoading(false);
    };

    fetch();
  }, [user]);

  return { settings, loading };
}
