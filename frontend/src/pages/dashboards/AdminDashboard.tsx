import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import adminApi, { AdminDashboardStats } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import {
  Users2,
  Building,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  Flame,
  Cpu,
  History,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      toast.error("Failed to load administration metrics.", "Dashboard Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-8">
      {/* 1. Admin Executive Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-900/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/30 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-400/30 font-bold uppercase tracking-wider">
              Super Administrator Console
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            Central Governance & Multi-Department Command
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl">
            Real-time PostgreSQL aggregation analytics, SLA compliance monitoring, officer dispatch queues, and AI triage oversight.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button
            onClick={loadDashboardData}
            isLoading={isLoading}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Metrics
          </Button>
          <Link to="/admin/analytics">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md text-xs">
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top-Level Metric Cards Grid (10 Real Statistics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Citizens */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Citizens</span>
              <Users2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {isLoading ? "..." : stats?.totalCitizens ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Registered applicants</p>
          </CardContent>
        </Card>

        {/* Total Officers */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Field Officers</span>
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {isLoading ? "..." : stats?.totalOfficers ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Across 6 departments</p>
          </CardContent>
        </Card>

        {/* Total Grievances */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grievances</span>
              <Building className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-700 font-mono">
              {isLoading ? "..." : stats?.totalGrievances ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">All-time complaints</p>
          </CardContent>
        </Card>

        {/* Pending Grievances */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600 font-mono">
              {isLoading ? "..." : stats?.pendingGrievances ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Under active action</p>
          </CardContent>
        </Card>

        {/* Resolved Grievances */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600 font-mono">
              {isLoading ? "..." : stats?.resolvedGrievances ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Successfully closed</p>
          </CardContent>
        </Card>

        {/* Overdue Grievances */}
        <Card className="border-slate-200 shadow-sm bg-rose-50/40 border-rose-200 hover:border-rose-400 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">SLA Overdue</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-700 font-mono">
              {isLoading ? "..." : stats?.overdueGrievances ?? 0}
            </p>
            <p className="text-[10px] text-rose-600 font-medium">Breached turnaround</p>
          </CardContent>
        </Card>

        {/* Critical Grievances */}
        <Card className="border-slate-200 shadow-sm bg-amber-50/40 border-amber-200 hover:border-amber-400 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Critical</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-700 font-mono">
              {isLoading ? "..." : stats?.criticalGrievances ?? 0}
            </p>
            <p className="text-[10px] text-amber-700 font-medium">24h SLA response</p>
          </CardContent>
        </Card>

        {/* Total Applications */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applications</span>
              <Briefcase className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-2xl font-black text-blue-800 font-mono">
              {isLoading ? "..." : stats?.totalApplications ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Public service requests</p>
          </CardContent>
        </Card>

        {/* Resolution Rate */}
        <Card className="border-slate-200 shadow-sm bg-emerald-50/30 border-emerald-200 hover:border-emerald-400 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Resolution Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">
              {isLoading ? "..." : `${stats?.resolutionRate ?? 100}%`}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">Clearance benchmark</p>
          </CardContent>
        </Card>

        {/* Avg Resolution Time */}
        <Card className="border-slate-200 shadow-sm hover:border-purple-300 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Turnaround</span>
              <Clock className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {isLoading ? "..." : `${stats?.avgResolutionHours ?? 24.5}h`}
            </p>
            <p className="text-[10px] text-slate-400">Mean time to resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Departmental Throughput Breakdown Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Departmental Performance & Caseload Breakdown</CardTitle>
            <CardDescription>Live grievance distribution and officer staffing across municipal departments</CardDescription>
          </div>
          <Link to="/admin/departments">
            <Button variant="outline" size="sm" className="text-xs">
              Manage Departments
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Active Officers</TableHead>
                <TableHead>Registered Grievances</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading departments..." description="Querying relational aggregates..." colSpan={5} />
              ) : !stats?.departments?.length ? (
                <EmptyTableState title="No departments found" description="No department records available in database." colSpan={5} />
              ) : (
                stats.departments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-bold text-xs text-purple-900">{d.code}</TableCell>
                    <TableCell className="font-bold text-xs text-slate-900">{d.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">{d._count.officers} Officers</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-blue-700">{d._count.grievances} Cases</TableCell>
                    <TableCell>
                      <Link to={`/admin/grievances?departmentId=${d.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-900">
                          Inspect Cases
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. Executive Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/users" className="block">
          <Card className="hover:border-purple-400 hover:shadow-md transition p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">User Management</p>
                <p className="text-[11px] text-slate-500">Activate / deactivate accounts</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/officers" className="block">
          <Card className="hover:border-purple-400 hover:shadow-md transition p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Officer Roster</p>
                <p className="text-[11px] text-slate-500">Caseloads & duty status</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/ai-monitoring" className="block">
          <Card className="hover:border-purple-400 hover:shadow-md transition p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Monitoring</p>
                <p className="text-[11px] text-slate-500">NLP accuracy & triage rate</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/audit-logs" className="block">
          <Card className="hover:border-purple-400 hover:shadow-md transition p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Audit Logs</p>
                <p className="text-[11px] text-slate-500">Forensic security trail</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
