import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProposalData {
  client_name: string;
  service_type: string;
  total_price_formatted: string;
  status: string;
  business_name: string;
}

const ProposalRespond = () => {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!token) {
        setError("Invalid link");
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase.functions.invoke("get-proposal-by-token", {
        body: { token },
      });

      if (err || data?.error) {
        setError("This proposal could not be found.");
        setLoading(false);
        return;
      }

      if (data.status === "accepted" || data.status === "declined") {
        setProposal(data);
        setResult(data.status);
        setLoading(false);
        return;
      }

      setProposal(data);
      setLoading(false);
    };

    fetchProposal();
  }, [token]);

  const handleRespond = async (action: "accept" | "decline") => {
    if (!token) return;
    setResponding(true);

    const { data, error: err } = await supabase.functions.invoke("proposal-respond", {
      body: { token, action },
    });

    if (err) {
      setError("Something went wrong. Please try again.");
      setResponding(false);
      return;
    }

    if (data?.error === "already_responded") {
      setResult(data.status);
      setResponding(false);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setResponding(false);
      return;
    }

    setResult(data.status);
    setResponding(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="font-display text-xl font-bold text-foreground">{error}</h1>
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-primary" />

          {proposal.business_name && (
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              {proposal.business_name}
            </p>
          )}

          <h1 className="mb-6 font-display text-2xl font-bold text-foreground">
            Proposal for {proposal.client_name}
          </h1>

          <div className="mb-6 space-y-3 rounded-lg border border-border bg-secondary/50 p-4 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium text-foreground">{proposal.service_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium text-foreground">{proposal.total_price_formatted}</span>
            </div>
          </div>

          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              {result === "accepted" ? (
                <>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <p className="font-display text-lg font-semibold text-foreground">
                    Thank you, this proposal has been accepted.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto h-12 w-12 text-destructive" />
                  <p className="font-display text-lg font-semibold text-foreground">
                    Thank you, your response has been recorded.
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              <p className="mb-4 text-sm text-muted-foreground">
                Please review and respond to this proposal.
              </p>
              <button
                onClick={() => handleRespond("accept")}
                disabled={responding}
                className="w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50"
              >
                {responding ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Accept Proposal"
                )}
              </button>
              <button
                onClick={() => handleRespond("decline")}
                disabled={responding}
                className="w-full rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-accent disabled:opacity-50"
              >
                {responding ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Decline Proposal"
                )}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by JetQuote
        </p>
      </motion.div>
    </div>
  );
};

export default ProposalRespond;
