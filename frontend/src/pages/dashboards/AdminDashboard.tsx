import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import adminApi, { AdminDashboardStats } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Users2,
  Building,
  Flame,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { useDashboardPolling } from "../../hooks/useDashboardPolling";

export const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
    }
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      if (!isSilent) {
        toast.error(t("errors.serverError") || "Failed to load administration metrics.", "Dashboard Error");
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [toast, t]);

  // Automatic live refresh every 2 seconds without full-page reloads
  const { refreshNow, isRefreshing } = useDashboardPolling(loadDashboardData, {
    intervalMs: 2000,
    enabled: true,
    pauseOnHidden: true,
  });

  return (
    <div className="space-y-8">
      {/* 1. Admin Executive Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-900/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/30 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-400/30 font-bold uppercase tracking-wider">
              {t("admin.dashboardTitle") || "Super Administrator Console"}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            {t("admin.dashboardSubtitle") || "Central Governance & Multi-Department Command"}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl">
            {t("home.workflow.step2Desc") || "Real-time PostgreSQL aggregation analytics, SLA compliance monitoring, officer dispatch queues, and AI triage oversight."}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live • 2s</span>
          </span>
          <Button
            onClick={() => refreshNow()}
            isLoading={isLoading && !stats}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            {t("common.refresh") || "Refresh Metrics"}
          </Button>
          <Link to="/admin/analytics">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md text-xs">
              {t("navigation.analytics") || "Full Analytics"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Platform Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("admin.totalUsers") || "Citizens"}
              </p>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {isLoading && !stats ? "..." : stats?.totalCitizens ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("admin.totalOfficers") || "Field Officers"}
              </p>
              <p className="text-2xl font-black text-indigo-600 font-mono">
                {isLoading && !stats ? "..." : stats?.totalOfficers ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("admin.totalDepartments") || "Departments"}
              </p>
              <p className="text-2xl font-black text-purple-600 font-mono">
                {isLoading && !stats ? "..." : stats?.departments?.length ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("admin.activeAnomalies") || "Critical Grievances"}
              </p>
              <p className="text-2xl font-black text-rose-600 font-mono">
                {isLoading && !stats ? "..." : stats?.criticalGrievances ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
