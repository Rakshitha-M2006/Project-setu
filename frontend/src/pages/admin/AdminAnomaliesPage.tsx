import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import anomalyApi, { AnomalyRecordItem, AnomalyStatus } from "../../api/anomalyApi";
import { useToast } from "../../context/ToastContext";
import {
  AlertTriangle,
  Flame,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Activity,
  Play,
  Clock,
  Building,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const AdminAnomaliesPage: React.FC = () => {
  const toast = useToast();
  const [anomalies, setAnomalies] = useState<AnomalyRecordItem[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, openCount: 0, criticalCount: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Status Update Modal State
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecordItem | null>(null);
  const [newStatus, setNewStatus] = useState<AnomalyStatus>("INVESTIGATING");
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadAnomalies = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await anomalyApi.getAnomalies({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        severity: severityFilter !== "ALL" ? severityFilter : undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setAnomalies(res.data.anomalies);
        setMetrics(res.data.metrics);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error("Failed to load anomaly surveillance feed.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, severityFilter, toast]);

  useEffect(() => {
    loadAnomalies(1);
  }, [loadAnomalies]);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await anomalyApi.triggerScan();
      if (res.success && res.data) {
        toast.success(
          `Scanned ${res.data.scannedClusters} clusters: ${res.data.anomaliesDetected} spikes detected (${res.data.newAnomaliesSaved} new).`,
          "Anomaly Scan Complete"
        );
        loadAnomalies(1);
      }
    } catch {
      toast.error("Failed to execute statistical anomaly scan.", "Error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenStatusModal = (anomaly: AnomalyRecordItem) => {
    setSelectedAnomaly(anomaly);
    setNewStatus(anomaly.status);
    setInvestigationNotes(anomaly.investigationNotes || "");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnomaly) return;

    setIsUpdating(true);
    try {
      const res = await anomalyApi.updateStatus(selectedAnomaly.id, newStatus, investigationNotes);
      if (res.success) {
        toast.success(`Anomaly status updated to ${newStatus}.`, "Status Updated");
        setAnomalies((prev) =>
          prev.map((a) => (a.id === selectedAnomaly.id ? { ...a, status: newStatus, investigationNotes } : a))
        );
        setSelectedAnomaly(null);
      }
    } catch {
      toast.error("Failed to update anomaly status.", "Error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            CRITICAL SPIKE
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            HIGH ANOMALY
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            MODERATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            MILD
          </span>
        );
    }
  };

  const getStatusBadge = (status: AnomalyStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> OPEN
          </span>
        );
      case "INVESTIGATING":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> INVESTIGATING
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> RESOLVED
          </span>
        );
      case "FALSE_POSITIVE":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <HelpCircle className="w-3 h-3" /> FALSE POSITIVE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-600" />
            <span>Anomaly Detection & Surge Surveillance</span>
          </h1>
          <p className="text-xs text-slate-500">
            Statistical rolling average, standard deviation (Z-Score), and abnormal surge pattern detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => loadAnomalies(pagination.page)}
            variant="outline"
            size="sm"
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            onClick={handleTriggerScan}
            size="sm"
            isLoading={isScanning}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
            leftIcon={<Play className="w-3.5 h-3.5" />}
          >
            Run Statistical Scan
          </Button>
        </div>
      </div>

      {/* 2. Top-Level Surveillance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-white to-rose-50/30">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">Critical Surges</span>
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-3xl font-black text-rose-700 font-mono">{metrics.criticalCount}</p>
            <p className="text-[10px] text-slate-500">Immediate supervisor review required</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-white to-amber-50/30">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Active Open Anomalies</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-700 font-mono">{metrics.openCount}</p>
            <p className="text-[10px] text-slate-500">Unresolved cluster surges</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Detection Engine</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-sm font-bold text-purple-950 mt-1">Z-Score & Rolling Avg</p>
            <p className="text-[10px] text-slate-500">Statistically explainable algorithm</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filters Toolbar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN Only</option>
              <option value="INVESTIGATING">INVESTIGATING Only</option>
              <option value="RESOLVED">RESOLVED Only</option>
              <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 4. Anomalies Feed Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department & Location</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Surge Statistics</TableHead>
                <TableHead>Detected Explanation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Scanning anomaly clusters..." description="Loading statistical anomaly records..." colSpan={6} />
              ) : anomalies.length === 0 ? (
                <EmptyTableState
                  title="No active anomalies detected"
                  description="All departmental grievance velocity rates are currently within standard statistical baseline."
                  colSpan={6}
                />
              ) : (
                anomalies.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950">
                          <Building className="w-3.5 h-3.5 text-purple-700" />
                          <span>{a.department?.name || "General Jurisdiction"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{a.locationPincode ? `PIN: ${a.locationPincode}` : "Municipal Zone"}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{getSeverityBadge(a.severity)}</TableCell>

                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono">{a.currentCount} Cases</span>
                          <span className="text-[10px] text-slate-400">vs baseline {a.baselineCount}/wk</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="font-bold text-rose-600">+{a.percentageIncrease}%</span>
                          {a.zScore && <span className="text-slate-400">({a.zScore}σ)</span>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-slate-700 max-w-sm leading-relaxed">{a.description}</p>
                      {a.investigationNotes && (
                        <p className="text-[11px] text-purple-800 font-medium pt-1 italic">
                          Notes: "{a.investigationNotes}"
                        </p>
                      )}
                    </TableCell>

                    <TableCell>{getStatusBadge(a.status)}</TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenStatusModal(a)}
                        className="text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 5. Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} anomaly records)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => loadAnomalies(pagination.page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadAnomalies(pagination.page + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. Anomaly Status Investigation Modal */}
      <Modal
        isOpen={Boolean(selectedAnomaly)}
        onClose={() => setSelectedAnomaly(null)}
        title="Anomaly Investigation & Disposition"
        description="Update supervisory tracking status and attach on-site investigation findings."
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs space-y-1">
            <p className="font-bold text-purple-950">
              {selectedAnomaly?.department?.name} • PIN {selectedAnomaly?.locationPincode}
            </p>
            <p className="text-purple-800">
              Current Spike: {selectedAnomaly?.currentCount} complaints (+{selectedAnomaly?.percentageIncrease}% surge)
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Investigation Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AnomalyStatus)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
            >
              <option value="OPEN">OPEN (Under Alert)</option>
              <option value="INVESTIGATING">INVESTIGATING (Field Officer Dispatched)</option>
              <option value="RESOLVED">RESOLVED (Corrective Action Deployed)</option>
              <option value="FALSE_POSITIVE">FALSE_POSITIVE (Data Artifact / Expected Event)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Investigation Notes / Action Taken
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Main water valve rupture detected on 4th cross road. Emergency repair crew mobilized."
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSelectedAnomaly(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isUpdating}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
            >
              Save Disposition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnomaliesPage;
