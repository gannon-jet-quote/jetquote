import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProposalData {
  proposal_id: string;
  public_token: string;
  client_name: string;
  service_type: string;
  total_price_formatted: string;
  status: string;
  business_name: string;
  logo_url: string | null;
  primary_color: { hex: string } | null;
  accent_color: { hex: string } | null;
}

const ProposalRespond = () => {
  const { token: tokenParam } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const token = tokenParam || searchParams.get("token") || "";
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!token) {
        setError("This proposal link is missing a response token.");
        setLoading(false);
        return;
      }

      try {
        console.log("ProposalRespond loading token", { hasToken: Boolean(token) });
        const { data, error: err } = await supabase.functions.invoke("get-proposal-by-token", {
          body: { token },
        });

        console.log("ProposalRespond get-proposal response", { data, error: err });

        if (err || data?.error) {
          setError(data?.error || err?.message || "This proposal could not be found.");
          return;
        }

        if (!data) {
          setError("This proposal could not be found.");
          return;
        }

        setProposal(data);
        if (data.status === "accepted" || data.status === "declined") {
          setResult(data.status);
        }
      } catch (err) {
        console.error("ProposalRespond load exception:", err);
        setError("We couldn't load this proposal. Please contact your service provider.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [token]);

  const handleRespond = async (action: "accept" | "decline") => {
    if (!token) return;
    setResponding(true);
    setError(null);

    try {
      const { data, error: err } = await supabase.functions.invoke("proposal-respond", {
        body: { token, action },
      });

      console.log("ProposalRespond submit response", { action, data, error: err });

      if (err) {
        setError(err.message || "Something went wrong. Please try again.");
        return;
      }

      if (data?.error === "already_responded") {
        setResult(data.status);
        setProposal((prev) => prev ? { ...prev, status: data.status } : prev);
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      setResult(data.status);
      setProposal((prev) => prev ? { ...prev, status: data.status } : prev);
    } catch (err) {
      console.error("ProposalRespond submit exception:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setResponding(false);
    }
  };

  const brandColor = proposal?.primary_color?.hex || "#C9A227";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: brandColor }} />
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
          <h1 className="text-xl font-bold text-slate-800">{error}</h1>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <XCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
          <h1 className="mb-2 text-xl font-bold text-slate-800">Proposal unavailable</h1>
          <p className="text-sm text-slate-500">We couldn't load this proposal. Please contact your service provider.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Header with logo and business name */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {proposal.logo_url ? (
            <img
              src={proposal.logo_url}
              alt={`${proposal.business_name} logo`}
              className="h-16 max-w-[200px] object-contain"
            />
          ) : (
            proposal.business_name && (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ backgroundColor: brandColor }}
              >
                {proposal.business_name.charAt(0).toUpperCase()}
              </div>
            )
          )}
          {proposal.business_name && (
            <h2 className="text-lg font-semibold text-slate-700">
              {proposal.business_name}
            </h2>
          )}
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          {/* Colored top bar */}
          <div className="h-1.5" style={{ backgroundColor: brandColor }} />

          <div className="p-8">
            {/* Header */}
            <h1 className="mb-2 text-center text-lg font-bold text-slate-800">
              Proposal Review
            </h1>
            {/* Intro message */}
            <p className="mb-6 text-center text-sm text-slate-500">
              You have received a service proposal from{" "}
              <span className="font-semibold text-slate-700">
                {proposal.business_name || "a business"}
              </span>
              .
            </p>

            {/* Proposal details */}
            <div className="mb-8 space-y-0 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Client</span>
                <span className="text-sm font-semibold text-slate-800">{proposal.client_name}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Service</span>
                <span className="text-sm font-semibold text-slate-800">{proposal.service_type}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Proposal Amount</span>
                <span className="text-base font-bold text-slate-900">{proposal.total_price_formatted}</span>
              </div>
            </div>

            {/* Response section */}
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                {result === "accepted" ? (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle className="h-9 w-9 text-emerald-500" />
                    </div>
                    <p className="text-center text-lg font-semibold text-slate-800">
                      Thanks — we've notified {proposal.business_name || "your service provider"}.
                    </p>
                    <p className="text-center text-sm text-slate-500">This proposal has been accepted.</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                      <XCircle className="h-9 w-9 text-red-400" />
                    </div>
                    <p className="text-center text-lg font-semibold text-slate-800">
                      Thanks — we've notified {proposal.business_name || "your service provider"}.
                    </p>
                    <p className="text-center text-sm text-slate-500">This proposal has been declined.</p>
                  </>
                )}
                {(proposal.status === "accepted" || proposal.status === "declined") && (
                  <p className="text-center text-xs text-slate-400">Response already recorded.</p>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <p className="text-center text-sm text-slate-500">
                  Please confirm how you would like to proceed with this proposal.
                </p>
                <button
                  onClick={() => handleRespond("accept")}
                  disabled={responding}
                  className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  {responding ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    "Accept Proposal"
                  )}
                </button>
                <button
                  onClick={() => handleRespond("decline")}
                  disabled={responding}
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {responding ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    "Decline Proposal"
                  )}
                </button>
                <p className="pt-1 text-center text-xs text-slate-400">
                  Selecting an option simply notifies your service provider of your decision. This page is not a contract, payment authorization, or legally binding signature.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secured by JetQuote</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ProposalRespond;
