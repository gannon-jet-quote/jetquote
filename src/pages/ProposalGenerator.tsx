import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ConditionalFields from "@/components/ConditionalFields";
import ProposalOutput, { type ProposalMeta } from "@/components/ProposalOutput";
import LogoUpload from "@/components/LogoUpload";
import ColorPaletteSelector, { type ColorChoice } from "@/components/ColorPaletteSelector";
import { serviceTypes, toneOptions } from "@/config/serviceTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  clientName: string;
  clientEmail: string;
  serviceAddress: string;
  serviceType: string;
  jobDescription: string;
  totalPrice: string;
  timeline: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  tone: string;
  licensedInsured: boolean;
  satisfactionGuarantee: boolean;
  conditionalFields: Record<string, any>;
  logoDataUrl: string | null;
  primaryColor: ColorChoice | null;
  secondaryColor: ColorChoice | null;
  tertiaryColor: ColorChoice | null;
}

const STORAGE_KEY = "jetquote-business-info";

const initialForm: FormData = {
  clientName: "",
  clientEmail: "",
  serviceAddress: "",
  serviceType: "",
  jobDescription: "",
  totalPrice: "",
  timeline: "",
  businessName: "",
  businessPhone: "",
  businessEmail: "",
  tone: "standard",
  licensedInsured: false,
  satisfactionGuarantee: false,
  conditionalFields: {},
  logoDataUrl: null,
  primaryColor: null,
  secondaryColor: null,
  tertiaryColor: null,
};

