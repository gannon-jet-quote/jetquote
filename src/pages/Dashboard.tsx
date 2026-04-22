import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Plus, Eye, Download, Copy, Trash2, FileText, Files, Mail, Send, DollarSign, TrendingUp, LinkIcon, Pencil, AlertCircle, CheckCircle, XCircle, Clock, BadgeDollarSign, CircleCheckBig, Star, RotateCw, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateStyledPDF } from "@/lib/pdfTemplates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SendEmailModal from "@/components/SendEmailModal";
import PaymentRequestModal from "@/components/PaymentRequestModal";
import ReviewRequestModal from "@/components/ReviewRequestModal";
import ProposalStepper, { getStepState } from "@/components/ProposalStepper";
import { usePlan } from "@/hooks/usePlan";
import { openUpgradeModal } from "@/lib/upgradeModal";
import { Sparkles } from "lucide-react";

interface Proposal {
  id: string;
  client_name: string;
  client_email: string | null;
  service_type: string;
  service_address: string;
  job_description: string;
  total_price_formatted: string;
  total_price_number: number;
  tone: string;
  proposal_text: string;
  branding: any;
  options: any;
  created_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  status: string;
  needs_review: boolean;
  followup_enabled: boolean;
  followup_scheduled_for: string | null;
  followup_sent_at: string | null;
  completed_at: string | null;
  payment_request_sent_at: string | null;
  payment_status: string;
  payment_received_at: string | null;
  review_request_sent_at: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-muted-foreground/30 bg-muted text-muted-foreground" },
  sent: { label: "Sent", className: "border-primary/30 bg-primary/10 text-primary" },
  accepted: { label: "Accepted", className: "border-green-500/30 bg-green-500/10 text-green-500" },
  declined: { label: "Declined", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPro, sentThisMonth: planSentMonth, freeLimit, atFreeLimit } = usePlan();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [emailProposal, setEmailProposal] = useState<Proposal | null>(null);
  const [paymentProposal, setPaymentProposal] = useState<Proposal | null>(null);
  const [reviewProposal, setReviewProposal] = useState<Proposal | null>(null);
  const [paymentProfile, setPaymentProfile] = useState<any>(null);
  const [reviewProfile, setReviewProfile] = useState<any>(null);
  const [followupSendingId, setFollowupSendingId] = useState<string | null>(null);

  const handleSendFollowupNow = async (p: Proposal) => {
    // Guardrails: only allow follow-up for sent proposals with a client email,
    // and never for accepted/declined ones.
    if (p.status !== "sent") {
      toast({
        title: "Can't send follow-up",
        description: "Follow-ups can only be sent for proposals in the Sent state.",
        variant: "destructive",
      });
      return;
    }
    if (p.accepted_at || p.declined_at) {
      toast({
        title: "Can't send follow-up",
        description: "This proposal has already been responded to.",
        variant: "destructive",
      });
      return;
    }
    if (!p.client_email?.trim()) {
      toast({
        title: "Missing client email",
        description: "Add a client email to this proposal before sending a follow-up.",
        variant: "destructive",
      });
      return;
    }
    setFollowupSendingId(p.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-followup-emails", {
        body: { proposalId: p.id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const sent = typeof data?.sent === "number" ? data.sent : 0;
      if (sent > 0) {
        const nowIso = new Date().toISOString();
        setProposals((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, followup_sent_at: nowIso } : x))
        );
        toast({ title: p.followup_sent_at ? "Follow-up resent" : "Follow-up sent" });
      } else {
        toast({
          title: "Follow-up not sent",
          description: "Make sure the client email is set on this proposal.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to send follow-up", variant: "destructive" });
    } finally {
      setFollowupSendingId(null);
    }
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sentThisMonth = proposals.filter(
    (p) => p.sent_at && new Date(p.sent_at) >= startOfMonth
  ).length;

  const acceptedThisMonth = proposals.filter(
    (p) => (p.accepted_at || p.status === "accepted") && p.accepted_at && new Date(p.accepted_at) >= startOfMonth
  );
  const declinedThisMonth = proposals.filter(
    (p) => (p.declined_at || p.status === "declined") && p.declined_at && new Date(p.declined_at) >= startOfMonth
  );
  const respondedThisMonth = acceptedThisMonth.length + declinedThisMonth.length;
  const acceptanceRateMonth = respondedThisMonth > 0 ? (acceptedThisMonth.length / respondedThisMonth) * 100 : 0;
  const declineRateMonth = respondedThisMonth > 0 ? (declinedThisMonth.length / respondedThisMonth) * 100 : 0;

  const wonThisMonth = acceptedThisMonth.reduce((sum, p) => sum + (Number(p.total_price_number) || 0), 0);

  const allAccepted = proposals.filter((p) => p.accepted_at != null || p.status === "accepted");
  const wonAllTime = allAccepted.reduce((sum, p) => sum + (Number(p.total_price_number) || 0), 0);

  const avgJobValue = proposals.length
    ? proposals.reduce((sum, p) => sum + (Number(p.total_price_number) || 0), 0) / proposals.length
    : 0;

  const totalValue = proposals.reduce((sum, p) => sum + (Number(p.total_price_number) || 0), 0);

  const [showMoreMetrics, setShowMoreMetrics] = useState(false);

  const fmtCurrency = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  const fmtPct = (v: number) => (v % 1 === 0 ? `${v}%` : `${v.toFixed(1)}%`);

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading proposals", description: error.message, variant: "destructive" });
    } else {
      setProposals((data as Proposal[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
    if (user) {
      supabase
        .from("profiles")
        .select("first_name, last_name, business_name, business_phone, payment_method_name, payment_link_or_instructions, review_platform, review_link, review_signature_name")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setPaymentProfile(data);
          setReviewProfile(data);
        });
    }
  }, [user]);

