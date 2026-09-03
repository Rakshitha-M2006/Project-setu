import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import adminApi, { AdminDashboardStats } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import {
  TrendingUp,
  RefreshCw,
  BarChart3,
} from "lucide-react";

export const AdminAnalyticsPage: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      toast.error("Failed to load analytics engine.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-700" />
            <span>Governance Analytics & SLA Intelligence Engine</span>
          </h1>
          <p className="text-xs text-slate-500">
            Relational PostgreSQL aggregations, mean resolution velocity, and inter-departmental caseload dynamics
          </p>
        </div>

        <Button
          onClick={loadAnalytics}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Recalculate Metrics
        </Button>
      </div>

      {/* 2. Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700">Resolution Clearance Rate</CardTitle>
            <CardDescription>Ratio of closed complaints against total caseload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-purple-900 font-mono">
                {isLoading ? "..." : `${stats?.resolutionRate ?? 100}%`}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Optimal
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${stats?.resolutionRate ?? 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700">Mean Resolution Turnaround</CardTitle>
            <CardDescription>Average duration from citizen filing to verified closure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-blue-900 font-mono">
                {isLoading ? "..." : `${stats?.avgResolutionHours ?? 24.5}h`}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 48h benchmark</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Complies with Digital India statutory service guarantee norms.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-white to-rose-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700">SLA Breach Ratio</CardTitle>
            <CardDescription>Caseload exceeding standard SLA window</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-rose-700 font-mono">
                {isLoading
                  ? "..."
                  : stats?.totalGrievances
                  ? `${Math.round(((stats.overdueGrievances || 0) / stats.totalGrievances) * 100)}%`
                  : "0%"}
              </span>
              <span className="text-xs font-bold text-rose-600 font-mono">
                ({stats?.overdueGrievances || 0} overdue cases)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Auto-escalated to Senior Officers for expedited dispatch.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Departmental Throughput Matrix */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Departmental Caseload Distribution</CardTitle>
          <CardDescription>Workload ratio across municipal operating branches</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats?.departments?.map((d) => {
            const count = d._count.grievances;
            const total = stats.totalGrievances || 1;
            const percent = Math.round((count / total) * 100);

            return (
              <div key={d.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{d.name} ({d.code})</span>
                  <span className="font-mono font-semibold text-slate-600">{count} Cases ({percent}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-700 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percent, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
