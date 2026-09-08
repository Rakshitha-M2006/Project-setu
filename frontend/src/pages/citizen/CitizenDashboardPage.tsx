import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi, { CitizenDashboardStats, GrievanceItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";
import {
  FilePlus,
  Search,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useDashboardPolling } from "../../hooks/useDashboardPolling";

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [statsData, setStatsData] = useState<CitizenDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track Grievance Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState("");
  const [searchedGrievance, setSearchedGrievance] = useState<GrievanceItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Grievance Details Modal State
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
      setErrorMsg(null);
    }
    try {
      const response = await citizenApi.getDashboardStats();
      if (response.success && response.data) {
        setStatsData(response.data);
        if (!isSilent) setErrorMsg(null);
      } else if (!isSilent) {
        setErrorMsg(t("errors.serverError"));
      }
    } catch (err: any) {
      if (!isSilent) {
        const message = err.response?.data?.message || t("errors.networkError");
        setErrorMsg(message);
        toast.error(message, t("common.error"));
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

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTrackingNumber.trim()) return;

    setIsSearching(true);
    try {
      const response = await citizenApi.getMyGrievances();
      if (response.success && response.data) {
        const found = response.data.find(
          (g) => g.trackingNumber.toLowerCase() === searchTrackingNumber.trim().toLowerCase()
        );
        if (found) {
          setSearchedGrievance(found);
        } else {
          toast.warning(t("dashboard.noGrievances"), t("common.search"));
        }
      }
    } catch {
      toast.error(t("errors.serverError"), t("common.error"));
    } finally {
      setIsSearching(false);
    }
  };

  const metrics = statsData?.metrics || {
    totalGrievances: 0,
    pendingGrievances: 0,
    inProgressGrievances: 0,
    resolvedGrievances: 0,
    activeApplications: 0,
    unreadNotificationsCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 min-w-0">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 font-medium">
              {t("dashboard.activeCitizenPortal")}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("common.ekycLinked")}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight break-words">
            {t("dashboard.welcomeBack")} {user?.fullName} 🙏
          </h1>

          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl leading-relaxed break-words">
            {t("dashboard.welcomeSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live • 2s</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshNow()}
            isLoading={isLoading && !statsData}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* 2. Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: Submit Grievance */}
        <Link to="/citizen/grievances/new" className="block group min-w-0">
          <Card className="border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition shadow-sm h-full">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                <FilePlus className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition flex items-center gap-1 break-words">
                  <span>{t("dashboard.lodgeGrievanceBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed break-words">
                  {t("dashboard.lodgeGrievanceDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Action 2: Track Grievance */}
        <div
          onClick={() => {
            setSearchTrackingNumber("");
            setSearchedGrievance(null);
            setTrackModalOpen(true);
          }}
          className="cursor-pointer group min-w-0"
        >
          <Card className="border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 transition shadow-sm h-full">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition flex items-center gap-1 break-words">
                  <span>{t("dashboard.trackGrievanceBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed break-words">
                  {t("dashboard.trackGrievanceDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action 3: Apply Public Service */}
        <Link to="/citizen/services" className="block group min-w-0">
          <Card className="border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-400 transition shadow-sm h-full">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition flex items-center gap-1 break-words">
                  <span>{t("dashboard.applyServiceBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed break-words">
                  {t("dashboard.applyServiceDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. Real Dashboard Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.totalGrievances") || "Total Grievances"}</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{metrics.totalGrievances}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FilePlus className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.underReview") || "Under Review"}</p>
              <p className="text-2xl font-black text-purple-600 font-mono">{metrics.pendingGrievances}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.actionInProgress") || "Action In Progress"}</p>
              <p className="text-2xl font-black text-amber-600 font-mono">{metrics.inProgressGrievances}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.resolved") || "Resolved"}</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">{metrics.resolvedGrievances}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 col-span-1 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.activeApplications") || "Active Applications"}</p>
              <p className="text-2xl font-black text-indigo-600 font-mono">{metrics.activeApplications}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Two Column Layout: Recent Grievances & Live Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        {/* Recent Grievances Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base">{t("dashboard.recentGrievances")}</CardTitle>
                <CardDescription className="truncate">{t("dashboard.recentGrievancesDesc")}</CardDescription>
              </div>
              <Link to="/citizen/grievances" className="shrink-0 self-start sm:self-auto">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {t("dashboard.viewAll")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.trackingNumber")}</TableHead>
                    <TableHead>{t("common.subject")}</TableHead>
                    <TableHead>{t("common.department")}</TableHead>
                    <TableHead>{t("common.priority")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && !statsData ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : !statsData?.recentGrievances || statsData.recentGrievances.length === 0 ? (
                    <EmptyTableState
                      title={t("dashboard.noGrievances")}
                      description={t("dashboard.noGrievancesDesc")}
                      colSpan={6}
                    />
                  ) : (
                    statsData.recentGrievances.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono font-bold text-blue-700 text-xs shrink-0 whitespace-nowrap">
                          {g.trackingNumber}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 max-w-xs truncate">
                          {g.title}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {g.department?.name || "Pending Triage"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={g.priority} type="priority" size="sm" />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={g.status} type="grievance" size="sm" />
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setSelectedGrievance(g)}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {t("dashboard.details")}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Live Notifications Feed (1 Col) */}
        <div className="space-y-4 min-w-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-base">{t("common.notifications")}</CardTitle>
              </div>
              <Link to="/citizen/notifications">
                <Button variant="ghost" size="sm" className="text-xs">
                  {t("common.all")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isLoading && !statsData ? (
                <p className="text-xs text-slate-400 text-center py-6">{t("common.loading")}</p>
              ) : !statsData?.recentNotifications || statsData.recentNotifications.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">{t("notifications.noNotifications")}</p>
                  <p className="text-[11px] text-slate-400">{t("notifications.noNotificationsDesc")}</p>
                </div>
              ) : (
                statsData.recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition ${
                      n.isRead ? "bg-white border-slate-200" : "bg-blue-50/60 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight break-words">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                      {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Track Grievance Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title={t("dashboard.trackModalTitle")}
        description={t("dashboard.trackModalDesc")}
      >
        <form onSubmit={handleTrackSearch} className="space-y-4">
          <Input
            label={t("dashboard.trackingNumberLabel")}
            required
            placeholder={t("dashboard.trackingNumberPlaceholder")}
            value={searchTrackingNumber}
            onChange={(e) => setSearchTrackingNumber(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="primary" size="md" isLoading={isSearching} className="w-full">
            {t("dashboard.searchBtn")}
          </Button>
        </form>

        {searchedGrievance && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-blue-700">
                {searchedGrievance.trackingNumber}
              </span>
              <StatusBadge status={searchedGrievance.status} type="grievance" size="sm" />
            </div>

            <div>
              <p className="font-bold text-sm text-slate-900">{searchedGrievance.title}</p>
              <p className="text-xs text-slate-500 mt-1">{searchedGrievance.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">{t("common.department")}:</span>
                <span className="font-medium">{searchedGrievance.department?.name || "AI Triaging"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t("common.priority")}:</span>
                <StatusBadge status={searchedGrievance.priority} type="priority" size="sm" />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Details Modal */}
      {selectedGrievance && (
        <Modal
          isOpen={!!selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
          title={`${t("grievances.title")}: ${selectedGrievance.trackingNumber}`}
          description={`Lodged on ${new Date(selectedGrievance.createdAt).toLocaleDateString()}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selectedGrievance.status} type="grievance" />
              <StatusBadge status={selectedGrievance.priority} type="priority" />
              {selectedGrievance.isUrgent && (
                <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
                  🚨 {t("dashboard.urgentTrigger")}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{t("grievances.subjectLabel")}:</h4>
              <p className="text-sm text-slate-800 font-medium">{selectedGrievance.title}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{t("grievances.descLabel")}:</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedGrievance.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">{t("dashboard.assignedDepartment")}</span>
                <span className="font-bold text-slate-800">
                  {selectedGrievance.department?.name || "General Administration"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t("dashboard.locationPincode")}</span>
                <span className="font-bold text-slate-800">
                  {selectedGrievance.addressText || "Not specified"} ({selectedGrievance.pincode || "N/A"})
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CitizenDashboardPage;
