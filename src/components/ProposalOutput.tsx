import { useState } from "react";
import { Copy, Download, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Props {
  proposal: string;
  onReset: () => void;
}

const ProposalOutput = ({ proposal, onReset }: Props) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(proposal, 170);
    doc.setFont("helvetica");
    doc.setFontSize(11);
    let y = 20;
    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    }
    doc.save("JetQuote-Proposal.pdf");
    toast({ title: "PDF downloaded" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl"
    >
      <h2 className="mb-6 font-display text-2xl font-bold text-foreground">Your Proposal</h2>

      <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-secondary-foreground">
          {proposal}
        </pre>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
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
