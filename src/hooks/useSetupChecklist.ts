import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";
import { supabase } from "@/integrations/supabase/client";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  ctaLabel: string;
  ctaHref: string;
}

interface PaymentReviewFields {
  payment_method_name: string | null;
  payment_link_or_instructions: string | null;
  review_link: string | null;
  primary_service_type: string | null;
}

export const useSetupChecklist = () => {
  const { user, profile } = useAuth();
  const { settings: branding, loading: brandingLoading } = useBrandingSettings();

  const [extra, setExtra] = useState<PaymentReviewFields | null>(null);
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [sentCount, setSentCount] = useState<number>(0);
  const [latestDraftId, setLatestDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const [profileRes, allRes, sentRes, draftRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("payment_method_name, payment_link_or_instructions, review_link, primary_service_type")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("sent_at", "is", null),
      supabase
        .from("proposals")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setExtra((profileRes.data as PaymentReviewFields) ?? null);
    setProposalCount(allRes.count ?? 0);
    setSentCount(sentRes.count ?? 0);
    setLatestDraftId(draftRes.data?.id ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const profileComplete = !!(
    profile?.first_name?.trim() &&
    profile?.last_name?.trim() &&
    profile?.business_name?.trim()
  );

  const brandingComplete = !!(
    branding?.logo_url &&
    branding?.primary_color &&
    branding?.secondary_color
  );

  const serviceTypeComplete = !!extra?.primary_service_type?.trim();

  const paymentComplete = !!(
    extra?.payment_method_name?.trim() &&
    extra?.payment_link_or_instructions?.trim()
  );

  const reviewComplete = !!extra?.review_link?.trim();

  const firstProposalComplete = proposalCount > 0;
  const firstSendComplete = sentCount > 0;

  const items: ChecklistItem[] = [
    {
      id: "profile",
      label: "Complete Profile",
      description: "Add your name and business name.",
      done: profileComplete,
      ctaLabel: "Edit Profile",
      ctaHref: "/settings",
    },
    {
      id: "branding",
      label: "Upload Logo & Choose Brand Colors",
      description: "Personalize proposals with your logo and palette.",
      done: brandingComplete,
      ctaLabel: "Branding Settings",
      ctaHref: "/settings",
    },
    {
      id: "service",
      label: "Set Primary Service Type",
      description: "Used for the public quote request link.",
      done: serviceTypeComplete,
      ctaLabel: "Set Service Type",
      ctaHref: "/settings",
    },
    {
      id: "payment",
      label: "Add Payment Method",
      description: "Required to send payment requests.",
      done: paymentComplete,
      ctaLabel: "Add Payment Method",
      ctaHref: "/settings",
    },
    {
      id: "review",
      label: "Add Review Link",
      description: "Required to send review requests.",
      done: reviewComplete,
      ctaLabel: "Add Review Link",
      ctaHref: "/settings",
    },
    {
      id: "first-proposal",
      label: "Create First Proposal",
      description: "Generate your first proposal.",
      done: firstProposalComplete,
      ctaLabel: "Create Proposal",
      ctaHref: "/generate",
    },
    {
      id: "first-send",
      label: "Send First Proposal",
      description: "Email your first proposal to a client.",
      done: firstSendComplete,
      ctaLabel: latestDraftId ? "Send a Proposal" : "Create & Send",
      ctaHref: latestDraftId ? "/dashboard" : "/generate",
    },
  ];

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const allComplete = completed === total;

  return {
    items,
    completed,
    total,
    allComplete,
    loading: loading || brandingLoading,
    refresh,
    flags: {
      profileComplete,
      brandingComplete,
      serviceTypeComplete,
      paymentComplete,
      reviewComplete,
    },
  };
};
