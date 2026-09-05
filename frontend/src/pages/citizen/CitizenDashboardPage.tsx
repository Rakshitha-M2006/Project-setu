import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi, { CitizenDashboardStats, GrievanceItem, SchemeItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";
import SchemeEligibilityModal from "../../components/schemes/SchemeEligibilityModal";
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
  Layers,
  Sparkles,
  } from "lucide-react";

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { t, language } = useLanguage();

  const [statsData, setStatsData] = useState<CitizenDashboardStats | null>(null);
  const [featuredSchemes, setFeaturedSchemes] = useState<SchemeItem[]>([]);
  const [selectedSchemeForCheck, setSelectedSchemeForCheck] = useState<SchemeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track Grievance Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState("");
  const [searchedGrievance, setSearchedGrievance] = useState<GrievanceItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Grievance Details Modal State
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [statsRes, schemesRes] = await Promise.all([
        citizenApi.getDashboardStats(),
        citizenApi.getSchemes({ limit: 4 }).catch(() => null),
      ]);

      if (statsRes.success && statsRes.data) {
        setStatsData(statsRes.data);
      } else {
        setErrorMsg("Failed to retrieve dashboard metrics.");
      }

      if (schemesRes && schemesRes.success && schemesRes.data) {
        setFeaturedSchemes(schemesRes.data.schemes || []);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Could not connect to backend service.";
      setErrorMsg(message);
      toast.error(message, "Dashboard Loading Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
          toast.warning("No grievance found with this tracking number in your records.", "Search Result");
        }
      }
    } catch {
      toast.error("Failed to search grievance records.", "Error");
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 font-medium">
              {t("dashboard.activeCitizenPortal")}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("common.ekycLinked")}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {t("dashboard.welcomeBack")} {user?.fullName} 🙏
          </h1>

          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl leading-relaxed">
            {t("common.appTagline")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            isLoading={isLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {t("notifications.refresh") || "Refresh"}
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
        <Link to="/citizen/grievances/new" className="block group">
          <Card className="border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition shadow-sm h-full">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                <FilePlus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition flex items-center gap-1">
                  <span>{t("dashboard.lodgeGrievanceBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("grievances.subtitle")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Action 2: Government Welfare Schemes */}
        <Link to="/citizen/schemes" className="block group">
          <Card className="border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400 transition shadow-sm h-full">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition flex items-center gap-1">
                  <span>{t("nav.schemes") || "Government Schemes"}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("schemes.subtitle") || "Explore verified welfare schemes & evaluate eligibility in 60 seconds."}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Action 3: Browse Services */}
        <Link to="/citizen/services" className="block group">
          <Card className="border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-400 transition shadow-sm h-full">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition flex items-center gap-1">
                  <span>{t("dashboard.applyServiceBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("services.subtitle")}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.totalGrievances")}</p>
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
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.pendingGrievances")}</p>
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
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
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
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.resolvedGrievances")}</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">{metrics.resolvedGrievances}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 col-span-2 sm:col-span-1">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("dashboard.activeApplications")}</p>
              <p className="text-2xl font-black text-indigo-600 font-mono">{metrics.activeApplications}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Featured Welfare Schemes Section */}
      {featuredSchemes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t("nav.schemes") || "Government Welfare Schemes"}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Direct statutory benefits, pension schemes, and agriculture subsidies
              </p>
            </div>
            <Link to="/citizen/schemes">
              <Button variant="ghost" size="sm" className="text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {t("dashboard.viewAll")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredSchemes.map((scheme) => (
              <Card key={scheme.id} className="border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between p-4 space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {scheme.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                    {scheme.translations?.[language]?.name || scheme.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {scheme.translations?.[language]?.shortDescription || scheme.shortDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedSchemeForCheck(scheme)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                  >
                    {t("services.checkEligibility")}
                  </button>
                  <Link to={`/citizen/schemes/${scheme.slug}`}>
                    <Button variant="outline" size="sm" className="text-[11px] py-1 px-2">
                      {t("common.view")}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Two Column Layout: Recent Grievances & Live Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Grievances Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">{t("dashboard.recentGrievances")}</CardTitle>
                <CardDescription>Real-time status of complaints lodged under your profile</CardDescription>
              </div>
              <Link to="/citizen/grievances">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {t("dashboard.viewAll")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : !statsData?.recentGrievances || statsData.recentGrievances.length === 0 ? (
                    <EmptyTableState
                      title="No complaints lodged yet"
                      description="Use the 'Lodge Grievance' button above to submit your first issue."
                      colSpan={6}
                    />
                  ) : (
                    statsData.recentGrievances.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono font-bold text-blue-700 text-xs">
                          {g.trackingNumber}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 max-w-xs truncate text-xs">
                          {g.title}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {g.department?.name || "Pending Triage"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={g.priority} type="priority" size="sm" />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={g.status} size="sm" />
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setSelectedGrievance(g)}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {t("common.viewDetails")}
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
        <div className="space-y-4">
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
              {isLoading ? (
                <p className="text-xs text-slate-400 text-center py-6">{t("common.loading")}</p>
              ) : !statsData?.recentNotifications || statsData.recentNotifications.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">No new notifications</p>
                  <p className="text-[11px] text-slate-400">You will receive live SMS/in-app updates when case status changes.</p>
                </div>
              ) : (
                statsData.recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition ${
                      n.isRead ? "bg-white border-slate-200" : "bg-blue-50/60 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                      {new Date(n.createdAt).toLocaleDateString()}
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
        title="Track Citizen Grievance"
        description="Enter your unique SETU tracking number to view real-time resolution timeline"
      >
        <form onSubmit={handleTrackSearch} className="space-y-4">
          <Input
            label="Tracking Number"
            required
            placeholder="e.g. SETU-2026-881902"
            value={searchTrackingNumber}
            onChange={(e) => setSearchTrackingNumber(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="primary" size="md" isLoading={isSearching} className="w-full">
            Search Grievance
          </Button>
        </form>

        {searchedGrievance && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-blue-700">
                {searchedGrievance.trackingNumber}
              </span>
              <StatusBadge status={searchedGrievance.status} size="sm" />
            </div>

            <div>
              <p className="font-bold text-sm text-slate-900">{searchedGrievance.title}</p>
              <p className="text-xs text-slate-500 mt-1">{searchedGrievance.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Details Modal */}
      {selectedGrievance && (
        <Modal
          isOpen={!!selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
          title={`Grievance: ${selectedGrievance.trackingNumber}`}
          description={`Submitted on ${new Date(selectedGrievance.createdAt).toLocaleDateString()}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selectedGrievance.status} />
              <StatusBadge status={selectedGrievance.priority} type="priority" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Complaint Title:</h4>
              <p className="text-sm text-slate-800 font-medium">{selectedGrievance.title}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Detailed Description:</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedGrievance.description}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Eligibility Modal for featured schemes */}
      {selectedSchemeForCheck && (
        <SchemeEligibilityModal
          scheme={selectedSchemeForCheck}
          isOpen={!!selectedSchemeForCheck}
          onClose={() => setSelectedSchemeForCheck(null)}
        />
      )}
    </div>
  );
};

export default CitizenDashboardPage;
