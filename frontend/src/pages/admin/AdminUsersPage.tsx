import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import adminApi, { AdminUserItem } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Users2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const AdminUsersPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error("Failed to load user accounts.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, toast]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleToggleStatus = async (user: AdminUserItem) => {
    setTogglingId(user.id);
    const newStatus = !user.isActive;
    try {
      const res = await adminApi.toggleUserStatus(user.id, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
        );
        toast.success(
          `User account ${user.fullName} ${newStatus ? "activated" : "deactivated"}.`,
          "Status Updated"
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update user status.", "Error");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-purple-700" />
            <span>User Identity & Access Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Audit registered citizens, departmental officers, and administrators with role-based access control
          </p>
        </div>

        <Button
          onClick={() => loadUsers(pagination.page)}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh List
        </Button>
      </div>

      {/* 2. Filters & Search Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by full name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{t("admin.allRoles")}</option>
              <option value="CITIZEN">Citizen</option>
              <option value="OFFICER">Field Officer</option>
              <option value="SENIOR_OFFICER">Senior Officer</option>
              <option value="ADMIN">Super Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">{t("common.allStatuses")}</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Deactivated Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 3. Users Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department / Location</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading users..." description="Querying user records..." colSpan={6} />
              ) : users.length === 0 ? (
                <EmptyTableState title="No matching users found" description="Adjust search criteria or filter options." colSpan={6} />
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-slate-900">{u.fullName}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                        {u.phone && <p className="text-[10px] text-slate-400 font-mono">{u.phone}</p>}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={u.role} type="role" size="sm" />
                    </TableCell>

                    <TableCell>
                      {u.officerProfile ? (
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800">{u.officerProfile.department?.name}</p>
                          <p className="text-[10px] text-slate-500">{u.officerProfile.designation || "Officer"}</p>
                        </div>
                      ) : u.citizenProfile?.pincode ? (
                        <p className="text-xs font-mono text-slate-600">PIN: {u.citizenProfile.pincode}</p>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Deactivated
                          </>
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      {u.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant={u.isActive ? "outline" : "primary"}
                          isLoading={togglingId === u.id}
                          onClick={() => handleToggleStatus(u)}
                          className={u.isActive ? "text-rose-600 border-rose-200 hover:bg-rose-50 text-xs" : "bg-emerald-700 hover:bg-emerald-800 text-xs"}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total users)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => loadUsers(pagination.page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadUsers(pagination.page + 1)}
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

export default AdminUsersPage;
