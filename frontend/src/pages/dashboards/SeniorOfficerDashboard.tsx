import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import axiosClient from "../../api/axiosClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  TrendingUp,
  AlertOctagon,
  Users,
  RefreshCw,
  Flame,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";

export const SeniorOfficerDashboard: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<{
    overdueCount: number;
    escalatedCount: number;
    topBreaches: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOverdueSummary = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get<{ success: boolean; data: any }>("/sla/overdue-summary");
      if (response.data?.success) {
        setSummary(response.data.data);
      }
    } catch {
      toast.error("Failed to load SLA escalation command analytics.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Senior Executive Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-900/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-0.5 rounded-full border border-indigo-400/30 font-bold">
              Senior Executive SLA Oversight
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Department Escalation & SLA Command Center
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
            Real-time monitoring of department turnaround times, automated Level-1/2 escalations,
            field officer backlog inspection, and citizen satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverdueSummary}
            isLoading={isLoading}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 2. Executive Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breached SLA Cases</p>
              <p className="text-2xl font-black text-rose-600 font-mono">
                {isLoading ? "..." : summary?.overdueCount ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Escalations</p>
              <p className="text-2xl font-black text-amber-600 font-mono">
                {isLoading ? "..." : summary?.escalatedCount ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Priority</p>
              <p className="text-2xl font-black text-blue-700 font-mono">High Vigilance</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auto Escalation SLA</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">24h Grace</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. SLA Breaches & Overdue Grievances Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <CardTitle className="text-base">High-Priority SLA Breaches & Overdue Grievances</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Complaints exceeding mandatory turnaround deadlines requiring executive escalation or re-allocation
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Grievance Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target SLA Deadline</TableHead>
                <TableHead>Assigned Officer</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-xs text-slate-400">
                    Scanning departmental SLA records...
                  </TableCell>
                </TableRow>
              ) : !summary?.topBreaches || summary.topBreaches.length === 0 ? (
                <EmptyTableState
                  title="Zero active SLA breaches"
                  description="All departmental grievances are progressing within stipulated SLA timelines."
                  colSpan={8}
                />
              ) : (
                summary.topBreaches.map((g: any) => {
                  const assignedOfficer =
                    g.assignments && g.assignments.length > 0
                      ? g.assignments[0].officerProfile?.user?.fullName || "Assigned Officer"
                      : "Unassigned Backlog";

                  return (
                    <TableRow
                      key={g.id}
                      onClick={() => navigate(`/officer/grievances/${g.id}`)}
                      className="cursor-pointer hover:bg-rose-50/30 transition"
                    >
                      <TableCell className="font-mono font-bold text-rose-700 text-xs">
                        {g.trackingNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 max-w-xs truncate text-xs">
                        {g.title}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {g.department?.name || "General"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {g.category?.name || "Civic Complaint"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={g.priority} type="priority" size="sm" />
                      </TableCell>
                      <TableCell className="text-xs font-mono text-rose-700 font-bold">
                        {g.slaDeadline ? new Date(g.slaDeadline).toLocaleDateString() : "Expired"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">
                        {assignedOfficer}
                      </TableCell>
                      <TableCell>
                        <Link to={`/officer/grievances/${g.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 px-2.5 font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
                            rightIcon={<ExternalLink className="w-3 h-3" />}
                          >
                            Intervene
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeniorOfficerDashboard;
