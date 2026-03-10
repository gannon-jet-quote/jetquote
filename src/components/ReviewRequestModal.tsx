import { useState, useEffect } from "react";
import { Loader2, Send, CheckCircle, XCircle, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  total_price_formatted: string;
  branding: any;
}

interface ReviewProfile {
  first_name: string;
  last_name: string;
  business_name: string;
  review_link: string | null;
  review_platform: string | null;
  review_signature_name: string | null;
}

interface Props {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
  reviewProfile: ReviewProfile | null;
}

function buildSubject(businessName: string): string {
  return `Quick favor — would you leave a review for ${businessName || "us"}?`;
}

function buildBody(
  clientName: string,
  businessName: string,
  userName: string,
  businessEmail: string,
  reviewLink: string
): string {
  return `Hello ${clientName?.trim() || "there"},

Thank you again for choosing ${businessName || "us"}. We really appreciate your business.

If you were happy with the service, would you mind leaving us a quick review? It helps our small business a lot.

Leave a review here:
${reviewLink}

Email ${businessEmail || "us"} with any questions.

Thank you,
${userName}
${businessName}`;
}

const ReviewRequestModal = ({ proposal, open, onOpenChange, onSent, reviewProfile }: Props) => {
  const p = proposal;
  const rp = reviewProfile;

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open && p && rp) {
      setTo(p.client_email || "");
      const businessName = p.branding?.businessName || rp.business_name || "";
      const userName = rp.review_signature_name?.trim() || `${rp.first_name} ${rp.last_name}`.trim() || businessName;
      const businessEmail = p.branding?.businessEmail || "";

      setSubject(buildSubject(businessName));
      setBody(
        buildBody(
          p.client_name,
          businessName,
          userName,
          businessEmail,
          rp.review_link || "(not set — update in Settings)"
        )
      );
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open, p?.id]);

  const handleSend = async () => {
    if (!p || !to) return;

    if (!rp?.review_link) {
      setStatus("error");
      setErrorMsg("Please add your Review Link in Settings first.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("send-review-request-email", {
        body: { proposalId: p.id, to, subject, body },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setStatus("success");
      onSent();
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Failed to send email");
    }
  };

  if (!p) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-primary" />
            Send Review Request
          </DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Review Request Sent!</h3>
            <p className="text-sm text-muted-foreground">
              Sent to <span className="font-medium text-foreground">{to}</span>
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!rp?.review_link && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                <XCircle className="h-4 w-4 shrink-0" />
                Review link not set. Please add your Review Link in Settings before sending.
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-secondary-foreground">To</Label>
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="client@example.com"
                className="border-border bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-border bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="border-border bg-input text-foreground"
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={status === "sending" || !to || !rp?.review_link}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Review Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewRequestModal;
