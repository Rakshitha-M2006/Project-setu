import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import adminApi, { AdminAuditLogItem } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  History,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Code,
  Calendar,
} from "lucide-react";

export const AdminAuditLogsPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [datePreset, setDatePreset] = useState("ALL");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Payload Inspection Modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        search: searchQuery.trim() !== "" ? searchQuery.trim() : undefined,
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        entityType: entityFilter !== "ALL" ? entityFilter : undefined,
        startDate,
        endDate,
        page,
        limit: 20,
      });

      if (res.success && res.data) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error("Failed to load audit trail ledger.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, actionFilter, entityFilter, startDate, endDate, toast]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "TODAY") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      setStartDate(start.toISOString());
      setEndDate(now.toISOString());
    } else if (preset === "LAST_7") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString());
      setEndDate(now.toISOString());
    } else if (preset === "LAST_30") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString());
      setEndDate(now.toISOString());
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

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
            Append-only, tamper-evident forensic records of all user actions, data access, role updates, and state transitions
          </p>
        </div>

        <Button
          onClick={() => loadLogs(pagination.page)}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {t("admin.refreshLedger")}
        </Button>
      </div>

      {/* 2. Comprehensive Search & Filter Toolbar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search action, entity ID, actor email, IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Recorded Actions</option>
              <option value="AUTH_LOGIN">AUTH_LOGIN</option>
              <option value="AUTH_LOGOUT">AUTH_LOGOUT</option>
              <option value="AUTH_REGISTER">AUTH_REGISTER</option>
              <option value="GRIEVANCE_CREATED">GRIEVANCE_CREATED</option>
              <option value="GRIEVANCE_STATUS">GRIEVANCE_STATUS_*</option>
              <option value="ANOMALY_STATUS">ANOMALY_STATUS_*</option>
              <option value="USER_">USER_ACTIVATED / DEACTIVATED</option>
              <option value="DEPARTMENT_">DEPARTMENT_*</option>
              <option value="DOCUMENT_">DOCUMENT_UPLOAD</option>
              <option value="SERVICE_">SERVICE_APPLICATION_*</option>
            </select>

            {/* Entity Type Filter */}
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
              <option value="AnomalyRecord">AnomalyRecord</option>
              <option value="Escalation">Escalation</option>
              <option value="GrievanceAttachment">GrievanceAttachment</option>
            </select>
          </div>

          {/* Date Presets Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span className="font-bold text-slate-700">Time Window:</span>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
                {[
                  { id: "ALL", label: "All Time" },
                  { id: "TODAY", label: "Today" },
                  { id: "LAST_7", label: "Last 7 Days" },
                  { id: "LAST_30", label: "Last 30 Days" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetChange(p.id)}
                    className={`px-2.5 py-1 rounded-md transition text-[11px] ${
                      datePreset === p.id
                        ? "bg-white text-purple-900 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {(searchQuery || actionFilter !== "ALL" || entityFilter !== "ALL" || datePreset !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActionFilter("ALL");
                  setEntityFilter("ALL");
                  setDatePreset("ALL");
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Forensic Ledger Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor / Initiator</TableHead>
                <TableHead>Action Code</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Client Context</TableHead>
                <TableHead className="text-right">Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading audit logs..." description="Querying forensic ledger..." colSpan={6} />
              ) : logs.length === 0 ? (
                <EmptyTableState
                  title="No audit entries matched"
                  description="Try broadening your search or resetting active filters."
                  colSpan={6}
                />
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    {/* Timestamp */}
                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                    </TableCell>

                    {/* Actor */}
                    <TableCell>
                      {log.actor ? (
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">{log.actor.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.actor.email}</p>
                          <div className="pt-0.5">
                            <StatusBadge status={log.actor.role} type="role" size="sm" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          SYSTEM / CRON
                        </span>
                      )}
                    </TableCell>

                    {/* Action Code */}
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-purple-950 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {log.action}
                      </span>
                    </TableCell>

                    {/* Entity */}
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">{log.entityType}</span>
                        {log.entityId && (
                          <p className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{log.entityId}</p>
                        )}
                      </div>
                    </TableCell>

                    {/* Client Context (IP / UA) */}
                    <TableCell>
                      <div className="text-[11px] space-y-0.5 font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{log.ipAddress || "127.0.0.1"}</span>
                        </div>
                        {log.userAgent && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]" title={log.userAgent}>
                            {log.userAgent}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Expand Payload */}
                    <TableCell className="text-right">
                      {log.changes || log.metadata ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLog(log)}
                          className="text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50"
                          leftIcon={<Code className="w-3 h-3" />}
                        >
                          View JSON
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
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
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} audit logs)
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

      {/* 5. Forensic Payload Details Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Forensic Details"
        description="Immutable record inspection with sanitized state changes and context metadata."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-950">{selectedLog?.action}</span>
              <span className="font-mono text-purple-800 text-[10px]">
                {selectedLog?.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : ""}
              </span>
            </div>
            <p className="text-slate-600">
              Target: <span className="font-bold text-slate-900">{selectedLog?.entityType}</span>{" "}
              {selectedLog?.entityId && `(${selectedLog.entityId})`}
            </p>
            <p className="text-slate-500 font-mono text-[11px]">
              IP: {selectedLog?.ipAddress || "127.0.0.1"} • Actor: {selectedLog?.actor?.fullName || "SYSTEM"} (
              {selectedLog?.actor?.email || "internal"})
            </p>
          </div>

          {selectedLog?.changes && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                State Changes / Transition Delta
              </label>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(selectedLog.changes, null, 2)}
              </pre>
            </div>
          )}

          {selectedLog?.metadata && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sanitized Metadata Context
              </label>
              <pre className="p-3 bg-slate-900 text-purple-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAuditLogsPage;
