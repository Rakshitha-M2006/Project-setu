import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import adminApi from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Building,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const AdminGrievancesPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [grievances, setGrievances] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState(searchParams.get("departmentId") || "ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadGrievances = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getGrievances({
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        departmentId: deptFilter !== "ALL" ? deptFilter : undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setGrievances(res.data.grievances);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error("Failed to load grievances registry.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, priorityFilter, deptFilter, toast]);

  useEffect(() => {
    loadGrievances(1);
  }, [loadGrievances]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-700" />
            <span>Master Grievance Registry & Dispatch Queue</span>
          </h1>
          <p className="text-xs text-slate-500">
            Cross-departmental citizen complaints, NLP AI categorization, assigned investigating officers, and SLA compliance
          </p>
        </div>

        <Button
          onClick={() => loadGrievances(pagination.page)}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Cases
        </Button>
      </div>

      {/* 2. Search & Filter Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by tracking number, title, citizen name, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{t("common.allStatuses")}</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="AI_CLASSIFIED">AI CLASSIFIED</option>
              <option value="DEPARTMENT_ASSIGNED">DEPT ASSIGNED</option>
              <option value="OFFICER_ASSIGNED">OFFICER ASSIGNED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL (24h)</option>
              <option value="HIGH">HIGH (48h)</option>
              <option value="MEDIUM">MEDIUM (72h)</option>
              <option value="LOW">LOW (7d)</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="ALL">Filter by Department</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 3. Grievances Master Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking Reference</TableHead>
                <TableHead>Citizen / Complainant</TableHead>
                <TableHead>Department & Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Officer</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading grievance database..." description="Querying relational records..." colSpan={7} />
              ) : grievances.length === 0 ? (
                <EmptyTableState title="No complaints found" description="Adjust your search filters." colSpan={7} />
              ) : (
                grievances.map((g) => {
                  const assignedOfficer = g.assignments?.[0]?.officerProfile?.user?.fullName;
                  return (
                    <TableRow key={g.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-xs text-purple-950 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {g.trackingNumber}
                          </span>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-xs pt-1">{g.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(g.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">{g.citizen?.fullName}</p>
                          <p className="text-[11px] text-slate-500">{g.citizen?.email}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs">
                          <p className="font-semibold text-purple-900">{g.department?.name || "Unassigned"}</p>
                          <p className="text-[11px] text-slate-500">{g.category?.name || "General"}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={g.priority} type="priority" size="sm" />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={g.status} type="grievance" size="sm" />
                      </TableCell>

                      <TableCell>
                        {assignedOfficer ? (
                          <span className="text-xs font-bold text-slate-800">{assignedOfficer}</span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link to={`/citizen/grievances/${g.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-purple-700 hover:text-purple-900" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                            View Case
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total cases)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => loadGrievances(pagination.page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadGrievances(pagination.page + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGrievancesPage;
