import { useState } from "react";
import { Copy, Download, Plus, Check, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { generateStyledPDF } from "@/lib/pdfTemplates";
import type { ColorChoice } from "@/components/ColorPaletteSelector";

export interface ProposalMeta {
  tone: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  clientName: string;
  clientEmail?: string;
  serviceAddress: string;
  licensedInsured: boolean;
  satisfactionGuarantee: boolean;
  totalPrice: string;
  logoDataUrl?: string | null;
  primaryColor?: ColorChoice | null;
  secondaryColor?: ColorChoice | null;
  tertiaryColor?: ColorChoice | null;
}

interface Props {
  proposal: string;
  meta: ProposalMeta;
  onReset: () => void;
}

const ProposalOutput = ({ proposal, meta, onReset }: Props) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    generateStyledPDF(proposal, meta);
    toast({ title: "PDF downloaded" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      {/* Success State */}
      <div className="mb-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <CheckCircle className="mb-4 h-16 w-16 text-primary" />
        </motion.div>
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
          Your proposal is ready!
        </h2>
        <p className="text-muted-foreground">
          Download your PDF or copy the proposal to your clipboard.
        </p>
      </div>

      {/* View Details Toggle */}
      <button
        onClick={() => setShowDetails((v) => !v)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
      >
        {showDetails ? (
          <>
            <ChevronUp className="h-4 w-4" /> Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" /> View Details
          </>
        )}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mb-6 rounded-xl border border-border bg-card p-8 shadow-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-secondary-foreground">
                {proposal}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy to Clipboard"}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Create Another
        </button>
      </div>
    </motion.div>
  );
};

export default ProposalOutput;
