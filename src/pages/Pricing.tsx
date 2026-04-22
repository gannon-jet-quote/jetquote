import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan, FREE_PROPOSAL_LIMIT } from "@/hooks/usePlan";
import { useToast } from "@/hooks/use-toast";

const freeFeatures: Array<{ label: string; included: boolean }> = [
  { label: `${FREE_PROPOSAL_LIMIT} proposal sends per month`, included: true },
  { label: "Unlimited PDF downloads", included: true },
  { label: "Client accept / decline workflow", included: true },
  { label: "Public quote request link", included: true },
  { label: "Auto follow-up emails", included: false },
  { label: "Payment requests", included: false },
  { label: "Review requests", included: false },
];

const proFeatures = [
  "Unlimited proposals sent",
  "Auto follow-up (48h) + manual follow-ups",
  "Payment request workflow",
  "Payment received tracking",
  "Review request workflow",
  "Unlimited quote request leads",
  "All analytics features",
  "Priority support",
];

const Pricing = () => {
  const { user } = useAuth();
  const { isPro } = usePlan();
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Coming soon",
      description: "Stripe checkout is being set up. We'll email you when it's live.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="font-display text-4xl font-bold text-foreground">
            Simple, transparent pricing
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start free. Upgrade when you're ready to scale.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground">Free</h2>
              {!isPro && user && (
                <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  Current plan
                </span>
              )}
            </div>
            <p className="mb-6">
              <span className="font-display text-4xl font-bold text-foreground">$0</span>
              <span className="ml-1 text-muted-foreground">/ month</span>
            </p>
            <ul className="mb-8 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-start gap-2 text-sm">
                  {f.included ? (
                    <Check className="mt-0.5 h-4 w-4 flex-none text-green-500" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground line-through"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="block w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-center text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              {user ? "Go to Dashboard" : "Get started free"}
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-primary/40 bg-card p-8 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.4)]">
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              <Sparkles className="h-3 w-3" /> Recommended
            </div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground">Pro</h2>
              {isPro && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                  Active
                </span>
              )}
            </div>
            <p className="mb-6">
              <span className="font-display text-4xl font-bold text-foreground">$29</span>
              <span className="ml-1 text-muted-foreground">/ month</span>
            </p>
            <ul className="mb-8 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <button
                disabled
                className="block w-full rounded-lg bg-primary/20 px-4 py-2.5 text-center text-sm font-medium text-primary"
              >
                Pro Active
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                <Sparkles className="h-4 w-4" /> Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
