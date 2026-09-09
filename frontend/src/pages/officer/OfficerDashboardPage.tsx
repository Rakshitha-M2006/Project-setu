import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import officerApi, { OfficerDashboardStats } from "../../api/officerApi";
import { useDashboardPolling } from "../../hooks/useDashboardPolling";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import {
  Clock,
  CheckCircle2,
  Flame,
  Layers,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { getLocalizedDepartmentName } from "../../utils/localizationUtils";

export const OfficerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [stats, setStats] = useState<OfficerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
    }
    try {
      const response = await officerApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else if (!isSilent) {
        toast.error(t("errors.serverError") || "Failed to load officer dashboard statistics.", "Error");
      }
    } catch {
      if (!isSilent) {
        toast.error(t("errors.networkError") || "Network error while connecting to officer portal.", "Connection Error");
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [t, toast]);

  // Automatic live refresh every 2 seconds without full-page reloads
  const { refreshNow, isRefreshing } = useDashboardPolling(fetchDashboardData, {
    intervalMs: 2000,
    enabled: true,
    pauseOnHidden: true,
  });

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
            ? (t("common.statusActive") || "Duty status set to ACTIVE. You will receive new grievance assignments.")
            : (t("common.statusPending") || "Duty status set to AWAY. New assignments temporarily paused."),
          t("common.success") || "Duty Status Updated"
        );
      }
    } catch {
      toast.error(t("errors.serverError") || "Failed to update availability status.", "Error");
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
              {getLocalizedDepartmentName(officer?.department, t)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t("dashboard.welcomeBack") || "Welcome,"} {user?.fullName || "Field Officer"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {t("officer.dashboardSubtitle") || "Jurisdictional complaint triaging, on-ground inspections, and statutory resolution management"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleToggleAvailability}
            disabled={isUpdatingStatus || !stats}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              officer?.isAvailable
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                officer?.isAvailable ? "bg-emerald-400 animate-ping" : "bg-rose-400"
              }`}
            />
            <span>
              {officer?.isAvailable
                ? (t("common.statusActive") || "Duty: Active")
                : (t("common.statusPending") || "Duty: Paused")}
            </span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live • 2s</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshNow()}
            isLoading={isLoading && !stats}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            {t("common.refresh") || "Refresh"}
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("officer.assignedComplaints") || "Assigned Queue"}
              </p>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {isLoading ? "..." : metrics?.totalAssigned ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("officer.pendingAction") || "Pending Inspection"}
              </p>
              <p className="text-2xl font-black text-amber-600 font-mono">
                {isLoading ? "..." : metrics?.pending ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("officer.resolvedToday") || "Resolved Cases"}
              </p>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                {isLoading ? "..." : metrics?.resolved ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("officer.slaBreached") || "SLA Breached"}
              </p>
              <p className="text-2xl font-black text-rose-600 font-mono">
                {isLoading ? "..." : metrics?.overdue ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Urgent Grievances Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("officer.assignedComplaints") || "Priority Grievances Queue"}</CardTitle>
            <CardDescription>
              {t("officer.dashboardSubtitle") || "Complaints assigned to your jurisdiction requiring immediate action"}
            </CardDescription>
          </div>
          <Link to="/officer/grievances">
            <Button variant="outline" size="sm" className="text-xs">
              <span>{t("dashboard.viewAll") || "View All Complaints"}</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("grievances.trackingNumber") || "Tracking #"}</TableHead>
              <TableHead>{t("grievances.subjectLabel") || "Subject"}</TableHead>
              <TableHead>{t("common.status") || "Status"}</TableHead>
              <TableHead>{t("common.priority") || "Priority"}</TableHead>
              <TableHead>{t("common.date") || "Received"}</TableHead>
              <TableHead className="text-right">{t("common.actions") || "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !stats ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  {t("common.loading") || "Loading complaints..."}
                </TableCell>
              </TableRow>
            ) : !stats?.recentGrievances || stats.recentGrievances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {t("dashboard.noGrievances") || "No pending grievances in queue"}
                </TableCell>
              </TableRow>
            ) : (
              stats.recentGrievances.map((g: any) => (
                <TableRow key={g.id} className="hover:bg-slate-50/80 transition">
                  <TableCell className="font-mono font-bold text-blue-700 text-xs">
                    {g.trackingNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 max-w-xs truncate">
                    {g.title}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={g.status} type="grievance" size="sm" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={g.priority} type="priority" size="sm" />
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/officer/grievances/${g.id}`}>
                      <Button size="sm" className="text-xs bg-slate-900 hover:bg-slate-800 text-white">
                        <span>{t("officer.updateStatusBtn") || "Inspect / Resolve"}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default OfficerDashboardPage;
