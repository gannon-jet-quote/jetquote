import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { subscribeUpgradeModal } from "@/lib/upgradeModal";

const UpgradeModal = () => {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState("This feature");

  useEffect(() => {
    return subscribeUpgradeModal((f) => {
      setFeature(f || "This feature");
      setOpen(true);
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-card text-foreground">
        <DialogHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {feature} is available on Pro. Upgrade to unlock unlimited sends,
            auto follow-ups, payment requests, and review requests.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            Not now
          </button>
          <Link
            to="/pricing"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" /> Upgrade to Pro
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
