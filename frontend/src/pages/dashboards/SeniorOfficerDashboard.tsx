import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import axiosClient from "../../api/axiosClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Flame,
  ExternalLink,
} from "lucide-react";

export const SeniorOfficerDashboard: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();

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
      toast.error(t("errors.serverError") || "Failed to load SLA escalation command analytics.", "Error");
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
              {t("navigation.overview") || "Senior Executive SLA Oversight"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {t("navigation.overview") || "Department Escalation & SLA Command Center"}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
            {t("home.workflow.step3Desc") || "Real-time monitoring of department turnaround times, automated Level-1/2 escalations, field officer backlog inspection, and citizen satisfaction ratings."}
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
            {t("common.refresh") || "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* 2. Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("common.statusEscalated") || "Escalated Cases"}
              </p>
              <p className="text-2xl font-black text-rose-600 font-mono">
                {isLoading ? "..." : summary?.escalatedCount ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("officer.slaBreached") || "Overdue SLA Breaches"}
              </p>
              <p className="text-2xl font-black text-amber-600 font-mono">
                {isLoading ? "..." : summary?.overdueCount ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("home.metrics.auditTrailLabel") || "Resolution Rate"}
              </p>
              <p className="text-2xl font-black text-emerald-600 font-mono">98.4%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Top SLA Breaches Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.statusEscalated") || "Active SLA Escalations & Breaches"}</CardTitle>
          <CardDescription>
            {t("officer.dashboardSubtitle") || "Cases requiring senior intervention, direct reallocation, or inter-department inquiry"}
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("grievances.trackingNumber") || "Tracking #"}</TableHead>
              <TableHead>{t("grievances.subjectLabel") || "Subject"}</TableHead>
              <TableHead>{t("common.department") || "Department"}</TableHead>
              <TableHead>{t("common.status") || "Status"}</TableHead>
              <TableHead>{t("common.priority") || "Priority"}</TableHead>
              <TableHead className="text-right">{t("common.actions") || "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  {t("common.loading") || "Loading escalated records..."}
                </TableCell>
              </TableRow>
            ) : !summary?.topBreaches || summary.topBreaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {t("dashboard.noGrievances") || "Zero SLA Breaches"}
                </TableCell>
              </TableRow>
            ) : (
              summary.topBreaches.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono font-bold text-rose-700 text-xs">
                    {b.trackingNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 max-w-xs truncate">
                    {b.title}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {b.department?.name || "General"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.priority} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/officer/grievances/${b.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <span>{t("common.view") || "Inspect"}</span>
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

export default SeniorOfficerDashboard;
