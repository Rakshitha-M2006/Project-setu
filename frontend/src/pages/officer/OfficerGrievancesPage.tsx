import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import officerApi, { OfficerGrievanceListResponse } from "../../api/officerApi";
import { GrievanceItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const OfficerGrievancesPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<OfficerGrievanceListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Filters & State from URL or Defaults
  const scope = (searchParams.get("scope") as any) || "department_all";
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>(searchParams.get("priority") || "ALL");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as any) || "desc"
  );
  const [page, setPage] = useState<number>(parseInt(searchParams.get("page") || "1"));

  const loadGrievances = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await officerApi.getOfficerGrievances({
        page,
        limit: 10,
        scope,
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
        sortBy,
        sortOrder,
      });

      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast.error("Failed to fetch grievances queue.", "Error");
      }
    } catch {
      toast.error("Network error retrieving grievances.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  }, [page, scope, statusFilter, priorityFilter, searchQuery, sortBy, sortOrder, toast]);

  useEffect(() => {
    loadGrievances();
  }, [loadGrievances]);

  const handleScopeChange = (newScope: string) => {
    setSearchParams((prev) => {
      prev.set("scope", newScope);
      prev.set("page", "1");
      return prev;
    });
    setPage(1);
  };

  const handleAcceptGrievance = async (e: React.MouseEvent, id: string, trackingNumber: string) => {
    e.stopPropagation();
    setAcceptingId(id);
    try {
      const response = await officerApi.acceptGrievance(id);
      if (response.success) {
        toast.success(`Grievance ${trackingNumber} claimed and assigned to you!`, "Grievance Claimed");
        loadGrievances();
      } else {
        toast.error(response.message || "Failed to claim grievance.", "Error");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept grievance.", "Action Error");
    } finally {
      setAcceptingId(null);
    }
  };

  const items = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Officer Grievance Queue & Backlog
          </h1>
          <p className="text-xs text-slate-500">
            {t("officer.dashboardSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadGrievances}
            isLoading={isLoading}
            className="text-xs font-semibold"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Scope Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold w-fit">
        {[
          { id: "department_all", label: "All Department Grievances" },
          { id: "assigned_to_me", label: "My Assigned Cases" },
          { id: "department_unassigned", label: "Unassigned Backlog Pool" },
        ].map((tab) => {
          const isActive = scope === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleScopeChange(tab.id)}
              className={`px-4 py-2 rounded-xl transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-1">
              <Input
                placeholder="Search tracking #, title, citizen..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-1.5 text-xs"
              />
            </div>

            {/* Status Filter */}
            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "OFFICER_PENDING", label: "Officer Pending" },
                { value: "DEPARTMENT_ASSIGNED", label: "Department Assigned" },
                { value: "ASSIGNED", label: "Assigned" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "UNDER_INSPECTION", label: "Under Inspection" },
                { value: "RESOLVED", label: "Resolved" },
                { value: "REJECTED", label: "Rejected" },
                { value: "ESCALATED", label: "Escalated" },
              ]}
              className="py-1.5 text-xs"
            />

            {/* Priority Filter */}
            <Select
              placeholder="All Priorities"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All Priorities" },
                { value: "CRITICAL", label: "Critical" },
                { value: "HIGH", label: "High" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LOW", label: "Low" },
              ]}
              className="py-1.5 text-xs"
            />

            {/* Sort Dropdown */}
            <Select
              placeholder="Sort By"
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(":");
                setSortBy(sb);
                setSortOrder(so as any);
                setPage(1);
              }}
              options={[
                { value: "createdAt:desc", label: "Newest Lodged First" },
                { value: "createdAt:asc", label: "Oldest Lodged First" },
                { value: "slaDeadline:asc", label: "Urgent SLA Deadline First" },
                { value: "priority:desc", label: "Highest Priority First" },
              ]}
              className="py-1.5 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Grievances Queue Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>{t("common.subject")}</TableHead>
                <TableHead>Citizen / Complainant</TableHead>
                <TableHead>Location / Pincode</TableHead>
                <TableHead>{t("common.priority")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.slaTarget")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-400">
                    {t("officer.loadingQueue")}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <EmptyTableState
                  title="No grievances found"
                  description="No records match your selected filters or search parameters."
                  colSpan={8}
                />
              ) : (
                items.map((g: GrievanceItem) => {
                  const hasActiveAssignment = g.assignments && g.assignments.length > 0;
                  return (
                    <TableRow
                      key={g.id}
                      onClick={() => navigate(`/officer/grievances/${g.id}`)}
                      className="cursor-pointer hover:bg-blue-50/40 transition"
                    >
                      <TableCell className="font-mono font-bold text-blue-700 text-xs">
                        {g.trackingNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 max-w-xs truncate text-xs">
                        <div>
                          <p className="truncate">{g.title}</p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            Category: {g.category?.name || "General"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <div>
                          <p className="font-semibold">{g.citizen?.fullName || "Citizen"}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{g.citizen?.phone || "No phone"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">
                        <div>
                          <p className="truncate">{g.addressText || g.location?.locality || "Ward Center"}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{g.pincode || "110001"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={g.priority} type="priority" size="sm" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={g.status} type="grievance" size="sm" />
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {g.slaDeadline ? (
                          <span
                            className={
                              new Date(g.slaDeadline) < new Date() && g.status !== "RESOLVED"
                                ? "text-rose-700 font-bold"
                                : "text-slate-600"
                            }
                          >
                            {new Date(g.slaDeadline).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">48h target</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!hasActiveAssignment && g.status !== "RESOLVED" ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs py-1 px-2.5 font-bold shadow-sm"
                              isLoading={acceptingId === g.id}
                              onClick={(e) => handleAcceptGrievance(e, g.id, g.trackingNumber)}
                              leftIcon={<Check className="w-3 h-3" />}
                            >
                              Claim
                            </Button>
                          ) : (
                            <Link to={`/officer/grievances/${g.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs py-1 px-2.5 font-semibold"
                                rightIcon={<ExternalLink className="w-3 h-3" />}
                              >
                                Inspect
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> (
                {pagination.totalItems} total records)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerGrievancesPage;
