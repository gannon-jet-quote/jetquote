import { useEffect, useMemo, useState } from "react";
import { Rocket, Check, RotateCcw, AlertTriangle, Clock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAppBaseUrl } from "@/lib/appBaseUrl";

interface Item {
  id: string;
  title: string;
  description: string;
}

const ITEMS: Item[] = [
  {
    id: "app_base_url",
    title: "Update APP_BASE_URL",
    description:
      "Set APP_BASE_URL to https://app.jet-quote.com so all email links (proposal response, quote request, follow-up) use the correct domain.",
  },
  {
    id: "cron_url",
    title: "Update Cron Site URL",
    description:
      "Update the cron job configuration to use https://app.jet-quote.com. Confirm cron is running and last run time updates.",
  },
  {
    id: "auth_redirects",
    title: "Update Auth Redirect URLs",
    description:
      "Add https://app.jet-quote.com to allowed redirect/callback URLs. Confirm signup/login works on the new domain.",
  },
  {
    id: "verify_email_links",
    title: "Verify Email Links",
    description:
      "Send a test proposal email and click the Accept/Decline link. Confirm it opens the client response page on app.jet-quote.com.",
  },
  {
    id: "verify_quote_request",
    title: "Verify Quote Request Link",
    description:
      "Open the user's quote request link and submit a test lead. Confirm it creates a draft proposal in the dashboard.",
  },
  {
    id: "verify_followups",
    title: "Verify Follow-Up Automation",
    description:
      "Confirm follow-ups due right now count is correct, and follow-up emails are sent and logged.",
  },
  {
    id: "stripe_future",
    title: "(Future) Stripe Webhooks + Redirect URLs",
    description:
      "When Stripe is enabled: update webhook URL to app.jet-quote.com endpoints and update success/cancel return URLs.",
  },
];

const STORAGE_KEY = "jq_golive_checklist_v1";

const GoLiveChecklist = () => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [lastFollowupRun, setLastFollowupRun] = useState<string | null>(null);
  const [errorCount24h, setErrorCount24h] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {/* ignore */}
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [{ data: lastRun }, { count }] = await Promise.all([
        supabase
          .from("proposals")
          .select("followup_sent_at")
          .not("followup_sent_at", "is", null)
          .order("followup_sent_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("system_events")
          .select("id", { count: "exact", head: true })
          .like("event_type", "%error%")
          .gte("created_at", since),
      ]);

      setLastFollowupRun(lastRun?.followup_sent_at || null);
      setErrorCount24h(count ?? 0);
    };
    fetchStatus();
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const completedCount = useMemo(
    () => ITEMS.filter((i) => checked[i.id]).length,
    [checked]
  );

  const appBaseUrl = getAppBaseUrl();

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Go-Live Checklist
          </h2>
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {completedCount} / {ITEMS.length}
          </span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* Live status row */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> APP_BASE_URL
          </div>
          <p className="truncate text-sm font-medium text-foreground" title={appBaseUrl}>
            {appBaseUrl || "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Last follow-up sent
          </div>
          <p className="text-sm font-medium text-foreground">
            {lastFollowupRun
              ? new Date(lastFollowupRun).toLocaleString()
              : "Never"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> Errors (24h)
          </div>
          <p className="text-sm font-medium text-foreground">
            {errorCount24h ?? "—"}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {ITEMS.map((item, idx) => {
          const isChecked = !!checked[item.id];
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-background/30 p-3"
            >
              <button
                onClick={() => toggle(item.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  isChecked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                }`}
                aria-label={isChecked ? "Uncheck" : "Check"}
              >
                {isChecked && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isChecked
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {idx + 1}. {item.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GoLiveChecklist;
