import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi, { GrievanceItem } from "../../api/citizenApi";
import useTrackingPolling from "../../hooks/useTrackingPolling";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Input } from "../../components/ui/Input";
import {
  FilePlus,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const CitizenGrievancesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadGrievances = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      try {
        const response = await citizenApi.getMyGrievances();
        if (response.success && response.data) {
          setGrievances(response.data);
        }
      } catch {
        if (!isSilent) {
          toast.error(t("errors.serverError") || "Failed to load grievances.", "Error");
        }
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [t, toast]
  );

  // Auto-refresh grievances list every 5 seconds without full page reload
  const { refreshNow, isRefreshing } = useTrackingPolling(
    (isSilent) => loadGrievances(isSilent),
    { intervalMs: 5000 }
  );

  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      let matchesTab = true;
      if (activeTab === "PENDING") {
        matchesTab =
          g.status === "SUBMITTED" ||
          g.status === "AI_CLASSIFIED" ||
          g.status === "AI_REVIEW_REQUIRED" ||
          g.status === "NEEDS_REVIEW" ||
          g.status === "AI_TRIAGED";
      } else if (activeTab === "IN_PROGRESS") {
        matchesTab =
          g.status === "DEPARTMENT_ASSIGNED" ||
          g.status === "OFFICER_PENDING" ||
          g.status === "ASSIGNED" ||
          g.status === "IN_PROGRESS" ||
          g.status === "UNDER_INSPECTION";
      } else if (activeTab === "RESOLVED") {
        matchesTab = g.status === "RESOLVED";
      } else if (activeTab === "ESCALATED") {
        matchesTab = g.status === "ESCALATED";
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch =
          g.trackingNumber.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          (g.department?.name || "").toLowerCase().includes(q);
      }

      return matchesTab && matchesSearch;
    });
  }, [grievances, activeTab, searchQuery]);

  const getStatusCount = (statusType: string) => {
    if (statusType === "ALL") return grievances.length;
    if (statusType === "PENDING")
      return grievances.filter(
        (g) =>
          g.status === "SUBMITTED" ||
          g.status === "AI_CLASSIFIED" ||
          g.status === "AI_REVIEW_REQUIRED" ||
          g.status === "NEEDS_REVIEW" ||
          g.status === "AI_TRIAGED"
      ).length;
    if (statusType === "IN_PROGRESS")
      return grievances.filter(
        (g) =>
          g.status === "DEPARTMENT_ASSIGNED" ||
          g.status === "OFFICER_PENDING" ||
          g.status === "ASSIGNED" ||
          g.status === "IN_PROGRESS" ||
          g.status === "UNDER_INSPECTION"
      ).length;
    if (statusType === "RESOLVED") return grievances.filter((g) => g.status === "RESOLVED").length;
    if (statusType === "ESCALATED") return grievances.filter((g) => g.status === "ESCALATED").length;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("grievances.myGrievances") || "My Public Grievances"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("grievances.myGrievancesSubtitle") || "Track and monitor the status of all complaints submitted by you"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live • 5s</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshNow()}
            isLoading={isRefreshing && grievances.length === 0}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            {t("common.refresh") || "Refresh"}
          </Button>

          <Link to="/citizen/grievances/new">
            <Button size="sm" leftIcon={<FilePlus className="w-4 h-4" />}>
              {t("navigation.newLodgeIssue") || "Lodge New Issue"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filter Tabs & Search */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: t("common.all") || "All" },
                { id: "PENDING", label: t("dashboard.underReview") || "Under Review" },
                { id: "IN_PROGRESS", label: t("dashboard.actionInProgress") || "Action In Progress" },
                { id: "RESOLVED", label: t("dashboard.resolved") || "Resolved" },
                { id: "ESCALATED", label: t("common.statusEscalated") || "Escalated" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-blue-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeTab === tab.id ? "bg-blue-800 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {getStatusCount(tab.id)}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full md:w-72">
              <Input
                placeholder={t("common.search") + "..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Grievances Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("grievances.trackingNumber") || "Tracking #"}</TableHead>
              <TableHead>{t("grievances.subjectLabel") || "Subject"}</TableHead>
              <TableHead>{t("common.department") || "Department"}</TableHead>
              <TableHead>{t("common.status") || "Status"}</TableHead>
              <TableHead>{t("common.priority") || "Priority"}</TableHead>
              <TableHead>{t("common.date") || "Date"}</TableHead>
              <TableHead className="text-right">{t("common.actions") || "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  {t("common.loading") || "Loading grievances..."}
                </TableCell>
              </TableRow>
            ) : filteredGrievances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="p-8 text-center space-y-3">
                    <p className="font-bold text-slate-700">{t("dashboard.noGrievances") || "No grievances found"}</p>
                    <p className="text-xs text-slate-500">{t("dashboard.noGrievancesDesc") || "You have not lodged any grievances in this filter."}</p>
                    <Button size="sm" onClick={() => navigate("/citizen/grievances/new")}>
                      {t("dashboard.lodgeGrievanceBtn") || "Lodge New Grievance"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredGrievances.map((g) => (
                <TableRow key={g.id} className="hover:bg-slate-50/80 transition">
                  <TableCell className="font-mono font-bold text-blue-700 text-xs">
                    {g.trackingNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 max-w-xs truncate">
                    {g.title}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    {g.department?.name || "AI Routing..."}
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
                    <Link to={`/citizen/grievances/${g.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-700">
                        <span>{t("common.view") || "View"}</span>
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

export default CitizenGrievancesPage;