  const handleMarkComplete = async (p: Proposal) => {
    const { error } = await supabase
      .from("proposals")
      .update({ completed_at: new Date().toISOString() } as any)
      .eq("id", p.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProposals((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, completed_at: new Date().toISOString() } : x
        )
      );
      toast({ title: "Job marked as completed" });
    }
  };

  const handleMarkPaymentReceived = async (p: Proposal) => {
    const { error } = await supabase
      .from("proposals")
      .update({ payment_status: "paid", payment_received_at: new Date().toISOString() } as any)
      .eq("id", p.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProposals((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, payment_status: "paid", payment_received_at: new Date().toISOString() } as any : x
        )
      );
      toast({ title: "Payment marked as received" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProposals((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Proposal deleted" });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const buildProposalState = (p: Proposal) => ({
    clientName: p.client_name,
    clientEmail: p.client_email || "",
    serviceType: p.service_type,
    serviceAddress: p.service_address,
    jobDescription: p.job_description || "",
    totalPrice: p.total_price_formatted,
    tone: p.tone,
    logoDataUrl: p.branding?.logoDataUrl || null,
    primaryColor: p.branding?.primaryColor || null,
    secondaryColor: p.branding?.secondaryColor || null,
    tertiaryColor: p.branding?.tertiaryColor || null,
    businessName: p.branding?.businessName || "",
    businessPhone: p.branding?.businessPhone || "",
    businessEmail: p.branding?.businessEmail || "",
    licensedInsured: p.options?.licensedInsured || false,
    satisfactionGuarantee: p.options?.satisfactionGuarantee || false,
    conditionalFields: p.options?.conditionalFields || {},
  });

  const handleDuplicate = (p: Proposal) => {
    navigate("/generate", { state: { duplicate: buildProposalState(p) } });
  };

  const handleEdit = (p: Proposal) => {
    navigate("/generate", {
      state: {
        edit: {
          proposalId: p.id,
          proposalText: p.proposal_text,
          ...buildProposalState(p),
        },
      },
    });
  };

  const handleDownloadPDF = (p: Proposal) => {
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
    generateStyledPDF(p.proposal_text, meta);
    toast({ title: "PDF downloaded" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Proposals</h1>
              <p className="text-muted-foreground">Manage and download your saved proposals.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.username && (
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/request/${profile.username}`;
                    navigator.clipboard.writeText(link);
                    toast({ title: "Quote request link copied!" });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-accent"
                >
                  <LinkIcon className="h-4 w-4" /> Copy Quote Link
                </button>
              )}
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-sm"
              >
                <Plus className="h-4 w-4" /> New Proposal
              </Link>
            </div>
          </div>

          {/* Plan card */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isPro ? "bg-primary/10" : "bg-muted"}`}>
                <Sparkles className={`h-4 w-4 ${isPro ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isPro ? "Pro plan" : "Free plan"}
                </p>
                {!isPro ? (
                  <p className="text-xs text-muted-foreground">
                    {Math.min(planSentMonth, freeLimit)} of {freeLimit} proposals sent this month
                    {atFreeLimit ? " — limit reached" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Unlimited sends, follow-ups, payments & reviews</p>
                )}
              </div>
            </div>
            {isPro ? (
              <span className="inline-flex items-center gap-1 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:self-auto">
                <Sparkles className="h-3 w-3" /> Pro Active
              </span>
            ) : (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 self-start rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:brightness-110 sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" /> Upgrade to Pro
              </Link>
            )}
          </div>

          <div className="mb-8 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Sent This Month</p>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">{sentThisMonth}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Acceptance Rate (This Month)</p>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-display text-2xl font-bold text-foreground">{fmtPct(acceptanceRateMonth)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Decline rate: {fmtPct(declineRateMonth)}
                </p>
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Won This Month</p>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">{fmtCurrency(wonThisMonth)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Won All-Time</p>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">{fmtCurrency(wonAllTime)}</p>
              </div>
            </div>
            {/* Row 3 */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Avg Job Value (All-Time)</p>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">{fmtCurrency(avgJobValue)}</p>
            </div>
            {/* More metrics collapsible */}
            <div>
              <button
                onClick={() => setShowMoreMetrics(!showMoreMetrics)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showMoreMetrics ? "Hide" : "More metrics ›"}
              </button>
              {showMoreMetrics && (
                <div className="mt-3 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Total Value of All Proposals</p>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold text-foreground">{fmtCurrency(totalValue)}</p>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">No proposals yet</h3>
              <p className="mb-6 text-sm text-muted-foreground">Generate your first proposal to get started.</p>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> Create Proposal
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-lg font-semibold text-foreground">{p.client_name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        <span className="text-border">•</span>
                        <span>{p.total_price_formatted}</span>
                        <span className="text-border">•</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig[p.status]?.className || statusConfig.draft.className}`}>
                          {statusConfig[p.status]?.label || "Draft"}
                        </span>
                        {p.completed_at && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                            <CircleCheckBig className="h-3 w-3" /> Job Completed
                          </span>
                        )}
                        {p.needs_review && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500">
                            <AlertCircle className="h-3 w-3" /> Needs Review
                          </span>
                        )}
                        {(p as any).payment_request_sent_at && (p as any).payment_status !== "paid" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                            <BadgeDollarSign className="h-3 w-3" /> Payment Requested
                          </span>
                        )}
                        {(p as any).payment_status === "paid" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-green-600/30 bg-green-600/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                            <CheckCircle className="h-3 w-3" /> Paid {(p as any).payment_received_at ? `· ${new Date((p as any).payment_received_at).toLocaleDateString()}` : ""}
                          </span>
                        )}
                        {(p as any).review_request_sent_at && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500">
                            <Star className="h-3 w-3" /> Review Requested
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        title={expandedId === p.id ? "Hide proposal" : "View proposal"}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(p)}
                        title="Download PDF"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(p.proposal_text)}
                        title="Copy proposal text"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        title="Duplicate proposal"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Files className="h-4 w-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            title="Delete proposal"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-border bg-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Delete proposal?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              This will permanently delete this proposal for {p.client_name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border bg-secondary text-secondary-foreground hover:bg-accent">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {p.status === "sent" && !p.accepted_at && !p.declined_at && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (!isPro) {
                            openUpgradeModal("Auto follow-up emails");
                            return;
                          }
                          const newVal = !p.followup_enabled;
                          await supabase
                            .from("proposals")
                            .update({
                              followup_enabled: newVal,
                              followup_scheduled_for: newVal && p.sent_at && !p.followup_sent_at
                                ? new Date(new Date(p.sent_at).getTime() + 48 * 60 * 60 * 1000).toISOString()
                                : newVal ? p.followup_scheduled_for : null,
                            } as any)
                            .eq("id", p.id);
                          setProposals((prev) =>
                            prev.map((x) =>
                              x.id === p.id ? { ...x, followup_enabled: newVal } : x
                            )
                          );
                          toast({ title: newVal ? "Follow-up enabled" : "Follow-up disabled" });
                        }}
                        title={isPro ? "Toggle auto follow-up" : "Auto follow-up is a Pro feature"}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            isPro && p.followup_enabled
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-transparent"
                          }`}
                        >
                          {isPro && p.followup_enabled && <CheckCircle className="h-3 w-3" />}
                        </div>
                        <Clock className="h-3.5 w-3.5" />
                        <span>Auto-follow up in 48 hours if no response</span>
                        {!isPro && <Sparkles className="h-3 w-3 text-primary" />}
                      </button>
                      {p.followup_sent_at && (
                        <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Follow-up sent
                        </span>
                      )}
                    </div>
                  )}

                  {expandedId === p.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-4 overflow-hidden rounded-lg border border-border bg-input p-4"
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-secondary-foreground">
                        {p.proposal_text}
                      </pre>
                    </motion.div>
                  )}

                  <ProposalStepper proposal={p} />

                  {/* Step-aligned primary CTAs */}
                  {(() => {
                    const { current, isDeclined } = getStepState(p);
                    const ctas: React.ReactNode[] = [];

                    const hasClientEmail = !!p.client_email?.trim();
                    const hasReviewLink = !!reviewProfile?.review_link?.trim();
                    const hasPaymentPrefs =
                      !!paymentProfile?.payment_method_name?.trim() &&
                      !!paymentProfile?.payment_link_or_instructions?.trim();

                    const primaryBtn =
                      "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100";
                    const secondaryBtn =
                      "inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary";

                    if (isDeclined) {
                      // Declined branch: hide downstream steps; offer recovery actions
                      ctas.push(
                        <button
                          key="resend-declined"
                          onClick={() => setEmailProposal(p)}
                          title="Resend the proposal email"
                          className={secondaryBtn}
                        >
                          <RotateCw className="h-3.5 w-3.5" /> Resend Proposal
                        </button>,
                        <button
                          key="duplicate-declined"
                          onClick={() => handleDuplicate(p)}
                          title="Create a new proposal based on this one"
                          className={primaryBtn}
                        >
                          <Files className="h-3.5 w-3.5" /> Duplicate
                        </button>
                      );
                    } else if (current === "draft") {
                      const sendBlocked = !isPro && atFreeLimit;
                      ctas.push(
                        <button
                          key="edit"
                          onClick={() => handleEdit(p)}
                          title="Edit this draft"
                          className={secondaryBtn}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>,
                        <button
                          key="send"
                          onClick={() => {
                            if (sendBlocked) {
                              openUpgradeModal(`You've used all ${freeLimit} free proposal sends this month`);
                              return;
                            }
                            setEmailProposal(p);
                          }}
                          disabled={!hasClientEmail}
                          title={
                            !hasClientEmail
                              ? "Add a client email to send this proposal"
                              : sendBlocked
                                ? `Free plan limit reached (${freeLimit}/mo). Upgrade to Pro for unlimited sends.`
                                : "Send proposal to client"
                          }
                          className={primaryBtn}
                        >
                          <Mail className="h-3.5 w-3.5" /> Send Proposal
                          {sendBlocked && hasClientEmail && <Sparkles className="h-3 w-3" />}
                        </button>
                      );
                    } else if (current === "sent") {
                      const sendBlocked = !isPro && atFreeLimit;
                      ctas.push(
                        <button
                          key="resend"
                          onClick={() => {
                            if (sendBlocked) {
                              openUpgradeModal(`You've used all ${freeLimit} free proposal sends this month`);
                              return;
                            }
                            setEmailProposal(p);
                          }}
                          disabled={!hasClientEmail}
                          title={
                            !hasClientEmail
                              ? "Add a client email to resend"
                              : sendBlocked
                                ? "Free plan limit reached. Upgrade to Pro to resend."
                                : "Resend the proposal email"
                          }
                          className={secondaryBtn}
                        >
                          <RotateCw className="h-3.5 w-3.5" /> Resend Proposal
                        </button>
                      );
                      // Only show Send Follow-Up Now if not already sent
                      if (!p.followup_sent_at) {
                        const followupDisabled = !hasClientEmail || followupSendingId === p.id;
                        ctas.push(
                          <button
                            key="followup"
                            onClick={() => {
                              if (!isPro) {
                                openUpgradeModal("Manual follow-up sending");
                                return;
                              }
                              handleSendFollowupNow(p);
                            }}
                            disabled={followupDisabled}
                            title={
                              !isPro
                                ? "Follow-ups are a Pro feature. Upgrade to send."
                                : !hasClientEmail
                                  ? "Add a client email to send a follow-up"
                                  : "Send the follow-up email now"
                            }
                            className={primaryBtn}
                          >
                            {followupSendingId === p.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
                              </>
                            ) : (
                              <>
                                <Bell className="h-3.5 w-3.5" /> Send Follow-Up Now
                                {!isPro && <Sparkles className="h-3 w-3" />}
                              </>
                            )}
                          </button>
                        );
                      }
                    } else if (current === "accepted") {
                      ctas.push(
                        <button
                          key="complete"
                          onClick={() => handleMarkComplete(p)}
                          title="Mark this job as completed to unlock payment requests"
                          className={primaryBtn}
                        >
                          <CircleCheckBig className="h-3.5 w-3.5" /> Mark Job Complete
                        </button>
                      );
                    } else if (current === "completed") {
                      const paymentDisabled = !hasClientEmail || (isPro && !hasPaymentPrefs);
                      const paymentTitle = !isPro
                        ? "Payment requests are a Pro feature. Upgrade to send."
                        : !hasClientEmail
                          ? "Add a client email to send a payment request"
                          : !hasPaymentPrefs
                            ? "Add Payment Preferences in Settings to send payment requests"
                            : p.payment_request_sent_at
                              ? "Resend the payment request"
                              : "Send a payment request to the client";
                      ctas.push(
                        <button
                          key="payment"
                          onClick={() => {
                            if (!isPro) {
                              openUpgradeModal("Payment requests");
                              return;
                            }
                            setPaymentProposal(p);
                          }}
                          disabled={paymentDisabled}
                          title={paymentTitle}
                          className={primaryBtn}
                        >
                          <BadgeDollarSign className="h-3.5 w-3.5" /> {p.payment_request_sent_at ? "Resend Payment Request" : "Send Payment Request"}
                          {!isPro && <Sparkles className="h-3 w-3" />}
                        </button>
                      );
                      if (p.payment_status === "requested") {
                        ctas.push(
                          <button
                            key="markpaid"
                            onClick={() => handleMarkPaymentReceived(p)}
                            title="Record that payment has been received"
                            className={secondaryBtn}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Mark Payment Received
                          </button>
                        );
                      }
                    } else if (current === "paid") {
                      const reviewDisabled = !hasClientEmail || (isPro && !hasReviewLink);
                      const reviewTitle = !isPro
                        ? "Review requests are a Pro feature. Upgrade to send."
                        : !hasClientEmail
                          ? "Add a client email to send a review request"
                          : !hasReviewLink
                            ? "Add your Review Link in Settings to send review requests"
                            : "Send a review request to the client";
                      ctas.push(
                        <button
                          key="review"
                          onClick={() => {
                            if (!isPro) {
                              openUpgradeModal("Review requests");
                              return;
                            }
                            setReviewProposal(p);
                          }}
                          disabled={reviewDisabled}
                          title={reviewTitle}
                          className={primaryBtn}
                        >
                          <Star className="h-3.5 w-3.5" /> Send Review Request
                          {!isPro && <Sparkles className="h-3 w-3" />}
                        </button>
                      );
                    } else if (current === "review") {
                      const reviewDisabled = !hasClientEmail || (isPro && !hasReviewLink);
                      const reviewTitle = !isPro
                        ? "Review requests are a Pro feature. Upgrade to resend."
                        : !hasClientEmail
                          ? "Add a client email to resend"
                          : !hasReviewLink
                            ? "Add your Review Link in Settings to resend"
                            : "Resend the review request";
                      ctas.push(
                        <button
                          key="resend-review"
                          onClick={() => {
                            if (!isPro) {
                              openUpgradeModal("Review requests");
                              return;
                            }
                            setReviewProposal(p);
                          }}
                          disabled={reviewDisabled}
                          title={reviewTitle}
                          className={secondaryBtn}
                        >
                          <RotateCw className="h-3.5 w-3.5" /> Resend Review Request
                        </button>
                      );
                    }

                    if (ctas.length === 0) return null;
                    return (
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        {ctas}
                      </div>
                    );
                  })()}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <SendEmailModal
        proposal={emailProposal}
        open={!!emailProposal}
        onOpenChange={(open) => !open && setEmailProposal(null)}
        onSent={() => fetchProposals()}
        userName={profile?.full_name || profile?.business_name}
      />
      <PaymentRequestModal
        proposal={paymentProposal}
        open={!!paymentProposal}
        onOpenChange={(open) => !open && setPaymentProposal(null)}
        onSent={() => fetchProposals()}
        paymentProfile={paymentProfile}
      />
      <ReviewRequestModal
        proposal={reviewProposal}
        open={!!reviewProposal}
        onOpenChange={(open) => !open && setReviewProposal(null)}
        onSent={() => fetchProposals()}
        reviewProfile={reviewProfile}
      />
    </div>
  );
};

export default Dashboard;
