import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import officerApi, { OfficerDashboardStats } from "../../api/officerApi";
import { GrievanceItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<OfficerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await officerApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error("Failed to load officer dashboard statistics.", "Error");
      }
    } catch {
      toast.error("Network error while connecting to officer portal.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!stats) return;
    setIsUpdatingStatus(true);
    try {
      const nextState = !stats.officer.isAvailable;
      const res = await officerApi.updateProfile({ isAvailable: nextState });
      if (res.success) {
        setStats({
          ...stats,
          officer: {
            ...stats.officer,
            isAvailable: nextState,
          },
        });
        toast.success(
          nextState
            ? "Duty status set to ACTIVE. You will receive new grievance assignments."
            : "Duty status set to AWAY. New assignments temporarily paused.",
          "Duty Status Updated"
        );
      }
    } catch {
      toast.error("Failed to update availability status.", "Error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const metrics = stats?.metrics;
  const officer = stats?.officer;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Duty Status */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-400/30">
              {officer?.badgeNumber || "BADGE PENDING"}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              {officer?.department || "Department of Public Grievances"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, Officer {user?.fullName || "Field Officer"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Jurisdictional Redressal Portal • {officer?.designation || "Assigned Officer"} • Zone/Ward:{" "}
            {officer?.jurisdictionWard || "Central Division"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Availability Status Toggle */}
          <button
            onClick={handleToggleAvailability}
            disabled={isUpdatingStatus}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
              officer?.isAvailable
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                officer?.isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
              }`}
            />
            <span>Duty: {officer?.isAvailable ? "ON DUTY (ACCEPTING)" : "OFF DUTY (AWAY)"}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold text-xs py-2.5"
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-white" />}
          >
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Grid (7 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Assigned */}
        <Card className="border-slate-200 shadow-sm hover:border-blue-300 transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">My Assigned</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {isLoading ? "..." : metrics?.totalAssigned ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Total claimed tasks</p>
          </CardContent>
        </Card>

        {/* Pending Triage */}
        <Card className="border-slate-200 shadow-sm hover:border-amber-300 transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-700 font-mono">
              {isLoading ? "..." : metrics?.pending ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Awaiting inspection</p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border-slate-200 shadow-sm hover:border-indigo-300 transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-indigo-700 font-mono">
              {isLoading ? "..." : metrics?.inProgress ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Active investigations</p>
          </CardContent>
        </Card>

        {/* Resolved */}
        <Card className="border-slate-200 shadow-sm hover:border-emerald-300 transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">
              {isLoading ? "..." : metrics?.resolved ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Successfully closed</p>
          </CardContent>
        </Card>

        {/* High / Critical Priority */}
        <Card className="border-slate-200 shadow-sm hover:border-rose-300 transition">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Urgent / High</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-700 font-mono">
              {isLoading ? "..." : metrics?.highPriority ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">High priority alert</p>
          </CardContent>
        </Card>

        {/* Overdue / SLA Breaches */}
        <Card className="border-slate-200 shadow-sm hover:border-red-400 transition bg-red-50/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                SLA Breached
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-red-900 font-mono">
              {isLoading ? "..." : metrics?.overdue ?? 0}
            </p>
            <p className="text-[10px] text-red-600 font-semibold">Overdue resolution</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Quick Action Banners & Department Queue Pool */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Department Unassigned Queue ({metrics?.departmentUnassigned ?? 0} Available)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              New grievances triaged by AI and ready to be claimed by departmental officers
            </p>
          </div>

          <Link to="/officer/grievances?scope=department_unassigned">
            <Button
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Pick Up Tasks
            </Button>
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-blue-900 text-white shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider">Assigned Task List</h4>
            <p className="text-sm font-bold text-white">Manage My Active Queue</p>
          </div>
          <Link to="/officer/grievances?scope=assigned_to_me">
            <Button
              size="sm"
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              View Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* 4. Recent Grievances Feed */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Departmental Grievances</CardTitle>
            <CardDescription className="text-xs">
              Live complaint activity stream requiring officer attention
            </CardDescription>
          </div>

          <Link to="/officer/grievances">
            <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-900 font-bold">
              View All Complaints →
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Subject Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Citizen Contact</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lodged On</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-xs text-slate-400">
                    Loading recent complaints...
                  </TableCell>
                </TableRow>
              ) : !stats?.recentGrievances || stats.recentGrievances.length === 0 ? (
                <EmptyTableState
                  title="No active grievances in queue"
                  description="All departmental grievances are up to date."
                  colSpan={8}
                />
              ) : (
                stats.recentGrievances.map((g: GrievanceItem) => (
                  <TableRow
                    key={g.id}
                    onClick={() => navigate(`/officer/grievances/${g.id}`)}
                    className="cursor-pointer hover:bg-blue-50/40 transition"
                  >
                    <TableCell className="font-mono font-bold text-blue-700 text-xs">
                      {g.trackingNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 max-w-xs truncate text-xs">
                      {g.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {g.category?.name || "General Public Grievance"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      <div>
                        <p className="font-semibold">{g.citizen?.fullName || "Citizen"}</p>
                        <p className="text-[10px] text-slate-400">{g.citizen?.phone || "No phone"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={g.priority} type="priority" size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={g.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link to={`/officer/grievances/${g.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2.5 font-bold"
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                        >
                          Inspect
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
    </div>
  );
};

export default OfficerDashboardPage;
