import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, Mail, Repeat, CheckCircle2, XCircle,
  UserPlus, Users, Loader2, Play,
} from "lucide-react";

type Indicator = "green" | "yellow" | "red" | "neutral";

interface ErrorRow {
  created_at: string;
  event_source: string | null;
  metadata: any;
}

const indicatorClasses: Record<Indicator, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  neutral: "bg-secondary text-muted-foreground border-border",
};

const Dot = ({ status }: { status: Indicator }) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${
      status === "green" ? "bg-emerald-400" :
      status === "yellow" ? "bg-amber-400" :
      status === "red" ? "bg-red-400" : "bg-muted-foreground"
    }`}
  />
);

const AdminHealthCheck = () => {
  const [loading, setLoading] = useState(true);
  const [runningCron, setRunningCron] = useState(false);
  const [data, setData] = useState({
    lastCron: null as null | { created_at: string; metadata: any; result: string },
    followupsDue: 0,
    errorCount24h: 0,
    recentErrors: [] as ErrorRow[],
    emailsSentToday: 0,
    followupsSentToday: 0,
    acceptedToday: 0,
    declinedToday: 0,
    newSignupsToday: 0,
    activeUsers7d: 0,
  });

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayIso = startOfToday.toISOString();
      const yesterdayIso = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
      const sevenDaysAgoIso = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
      const nowIso = now.toISOString();

      const [
        lastCronRes,
        followupsDueRes,
        errorCountRes,
        recentErrorsRes,
        emailsTodayRes,
        followupsTodayRes,
        acceptedTodayRes,
        declinedTodayRes,
        newSignupsRes,
        activeUsersRes,
      ] = await Promise.all([
        supabase.from("system_events")
          .select("created_at, metadata")
          .eq("event_type", "cron_run")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("proposals")
          .select("id", { count: "exact", head: true })
          .eq("status", "sent")
          .eq("followup_enabled", true)
          .is("followup_sent_at", null)
          .not("followup_scheduled_for", "is", null)
          .lte("followup_scheduled_for", nowIso),
        supabase.from("system_events")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "error")
          .gte("created_at", yesterdayIso),
        supabase.from("system_events")
          .select("created_at, event_source, metadata")
          .eq("event_type", "error")
          .gte("created_at", yesterdayIso)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("system_events")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "email_sent")
          .gte("created_at", startOfTodayIso),
        supabase.from("system_events")
          .select("id", { count: "exact", head: true })
          .eq("event_type", "followup_sent")
          .gte("created_at", startOfTodayIso),
        supabase.from("proposals")
          .select("id", { count: "exact", head: true })
          .gte("accepted_at", startOfTodayIso),
        supabase.from("proposals")
          .select("id", { count: "exact", head: true })
          .gte("declined_at", startOfTodayIso),
        supabase.from("profiles")
          .select("user_id", { count: "exact", head: true })
          .gte("created_at", startOfTodayIso),
        supabase.from("proposals")
          .select("user_id")
          .gte("sent_at", sevenDaysAgoIso)
          .not("sent_at", "is", null),
      ]);

      const activeUsers7d = new Set(
        (activeUsersRes.data || []).map((r: any) => r.user_id)
      ).size;

      const lastCron = lastCronRes.data
        ? {
            created_at: lastCronRes.data.created_at,
            metadata: lastCronRes.data.metadata || {},
            result: (lastCronRes.data.metadata as any)?.result || "unknown",
          }
        : null;

      setData({
        lastCron,
        followupsDue: followupsDueRes.count || 0,
        errorCount24h: errorCountRes.count || 0,
        recentErrors: (recentErrorsRes.data as ErrorRow[]) || [],
        emailsSentToday: emailsTodayRes.count || 0,
        followupsSentToday: followupsTodayRes.count || 0,
        acceptedToday: acceptedTodayRes.count || 0,
        declinedToday: declinedTodayRes.count || 0,
        newSignupsToday: newSignupsRes.count || 0,
        activeUsers7d,
      });
      setLoading(false);
    };
    load();
  }, []);

  const cronIndicator: Indicator = (() => {
    if (!data.lastCron) return "red";
    const ageH = (Date.now() - new Date(data.lastCron.created_at).getTime()) / 3600000;
    if (ageH <= 2) return "green";
    if (ageH <= 6) return "yellow";
    return "red";
  })();

  const errorIndicator: Indicator =
    data.errorCount24h === 0 ? "green" : data.errorCount24h <= 5 ? "yellow" : "red";

  const cronResultOk = data.lastCron?.result === "success";

  if (loading) {
    return (
      <div className="mb-8 rounded-xl border border-border bg-card p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Admin Health Check
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1. Cron Status */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Cron Status</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${indicatorClasses[cronIndicator]}`}>
              <Dot status={cronIndicator} />
              {cronIndicator === "green" ? "Healthy" : cronIndicator === "yellow" ? "Stale" : "Down"}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Last run:{" "}
              <span className="text-foreground">
                {data.lastCron
                  ? new Date(data.lastCron.created_at).toLocaleString()
                  : "Never"}
              </span>
            </p>
            <p className="text-muted-foreground">
              Result:{" "}
              <span className={cronResultOk ? "text-emerald-400" : "text-red-400"}>
                {data.lastCron ? (cronResultOk ? "Success" : "Fail") : "—"}
              </span>
              {data.lastCron?.metadata?.message && (
                <span className="text-muted-foreground"> · {data.lastCron.metadata.message}</span>
              )}
            </p>
            <p className="text-muted-foreground">
              Follow-ups due now:{" "}
              <span className="text-foreground">{data.followupsDue}</span>
            </p>
          </div>
        </div>

        {/* 2. Errors (24h) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Errors (24h)</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${indicatorClasses[errorIndicator]}`}>
              <Dot status={errorIndicator} />
              {data.errorCount24h}
            </span>
          </div>
          {data.recentErrors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No errors in the last 24 hours.</p>
          ) : (
            <ul className="space-y-2">
              {data.recentErrors.map((e, i) => (
                <li key={i} className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground truncate">
                      {e.event_source || "unknown"}
                      {e.metadata?.context && (
                        <span className="text-muted-foreground"> · {e.metadata.context}</span>
                      )}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(e.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {e.metadata?.message && (
                    <p className="text-muted-foreground truncate">{e.metadata.message}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. Emails Sent Today */}
        <StatCard
          icon={Mail}
          label="Emails Sent Today"
          value={data.emailsSentToday}
        />

        {/* 4. Follow-Ups Sent Today */}
        <StatCard
          icon={Repeat}
          label="Follow-Ups Sent Today"
          value={data.followupsSentToday}
        />

        {/* 5. Accept / Decline Today */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Proposal Responses Today</span>
          </div>
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{data.acceptedToday}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{data.declinedToday}</p>
              <p className="text-xs text-muted-foreground">Declined</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-foreground">
                {data.acceptedToday + data.declinedToday}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* 6. New Signups Today */}
        <StatCard
          icon={UserPlus}
          label="New Signups Today"
          value={data.newSignupsToday}
        />

        {/* 7. Active Users (7d) — full width if odd count */}
        <div className="rounded-xl border border-border bg-card p-5 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">Active Users (Last 7 Days)</span>
          </div>
          <p className="font-display text-3xl font-bold text-foreground">
            {data.activeUsers7d}
          </p>
          <p className="text-xs text-muted-foreground">
            Distinct users who sent at least one proposal in the last 7 days.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon, label, value,
}: { icon: any; label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
    <p className="font-display text-3xl font-bold text-foreground">{value}</p>
  </div>
);

export default AdminHealthCheck;
