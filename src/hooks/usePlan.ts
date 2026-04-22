import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const FREE_PROPOSAL_LIMIT = 3;

export const usePlan = () => {
  const { profile, user } = useAuth();
  const plan = profile?.plan === "pro" ? "pro" : "free";
  const isPro = plan === "pro";

  const [sentThisMonth, setSentThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSentThisMonth(0);
      setLoading(false);
      return;
    }
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("sent_at", startOfMonth)
      .then(({ count }) => {
        setSentThisMonth(count ?? 0);
        setLoading(false);
      });
  }, [user]);

  const refresh = async () => {
    if (!user) return;
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const { count } = await supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("sent_at", startOfMonth);
    setSentThisMonth(count ?? 0);
  };

  const remaining = isPro
    ? Infinity
    : Math.max(0, FREE_PROPOSAL_LIMIT - sentThisMonth);
  const atFreeLimit = !isPro && sentThisMonth >= FREE_PROPOSAL_LIMIT;

  return {
    plan,
    isPro,
    sentThisMonth,
    freeLimit: FREE_PROPOSAL_LIMIT,
    remaining,
    atFreeLimit,
    loading,
    refresh,
  };
};
