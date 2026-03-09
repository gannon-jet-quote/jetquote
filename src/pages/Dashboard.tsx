import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Plus, Eye, Download, Copy, Trash2, FileText, Files, Mail, Send, DollarSign, TrendingUp, LinkIcon } from "lucide-react";
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
  status: string;
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
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [emailProposal, setEmailProposal] = useState<Proposal | null>(null);

  const sentThisMonth = (() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return proposals.filter(
      (p) => p.sent_at && new Date(p.sent_at) >= startOfMonth
    ).length;
  })();

  const avgJobValue = proposals.length
    ? proposals.reduce((sum, p) => sum + (Number(p.total_price_number) || 0), 0) / proposals.length
    : 0;

  const totalValue = proposals.reduce((sum, p) => sum + (Number(p.total_price_number) || 0), 0);

  const fmtCurrency = (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

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
  }, []);

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

  const handleDuplicate = (p: Proposal) => {
    navigate("/generate", {
      state: {
        duplicate: {
          clientName: p.client_name,
          clientEmail: p.client_email || "",
          serviceType: p.service_type,
          serviceAddress: p.service_address,
          jobDescription: (p as any).job_description || "",
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
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Proposals Sent This Month", value: String(sentThisMonth), icon: Send },
              { label: "Average Job Value All Time", value: fmtCurrency(avgJobValue), icon: TrendingUp },
              { label: "Total Value of Proposals", value: fmtCurrency(totalValue), icon: DollarSign },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            ))}
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
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        <Eye className="h-3.5 w-3.5" /> {expandedId === p.id ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => handleCopy(p.proposal_text)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        <Files className="h-3.5 w-3.5" /> Duplicate
                      </button>
                      <button
                        onClick={() => setEmailProposal(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                      >
                        <Mail className="h-3.5 w-3.5" /> Send
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
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
    </div>
  );
};

export default Dashboard;
