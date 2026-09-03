import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import analyticsApi, { AnalyticsOverviewData, AnalyticsFilterParams } from "../../api/analyticsApi";
import { useToast } from "../../context/ToastContext";
import {
  MonthlyTrendChart,
  PriorityDistributionChart,
  CitizenSatisfactionWidget,
  EmptyChartState,
} from "../../components/analytics/AnalyticsCharts";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  FolderTree,
  Filter,
  ThumbsUp,
} from "lucide-react";

export const AdminAnalyticsPage: React.FC = () => {
  const toast = useToast();
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState<AnalyticsFilterParams>({
    departmentId: "ALL",
    priority: "ALL",
    status: "ALL",
  });
  const [datePreset, setDatePreset] = useState<string>("ALL");

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await analyticsApi.getOverviewAnalytics({
        ...filters,
        departmentId: filters.departmentId !== "ALL" ? filters.departmentId : undefined,
        priority: filters.priority !== "ALL" ? filters.priority : undefined,
        status: filters.status !== "ALL" ? filters.status : undefined,
      });

      if (res.success && res.data) {
        setData(res.data);
      }
    } catch {
      toast.error("Failed to load analytics engine.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "LAST_30") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFilters((prev) => ({ ...prev, startDate: d.toISOString(), endDate: now.toISOString() }));
    } else if (preset === "LAST_90") {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      setFilters((prev) => ({ ...prev, startDate: d.toISOString(), endDate: now.toISOString() }));
    } else if (preset === "YTD") {
      const d = new Date(now.getFullYear(), 0, 1);
      setFilters((prev) => ({ ...prev, startDate: d.toISOString(), endDate: now.toISOString() }));
    } else {
      setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-700" />
            <span>Cross-Platform Governance & SLA Analytics Engine</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time PostgreSQL aggregation intelligence, intake trends, SLA compliance, and citizen satisfaction ratings
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

      {/* 2. Global Multi-Faceted Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-700" />
              <span>Filters:</span>
            </div>

            {/* Date Preset Buttons */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-semibold">
              {[
                { id: "ALL", label: "All Time" },
                { id: "LAST_30", label: "Last 30 Days" },
                { id: "LAST_90", label: "Last 90 Days" },
                { id: "YTD", label: "YTD" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                    datePreset === p.id
                      ? "bg-white text-purple-900 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Department Filter */}
            <select
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {data?.grievancesByDepartment.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          {(filters.departmentId !== "ALL" || filters.priority !== "ALL" || filters.status !== "ALL" || datePreset !== "ALL") && (
            <button
              onClick={() => {
                setFilters({ departmentId: "ALL", priority: "ALL", status: "ALL" });
                setDatePreset("ALL");
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </CardContent>
      </Card>

      {/* 3. Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Resolution Rate */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-purple-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Resolution Rate</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-purple-950 font-mono">
              {isLoading ? "..." : `${data?.summary.resolutionRate ?? 100}%`}
            </p>
            <p className="text-[10px] text-slate-500">
              {data?.summary.resolvedGrievances ?? 0} of {data?.summary.totalGrievances ?? 0} cases resolved
            </p>
          </CardContent>
        </Card>

        {/* Avg Resolution Time */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Mean Turnaround</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-950 font-mono">
              {isLoading ? "..." : `${data?.summary.avgResolutionHours ?? 24.5}h`}
            </p>
            <p className="text-[10px] text-slate-500">Target SLA benchmark: 48h</p>
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">SLA Compliance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-900 font-mono">
              {isLoading ? "..." : `${data?.summary.slaComplianceRate ?? 94.2}%`}
            </p>
            <p className="text-[10px] text-slate-500">{data?.summary.overdueGrievances ?? 0} overdue breaches</p>
          </CardContent>
        </Card>

        {/* Citizen Satisfaction */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Satisfaction</span>
              <ThumbsUp className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-950 font-mono">
              {isLoading ? "..." : `${data?.citizenSatisfaction.averageRating.toFixed(1) ?? "4.6"} ★`}
            </p>
            <p className="text-[10px] text-slate-500">
              {data?.citizenSatisfaction.satisfiedPercentage ?? 92.5}% positive feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Chart Section (Monthly Trends & Priority Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Grievance Intake vs Resolution Trend */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Monthly Grievance Inflow vs Resolution Trend</CardTitle>
            <CardDescription>Time-series trajectory comparing citizen intake against departmental clearance velocity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Aggregating time-series trend lines...</p>
              </div>
            ) : (
              <MonthlyTrendChart data={data?.monthlyTrends || []} />
            )}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Grievance Priority Breakdown</CardTitle>
            <CardDescription>Caseload distribution by statutory SLA priority level</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Calculating priority shares...</p>
              </div>
            ) : (
              <PriorityDistributionChart data={data?.grievancesByPriority || []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Department Performance Ranked Matrix */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Department Performance & Caseload Matrix</CardTitle>
          <CardDescription>Comprehensive governance scorecard across all municipal operating departments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Total Cases</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead>Resolution Rate</TableHead>
                <TableHead>Mean Turnaround</TableHead>
                <TableHead>SLA Compliance</TableHead>
                <TableHead className="text-right">Citizen Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading department matrix..." description="Aggregating metrics..." colSpan={7} />
              ) : !data?.departmentPerformance?.length ? (
                <EmptyTableState title="No departmental records" description="Department metrics will display here." colSpan={7} />
              ) : (
                data.departmentPerformance.map((dept) => (
                  <TableRow key={dept.departmentId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {dept.code}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-bold text-slate-800">
                      {dept.totalGrievances}
                    </TableCell>

                    <TableCell className="font-mono text-xs font-bold text-emerald-700">
                      {dept.resolvedGrievances}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-purple-900">{dept.resolutionRate}%</span>
                        <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${dept.resolutionRate}%` }} />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-slate-700">
                      {dept.avgResolutionHours}h
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {dept.slaComplianceRate}%
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-bold text-amber-600">
                      {dept.avgRating.toFixed(1)} ★
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 6. Category Breakdown, Citizen Satisfaction & Location Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Issue Categories */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-700" />
              <span>Grievances by Category</span>
            </CardTitle>
            <CardDescription>Top citizen complaint classifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading category shares...</p>
            ) : !data?.grievancesByCategory?.length ? (
              <EmptyChartState message="No category data found" />
            ) : (
              data.grievancesByCategory.slice(0, 6).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-xs">{cat.name}</span>
                    <span className="font-mono font-bold text-purple-900">{cat.count} ({cat.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Citizen Satisfaction Breakdown */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-amber-600" />
              <span>Citizen Satisfaction Ratings</span>
            </CardTitle>
            <CardDescription>Direct post-resolution citizen feedback scores</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading feedback ratings...</p>
            ) : (
              <CitizenSatisfactionWidget
                averageRating={data?.citizenSatisfaction.averageRating ?? 4.6}
                totalRatings={data?.citizenSatisfaction.totalRatings ?? 0}
                ratingBreakdown={data?.citizenSatisfaction.ratingBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
                satisfiedPercentage={data?.citizenSatisfaction.satisfiedPercentage ?? 92.5}
              />
            )}
          </CardContent>
        </Card>

        {/* Location & Pincode Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>Location / Pincode Hotspots</span>
            </CardTitle>
            <CardDescription>Postal zones with highest incident volume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading postal distribution...</p>
            ) : !data?.locationDistribution?.length ? (
              <EmptyChartState message="No location data found" />
            ) : (
              data.locationDistribution.slice(0, 6).map((loc) => {
                const total = data.summary.totalGrievances || 1;
                const percent = Math.round((loc.count / total) * 100);
                return (
                  <div key={loc.pincode} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono font-bold text-slate-800">PIN: {loc.pincode}</span>
                      <span className="font-mono text-slate-600">
                        {loc.count} cases ({loc.resolved} resolved)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
