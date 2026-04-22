import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { subscribeSetupPrompt, type SetupPromptPayload } from "@/lib/setupPrompt";

const SetupPromptModal = () => {
  const [payload, setPayload] = useState<SetupPromptPayload | null>(null);

  useEffect(() => {
    return subscribeSetupPrompt((p) => setPayload(p));
  }, []);

  const open = !!payload;
  const close = () => setPayload(null);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-foreground">{payload?.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{payload?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={close}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            Not now
          </button>
          {payload?.ctaHref && (
            <Link
              to={payload.ctaHref}
              onClick={close}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
            >
              {payload.ctaLabel || "Open Settings"}
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetupPromptModal;
