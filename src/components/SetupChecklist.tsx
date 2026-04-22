import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";
import { useSetupChecklist } from "@/hooks/useSetupChecklist";
import { useAuth } from "@/contexts/AuthContext";

const DISMISS_KEY_PREFIX = "jq_setup_banner_dismissed_";

const SetupChecklist = () => {
  const { user } = useAuth();
  const { items, completed, total, allComplete, loading } = useSetupChecklist();
  const dismissKey = user ? `${DISMISS_KEY_PREFIX}${user.id}` : null;

  const [dismissed, setDismissed] = useState(false);
  const [bannerExpanded, setBannerExpanded] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (!dismissKey) return;
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  if (loading) return null;

  const handleDismiss = () => {
    if (dismissKey) localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  // Collapsed success banner once everything is complete
  if (allComplete && !forceShow) {
    if (dismissed) {
      return (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              setForceShow(true);
              setBannerExpanded(true);
            }}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Setup
          </button>
        </div>
      );
    }
    return (
      <div className="mb-6 rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Setup complete 🎉</span>{" "}
              <span className="text-muted-foreground">You're ready to send proposals.</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setForceShow(true);
                setBannerExpanded(true);
              }}
              className="text-xs font-medium text-primary transition-colors hover:brightness-125"
            >
              View checklist
            </button>
            <button
              onClick={handleDismiss}
              title="Dismiss"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full checklist widget
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">Setup Checklist</h3>
            <p className="text-xs text-muted-foreground">
              {completed} of {total} complete — finish setup to unlock the full JetQuote workflow.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allComplete && forceShow && (
            <button
              onClick={() => setForceShow(false)}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronUp className="h-3.5 w-3.5" /> Collapse
            </button>
          )}
          <button
            onClick={() => setBannerExpanded((v) => !v)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
            title={bannerExpanded ? "Hide" : "Show"}
          >
            {bannerExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      <ul className={`space-y-2 ${bannerExpanded ? "" : "hidden sm:block"}`}>
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />
              )}
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {item.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            {item.done ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                Done
              </span>
            ) : (
              <Link
                to={item.ctaHref}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                {item.ctaLabel}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SetupChecklist;
