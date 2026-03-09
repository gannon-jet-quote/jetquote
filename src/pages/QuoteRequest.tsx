import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { serviceTypes } from "@/config/serviceTypes";
import { useToast } from "@/hooks/use-toast";

interface BusinessInfo {
  user_id: string;
  business_name: string;
  logo_url?: string | null;
  primary_color?: any;
}

const QuoteRequest = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();

  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!username) { setNotFound(true); setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, business_name")
        .eq("username", username)
        .maybeSingle();

      if (!profile) { setNotFound(true); setLoading(false); return; }

      // Get branding
      const { data: branding } = await supabase
        .from("branding_settings")
        .select("logo_url, primary_color")
        .eq("user_id", profile.user_id)
        .maybeSingle();

      setBusiness({
        user_id: profile.user_id,
        business_name: profile.business_name,
        logo_url: branding?.logo_url,
        primary_color: branding?.primary_color,
      });
      setLoading(false);
    };
    fetchBusiness();
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !serviceType || !propertyAddress.trim() || !projectDescription.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("submit-quote-request", {
        body: {
          username,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim() || null,
          serviceType,
          propertyAddress: propertyAddress.trim(),
          projectDescription: projectDescription.trim(),
        },
      });
      if (res.error) throw new Error(res.error.message);
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Error submitting request", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const brandColor = business?.primary_color?.hex || "#3b82f6";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Page Not Found</h1>
        <p className="text-slate-500">This quote request page doesn't exist.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${brandColor}15` }}>
            <CheckCircle className="h-8 w-8" style={{ color: brandColor }} />
          </div>
          <h1 className="mb-2 text-xl font-bold text-slate-800">Quote Request Submitted</h1>
          <p className="text-sm text-slate-500">
            Thank you! {business?.business_name} has received your request and will be in touch soon.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          {business?.logo_url && (
            <img
              src={business.logo_url}
              alt={business.business_name}
              className="mx-auto mb-3 h-16 w-auto object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-slate-800">
            Request a Quote
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            from {business?.business_name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Name *</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Your full name"
                className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:ring-2"
                style={{ "--tw-ring-color": brandColor } as any}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Email *</Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Phone</Label>
              <Input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType} required>
                <SelectTrigger className="border-slate-200 bg-white text-slate-800">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-slate-800">
                  {serviceTypes.map((s) => (
                    <SelectItem key={s.id} value={s.label}>
                      {s.icon} {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Property Address *</Label>
              <Input
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Project Description *</Label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe the work you need done..."
                rows={4}
                className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: brandColor }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? "Submitting…" : "Request Quote"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Powered by JetQuote
        </p>
      </motion.div>
    </div>
  );
};

export default QuoteRequest;
