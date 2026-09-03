import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import adminApi, { AdminAuditLogItem } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import {
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const AdminAuditLogsPage: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        entityType: entityFilter !== "ALL" ? entityFilter : undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error("Failed to load audit trail.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityFilter, toast]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600" />
            <span>Forensic System Audit Trail & Security Ledger</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tamper-evident, immutable transaction logs of all administrative changes, status transitions, and data access
          </p>
        </div>

        <Button
          onClick={() => loadLogs(pagination.page)}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Ledger
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="GRIEVANCE">Grievance Actions</option>
            <option value="OFFICER">Officer Actions</option>
            <option value="USER">User Status Changes</option>
            <option value="DEPARTMENT">Department Master Edits</option>
            <option value="FILE">Document Uploads</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Entity Types</option>
            <option value="Grievance">Grievance</option>
            <option value="User">User</option>
            <option value="Department">Department</option>
            <option value="ServiceApplication">ServiceApplication</option>
            <option value="GrievanceAttachment">GrievanceAttachment</option>
          </select>
        </CardContent>
      </Card>

      {/* 3. Audit Logs Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor / Initiator</TableHead>
                <TableHead>Action Code</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Metadata / Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading audit logs..." description="Querying security log buffer..." colSpan={5} />
              ) : logs.length === 0 ? (
                <EmptyTableState title="No audit entries in buffer" description="System audit actions will appear here in real-time." colSpan={5} />
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </TableCell>

                    <TableCell>
                      {log.actor ? (
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">{log.actor.fullName}</p>
                          <p className="text-[10px] text-slate-400">{log.actor.email}</p>
                          <div className="pt-0.5">
                            <StatusBadge status={log.actor.role} type="role" size="sm" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">SYSTEM_CRON</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-mono font-bold text-xs text-purple-950 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {log.action}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">{log.entityType}</span>
                        {log.entityId && (
                          <p className="font-mono text-[10px] text-slate-400 truncate max-w-xs">{log.entityId}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {log.metadata ? (
                        <pre className="text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-100 max-w-xs overflow-x-auto text-slate-600">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
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
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} entries)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => loadLogs(pagination.page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadLogs(pagination.page + 1)}
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

export default AdminAuditLogsPage;
