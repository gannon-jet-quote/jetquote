import { useState, useEffect } from "react";
import { Loader2, Send, CheckCircle, XCircle } from "lucide-react";
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
import { generatePDFBase64 } from "@/lib/pdfTemplates";

interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  service_type: string;
  service_address: string;
  total_price_formatted: string;
  tone: string;
  proposal_text: string;
  branding: any;
  options: any;
}

interface Props {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: () => void;
  userName?: string;
}

function buildSubject(clientName: string, businessName?: string): string {
  const name = clientName?.trim() || "Client";
  if (businessName?.trim()) {
    return `${name} ${businessName.trim()} Job Proposal`;
  }
  return `${name} Job Proposal`;
}

function buildBody(clientName: string, userName?: string, businessEmail?: string): string {
  const senderName = userName?.trim() || "Our Team";
  const contactLine = businessEmail?.trim()
    ? `\n\nPlease contact ${businessEmail.trim()} for any reply to this quote.`
    : "";
  return `Hello ${clientName?.trim() || "there"},\n\nAs requested, here is your job proposal. Let me know if you have any questions.${contactLine}\n\nHave a great day,\n${senderName}`;
}

const SendEmailModal = ({ proposal, open, onOpenChange, onSent, userName }: Props) => {
  const p = proposal;
  const businessName = p?.branding?.businessName || "";

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const resetFields = () => {
    if (!p) return;
    setTo(p.client_email || "");
    setSubject(buildSubject(p.client_name, businessName));
    const senderName = userName || businessName || undefined;
    const bizEmail = p.branding?.businessEmail || "";
    setBody(buildBody(p.client_name, senderName, bizEmail));
    setStatus("idle");
    setErrorMsg("");
  };

  // Prefill fields whenever the modal opens or proposal changes
  useEffect(() => {
    if (open && p) resetFields();
  }, [open, p?.id]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const handleSend = async () => {
    if (!p || !to) return;
    setStatus("sending");
    setErrorMsg("");

    try {
      const meta = {
        tone: p.tone,
        businessName: p.branding?.businessName || "",
        businessPhone: p.branding?.businessPhone || "",
        businessEmail: p.branding?.businessEmail || "",
        clientName: p.client_name,
        clientEmail: p.client_email || undefined,
        serviceAddress: p.service_address,
        licensedInsured: p.options?.licensedInsured || false,
        satisfactionGuarantee: p.options?.satisfactionGuarantee || false,
        totalPrice: p.total_price_formatted,
        logoDataUrl: p.branding?.logoDataUrl || null,
        primaryColor: p.branding?.primaryColor || null,
        secondaryColor: p.branding?.secondaryColor || null,
        tertiaryColor: p.branding?.tertiaryColor || null,
      };

      const pdfBase64 = generatePDFBase64(p.proposal_text, meta);

      const sanitized = p.client_name
        ?.trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const fileDate = new Date().toISOString().slice(0, 10);
      const pdfFilename = `${sanitized || "Proposal"}-${fileDate}.pdf`;

      // Generate a unique public token for client response
      const publicToken = crypto.randomUUID();
      const sentAt = new Date();
      const followupScheduledFor = new Date(sentAt.getTime() + 48 * 60 * 60 * 1000);

      // Save the token, status, and schedule follow-up
      await supabase
        .from("proposals")
        .update({
          public_token: publicToken,
          status: "sent",
          needs_review: false,
          followup_scheduled_for: followupScheduledFor.toISOString(),
        } as any)
        .eq("id", p.id);

      const responseUrl = `${window.location.origin}/proposal/respond/${publicToken}`;

      const { data, error } = await supabase.functions.invoke("send-proposal-email", {
        body: { proposalId: p.id, to, subject, body, pdfBase64, pdfFilename, responseUrl },
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Send Proposal to Client</DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">Email Sent!</h3>
            <p className="text-sm text-muted-foreground">
              Proposal sent to <span className="font-medium text-foreground">{to}</span>
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
                rows={8}
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
                    <Send className="h-4 w-4" /> Send Email
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

export default SendEmailModal;
