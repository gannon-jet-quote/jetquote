import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, FileText, Send, UserPlus, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

interface UserRow {
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  business_name: string;
  title: string | null;
  created_at: string;
  proposalCount: number;
  sentCount: number;
  acceptedCount: number;
  declinedCount: number;
  services: string[];
  email?: string;
}

interface UserProposal {
  id: string;
  client_name: string;
  service_type: string;
  total_price_formatted: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
}

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

const AdminPanel = ({ open, onClose }: AdminPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userProposals, setUserProposals] = useState<UserProposal[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProposals: 0,
    totalSent: 0,
    newUsersWeek: 0,
    sentWeek: 0,
  });

  useEffect(() => {
    if (!open) return;
    setSelectedUser(null);
    fetchData();
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: proposals } = await supabase
      .from("proposals")
      .select("user_id, sent_at, service_type, created_at, status, accepted_at, declined_at");

    const profileList = profiles || [];
    const proposalList = proposals || [];

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const totalSent = proposalList.filter((p) => p.sent_at).length;
    const sentWeek = proposalList.filter((p) => p.sent_at && new Date(p.sent_at) >= oneWeekAgo).length;
    const newUsersWeek = profileList.filter((p) => new Date(p.created_at) >= oneWeekAgo).length;

    setMetrics({
      totalUsers: profileList.length,
      totalProposals: proposalList.length,
      totalSent,
      newUsersWeek,
      sentWeek,
    });

    const userRows: UserRow[] = profileList.map((p: any) => {
      const userProps = proposalList.filter((pr) => pr.user_id === p.user_id);
      const services = [...new Set(userProps.map((pr) => pr.service_type))];
      return {
        user_id: p.user_id,
        first_name: p.first_name,
        last_name: p.last_name,
        full_name: p.full_name,
        business_name: p.business_name,
        title: p.title,
        created_at: p.created_at,
        proposalCount: userProps.length,
        sentCount: userProps.filter((pr) => pr.sent_at).length,
        acceptedCount: userProps.filter((pr) => pr.accepted_at != null || pr.status === "accepted").length,
        declinedCount: userProps.filter((pr) => pr.declined_at != null || pr.status === "declined").length,
        services,
      };
    });

    setUsers(userRows);
    setLoading(false);
  };

  const handleViewUser = async (u: UserRow) => {
    setSelectedUser(u);
    setLoadingDetail(true);
    const { data } = await supabase
      .from("proposals")
      .select("id, client_name, service_type, total_price_formatted, status, created_at, sent_at, accepted_at, declined_at")
      .eq("user_id", u.user_id)
      .order("created_at", { ascending: false });
    setUserProposals(data || []);
    setLoadingDetail(false);
  };

  const statCards = [
    { label: "Total Users", value: metrics.totalUsers, icon: Users },
    { label: "Total Proposals", value: metrics.totalProposals, icon: FileText },
    { label: "Proposals Sent", value: metrics.totalSent, icon: Send },
    { label: "New Users (7d)", value: metrics.newUsersWeek, icon: UserPlus },
    { label: "Sent (7d)", value: metrics.sentWeek, icon: TrendingUp },
  ];

  const statusLabel = (p: UserProposal) => {
    if (p.accepted_at) return "Accepted";
    if (p.declined_at) return "Declined";
    if (p.sent_at) return "Sent";
    return "Draft";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-4xl overflow-y-auto border-l border-border bg-background shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-3">
                {selectedUser && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="font-display text-xl font-bold text-foreground">
                  {selectedUser
                    ? selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`.trim() || "User Detail"
                    : "Admin Panel"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedUser ? (
                /* User Detail View */
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                    <p className="text-sm text-muted-foreground">Business</p>
                    <p className="font-medium text-foreground">{selectedUser.business_name || "—"}</p>
                    {selectedUser.title && (
                      <>
                        <p className="text-sm text-muted-foreground mt-3">Title</p>
                        <p className="font-medium text-foreground">{selectedUser.title}</p>
                      </>
                    )}
                    <p className="text-sm text-muted-foreground mt-3">Signed Up</p>
                    <p className="font-medium text-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Created", value: selectedUser.proposalCount },
                      { label: "Sent", value: selectedUser.sentCount },
                      { label: "Accepted", value: selectedUser.acceptedCount },
                      { label: "Declined", value: selectedUser.declinedCount },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {selectedUser.services.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">Services Used</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUser.services.map((s) => (
                          <span key={s} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Proposals</p>
                    {loadingDetail ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : userProposals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No proposals yet.</p>
                    ) : (
                      <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                              <TableHead className="text-muted-foreground">Client</TableHead>
                              <TableHead className="text-muted-foreground">Service</TableHead>
                              <TableHead className="text-muted-foreground">Price</TableHead>
                              <TableHead className="text-muted-foreground">Status</TableHead>
                              <TableHead className="text-muted-foreground">Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userProposals.map((p) => (
                              <TableRow key={p.id} className="border-border">
                                <TableCell className="text-foreground">{p.client_name}</TableCell>
                                <TableCell className="text-secondary-foreground">{p.service_type}</TableCell>
                                <TableCell className="text-secondary-foreground">{p.total_price_formatted}</TableCell>
                                <TableCell className="text-secondary-foreground">{statusLabel(p)}</TableCell>
                                <TableCell className="text-secondary-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Main Admin View */
                <div className="space-y-6">
                  {/* Metrics */}
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {statCards.map((s) => (
                      <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                        <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
                          <s.icon className="h-4 w-4" />
                          <span className="text-xs">{s.label}</span>
                        </div>
                        <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Users Table */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground">All Users</h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground">Name</TableHead>
                          <TableHead className="text-muted-foreground">Business</TableHead>
                          <TableHead className="text-muted-foreground">Signed Up</TableHead>
                          <TableHead className="text-muted-foreground text-right">Proposals</TableHead>
                          <TableHead className="text-muted-foreground text-right">Sent</TableHead>
                          <TableHead className="text-muted-foreground">Services</TableHead>
                          <TableHead className="text-muted-foreground"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.user_id} className="border-border">
                            <TableCell className="font-medium text-foreground">
                              {u.full_name || `${u.first_name} ${u.last_name}`.trim() || "—"}
                            </TableCell>
                            <TableCell className="text-secondary-foreground">{u.business_name || "—"}</TableCell>
                            <TableCell className="text-secondary-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right text-secondary-foreground">{u.proposalCount}</TableCell>
                            <TableCell className="text-right text-secondary-foreground">{u.sentCount}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {u.services.length > 0
                                  ? u.services.map((s) => (
                                      <span key={s} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                        {s}
                                      </span>
                                    ))
                                  : <span className="text-muted-foreground text-xs">—</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => handleViewUser(u)}
                                className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
                              >
                                View
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminPanel;