const ProposalGenerator = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const { toast } = useToast();

  // Load saved business info
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({
          ...prev,
          businessName: parsed.businessName || "",
          businessPhone: parsed.businessPhone || "",
          businessEmail: parsed.businessEmail || "",
        }));
      }
    } catch {}
  }, []);

  // Save business info on change
  useEffect(() => {
    if (form.businessName || form.businessPhone || form.businessEmail) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          businessName: form.businessName,
          businessPhone: form.businessPhone,
          businessEmail: form.businessEmail,
        })
      );
    }
  }, [form.businessName, form.businessPhone, form.businessEmail]);

  const updateField = (name: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateConditional = (name: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      conditionalFields: { ...prev.conditionalFields, [name]: value },
    }));
  };

  const selectedService = serviceTypes.find((s) => s.id === form.serviceType);

  const handleGenerate = async () => {
    // Validation
    const required: (keyof FormData)[] = [
      "clientName", "serviceAddress", "serviceType",
      "jobDescription", "totalPrice", "timeline",
      "businessName", "businessPhone", "businessEmail",
    ];
    for (const field of required) {
      if (!form[field]) {
        toast({ title: "Missing field", description: `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`, variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("generate-proposal", {
        body: { ...form, serviceLabel: selectedService?.label },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate proposal");
      }

      setProposal(response.data.proposal);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProposal(null);
    setForm((prev) => ({
      ...initialForm,
      businessName: prev.businessName,
      businessPhone: prev.businessPhone,
      businessEmail: prev.businessEmail,
    }));
  };

  if (proposal) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-24 pb-16">
            <ProposalOutput
            proposal={proposal}
            meta={{
              tone: form.tone,
              businessName: form.businessName,
              businessPhone: form.businessPhone,
              businessEmail: form.businessEmail,
              clientName: form.clientName,
              clientEmail: form.clientEmail || undefined,
              serviceAddress: form.serviceAddress,
              licensedInsured: form.licensedInsured,
              satisfactionGuarantee: form.satisfactionGuarantee,
              logoDataUrl: form.logoDataUrl,
              primaryColor: form.primaryColor,
              secondaryColor: form.secondaryColor,
              tertiaryColor: form.tertiaryColor,
            }}
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Generate a Proposal</h1>
          <p className="mb-8 text-muted-foreground">Fill in the details below and let AI craft a professional proposal.</p>

          <div className="space-y-8">
            {/* Client Info */}
            <Section title="Client Information">
              <Field label="Client Name *">
                <Input value={form.clientName} onChange={(e) => updateField("clientName", e.target.value)} placeholder="John Smith" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
              </Field>
              <Field label="Client Email">
                <Input type="email" value={form.clientEmail} onChange={(e) => updateField("clientEmail", e.target.value)} placeholder="john@example.com" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
              </Field>
              <Field label="Service Address *">
                <Input value={form.serviceAddress} onChange={(e) => updateField("serviceAddress", e.target.value)} placeholder="123 Main St, City, ST" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
              </Field>
            </Section>

            {/* Service */}
            <Section title="Service Details">
              <Field label="Service Type *">
                <Select value={form.serviceType} onValueChange={(v) => { updateField("serviceType", v); updateField("conditionalFields", {}); }}>
                  <SelectTrigger className="border-border bg-input text-foreground">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {serviceTypes.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.icon} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {selectedService && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <ConditionalFields fields={selectedService.fields} values={form.conditionalFields} onChange={updateConditional} />
                </motion.div>
              )}

              <Field label="Job Description / Notes *">
                <Textarea value={form.jobDescription} onChange={(e) => updateField("jobDescription", e.target.value)} placeholder="Describe the job scope, special requirements, etc." rows={4} className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Total Price *">
                  <Input value={form.totalPrice} onChange={(e) => updateField("totalPrice", e.target.value)} placeholder="$500" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
                </Field>
                <Field label="Timeline / Availability *">
                  <Input value={form.timeline} onChange={(e) => updateField("timeline", e.target.value)} placeholder="Available next week" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
                </Field>
              </div>
            </Section>

            {/* Business */}
            <Section title="Your Business">
              <Field label="Business Name *">
                <Input value={form.businessName} onChange={(e) => updateField("businessName", e.target.value)} placeholder="Your Company LLC" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business Phone *">
                  <Input value={form.businessPhone} onChange={(e) => updateField("businessPhone", e.target.value)} placeholder="(555) 123-4567" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
                </Field>
                <Field label="Business Email *">
                  <Input type="email" value={form.businessEmail} onChange={(e) => updateField("businessEmail", e.target.value)} placeholder="you@company.com" className="border-border bg-input text-foreground placeholder:text-muted-foreground" />
                </Field>
              </div>
            </Section>

            {/* Branding */}
            <Section title="Branding">
              <LogoUpload
                logoDataUrl={form.logoDataUrl}
                onLogoChange={(v) => updateField("logoDataUrl", v)}
              />
            </Section>

            {/* Options */}
            <Section title="Proposal Options">
              <Field label="Tone">
                <Select value={form.tone} onValueChange={(v) => {
                  updateField("tone", v);
                  if (v === "standard") {
                    updateField("primaryColor", null);
                    updateField("secondaryColor", null);
                    updateField("tertiaryColor", null);
                  }
                  if (v !== "luxury") {
                    updateField("tertiaryColor", null);
                  }
                }}>
                  <SelectTrigger className="border-border bg-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {toneOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label} — {t.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <ColorPaletteSelector
                tone={form.tone}
                primaryColor={form.primaryColor}
                secondaryColor={form.secondaryColor}
                tertiaryColor={form.tertiaryColor}
                onPrimaryChange={(c) => updateField("primaryColor", c)}
                onSecondaryChange={(c) => updateField("secondaryColor", c)}
                onTertiaryChange={(c) => updateField("tertiaryColor", c)}
              />

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-input p-3 transition-colors hover:bg-accent">
                  <Checkbox checked={form.licensedInsured} onCheckedChange={(v) => updateField("licensedInsured", !!v)} />
                  <span className="text-sm text-secondary-foreground">Licensed & Insured</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-input p-3 transition-colors hover:bg-accent">
                  <Checkbox checked={form.satisfactionGuarantee} onCheckedChange={(v) => updateField("satisfactionGuarantee", !!v)} />
                  <span className="text-sm text-secondary-foreground">Include Satisfaction Guarantee</span>
                </label>
              </div>
            </Section>

            {/* Submit */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 glow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Proposal...
                </>
              ) : (
                "Generate Proposal"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-secondary-foreground">{label}</Label>
    {children}
  </div>
);

export default ProposalGenerator;
