import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, FileText, Send, Calendar, Briefcase, Building2, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const [profileRes, proposalsRes, brandingRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("proposals").select("*").eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("branding_settings").select("*").eq("user_id", id).maybeSingle(),
      ]);

      setProfile(profileRes.data);
      setProposals(proposalsRes.data || []);
      setBranding(brandingRes.data);

      // Get email from auth via edge function or proposals
      const proposalWithEmail = (proposalsRes.data || []).find((p: any) => p.branding?.businessEmail);
      if (proposalWithEmail) setEmail(proposalWithEmail.branding.businessEmail);

      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-6 pt-24">
          <p className="text-muted-foreground">User not found.</p>
        </div>
      </div>
    );
  }

  const sentCount = proposals.filter((p) => p.sent_at).length;
  const services = [...new Set(proposals.map((p) => p.service_type))];
  const displayName = profile.full_name || `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/admin"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Link>

          {/* Profile Card */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <h1 className="mb-1 font-display text-2xl font-bold text-foreground">{displayName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.business_name && (
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {profile.business_name}</span>
              )}
              {profile.title && (
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {profile.title}</span>
              )}
              {email && (
                <span className="flex items-center gap-1">✉ {email}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" /> Proposals Created
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{proposals.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Send className="h-4 w-4" /> Proposals Sent
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{sentCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" /> Services Used
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {services.length > 0
                  ? services.map((s) => (
                      <span key={s} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {s}
                      </span>
                    ))
                  : <span className="text-sm text-muted-foreground">None</span>}
              </div>
            </div>
          </div>

          {/* Branding */}
          {branding && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <Palette className="h-5 w-5" /> Branding
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                {branding.logo_url && (
                  <img src={branding.logo_url} alt="Logo" className="h-14 w-14 rounded-lg border border-border object-contain bg-secondary p-1" />
                )}
                <div className="flex gap-3">
                  {branding.primary_color && (
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: branding.primary_color.hex || branding.primary_color }} />
                      <span className="text-xs text-muted-foreground">Primary</span>
                    </div>
                  )}
                  {branding.secondary_color && (
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: branding.secondary_color.hex || branding.secondary_color }} />
                      <span className="text-xs text-muted-foreground">Secondary</span>
                    </div>
                  )}
                  {branding.accent_color && (
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: branding.accent_color.hex || branding.accent_color }} />
                      <span className="text-xs text-muted-foreground">Accent</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Proposals Table */}
          <div className="rounded-xl border border-border bg-card">
            <div className="p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">Proposals</h2>
            </div>
            {proposals.length === 0 ? (
              <div className="px-5 pb-5 text-sm text-muted-foreground">No proposals yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Client</TableHead>
                    <TableHead className="text-muted-foreground">Service</TableHead>
                    <TableHead className="text-muted-foreground">Price</TableHead>
                    <TableHead className="text-muted-foreground">Tone</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((p) => (
                    <TableRow key={p.id} className="border-border">
                      <TableCell className="text-secondary-foreground">{p.client_name}</TableCell>
                      <TableCell className="text-secondary-foreground">{p.service_type}</TableCell>
                      <TableCell className="text-secondary-foreground">{p.total_price_formatted}</TableCell>
                      <TableCell>
                        <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {p.tone}
                        </span>
                      </TableCell>
                      <TableCell className="text-secondary-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-secondary-foreground">
                        {p.sent_at ? new Date(p.sent_at).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
