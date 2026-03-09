import { useState, useEffect } from "react";
import { Loader2, Send, CheckCircle, XCircle, DollarSign } from "lucide-react";
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

interface PaymentProfile {
  first_name: string;
  last_name: string;
  business_name: string;
  business_phone: string | null;
  payment_method_name: string | null;
  payment_link_or_instructions: string | null;
}

interface Props {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
  paymentProfile: PaymentProfile | null;
}

function buildSubject(clientName: string, businessName?: string): string {
  const name = clientName?.trim() || "Client";
  if (businessName?.trim()) {
    return `${name} ${businessName.trim()} Payment Request`;
  }
  return `${name} Payment Request`;
}

function buildBody(
  clientName: string,
  businessName: string,
  userName: string,
  businessEmail: string,
  amount: string,
  paymentMethodName: string,
  paymentLinkOrInstructions: string
): string {
  return `Hello ${clientName?.trim() || "there"},

Thank you again for choosing ${businessName || "us"}. Your service has been completed.

Amount Due: ${amount}

To submit payment, please use the method below:

${paymentMethodName}: ${paymentLinkOrInstructions}

Email ${businessEmail || "us"} with any questions.

Thank you,
${userName}
${businessName}`;
}

const PaymentRequestModal = ({ proposal, open, onOpenChange, onSent, paymentProfile }: Props) => {
  const p = proposal;
  const pp = paymentProfile;

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open && p && pp) {
      setTo(p.client_email || "");
      const businessName = p.branding?.businessName || pp.business_name || "";
      const userName = `${pp.first_name} ${pp.last_name}`.trim() || businessName;
      const businessEmail = p.branding?.businessEmail || "";

      setSubject(buildSubject(p.client_name, businessName));
      setBody(
        buildBody(
          p.client_name,
          businessName,
          userName,
          businessEmail,
          p.total_price_formatted,
          pp.payment_method_name || "Payment",
          pp.payment_link_or_instructions || "(not set — update in Settings)"
        )
      );
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open, p?.id]);

  const handleSend = async () => {
    if (!p || !to) return;
    setStatus("sending");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("send-payment-request-email", {
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
            <DollarSign className="h-5 w-5 text-primary" />
            Send Payment Request
          </DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Payment Request Sent!</h3>
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
            {(!pp?.payment_method_name || !pp?.payment_link_or_instructions) && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                <XCircle className="h-4 w-4 shrink-0" />
                Payment preferences not set. Update them in Settings for accurate payment details.
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
                disabled={status === "sending" || !to}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Payment Request
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

export default PaymentRequestModal;
