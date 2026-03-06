import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Users, FileText, Send, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
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
  services: string[];
  email?: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProposals: 0,
    totalSent: 0,
    newUsersWeek: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch all proposals
      const { data: proposals } = await supabase
        .from("proposals")
        .select("user_id, sent_at, service_type, created_at");

      const profileList = profiles || [];
      const proposalList = proposals || [];

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const totalSent = proposalList.filter((p) => p.sent_at).length;
      const newUsersWeek = profileList.filter(
        (p) => new Date(p.created_at) >= oneWeekAgo
      ).length;

      setMetrics({
        totalUsers: profileList.length,
        totalProposals: proposalList.length,
        totalSent,
        newUsersWeek,
      });

      // Build user rows with aggregated proposal data
      const userRows: UserRow[] = profileList.map((p: any) => {
        const userProposals = proposalList.filter((pr) => pr.user_id === p.user_id);
        const services = [...new Set(userProposals.map((pr) => pr.service_type))];
        return {
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          full_name: p.full_name,
          business_name: p.business_name,
          title: p.title,
          created_at: p.created_at,
          proposalCount: userProposals.length,
          sentCount: userProposals.filter((pr) => pr.sent_at).length,
          services,
        };
      });

      setUsers(userRows);
      setLoading(false);
    };

    fetchData();
  }, []);

  const statCards = [
    { label: "Total Users", value: metrics.totalUsers, icon: Users },
    { label: "Total Proposals", value: metrics.totalProposals, icon: FileText },
    { label: "Proposals Sent", value: metrics.totalSent, icon: Send },
    { label: "New Users (7d)", value: metrics.newUsersWeek, icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-6xl px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mb-8 text-muted-foreground">Platform analytics and user management.</p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Metrics */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <s.icon className="h-4 w-4" />
                      <span className="text-sm">{s.label}</span>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Users Table */}
              <div className="rounded-xl border border-border bg-card">
                <div className="p-5">
                  <h2 className="font-display text-lg font-semibold text-foreground">All Users</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Business</TableHead>
                      <TableHead className="text-muted-foreground">Title</TableHead>
                      <TableHead className="text-muted-foreground">Signed Up</TableHead>
                      <TableHead className="text-muted-foreground text-right">Proposals</TableHead>
                      <TableHead className="text-muted-foreground text-right">Sent</TableHead>
                      <TableHead className="text-muted-foreground">Services</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.user_id} className="border-border">
                        <TableCell>
                          <Link
                            to={`/admin/users/${u.user_id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {u.full_name || `${u.first_name} ${u.last_name}`.trim() || "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-secondary-foreground">{u.business_name || "—"}</TableCell>
                        <TableCell className="text-secondary-foreground">{u.title || "—"}</TableCell>
                        <TableCell className="text-secondary-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right text-secondary-foreground">{u.proposalCount}</TableCell>
                        <TableCell className="text-right text-secondary-foreground">{u.sentCount}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.services.length > 0
                              ? u.services.map((s) => (
                                  <span
                                    key={s}
                                    className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                                  >
                                    {s}
                                  </span>
                                ))
                              : <span className="text-muted-foreground text-xs">—</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
