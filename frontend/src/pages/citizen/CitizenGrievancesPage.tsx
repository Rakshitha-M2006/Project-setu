import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { GrievanceItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import {
  FilePlus,
  Search,
  RefreshCw,
  Clock,
} from "lucide-react";

export const CitizenGrievancesPage: React.FC = () => {
  const toast = useToast();

  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);

  const loadGrievances = async () => {
    setIsLoading(true);
    try {
      const response = await citizenApi.getMyGrievances();
      if (response.success && response.data) {
        setGrievances(response.data);
      }
    } catch (err: any) {
      toast.error("Failed to load grievances.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      // 1. Status Filter Tab
      let matchesTab = true;
      if (activeTab === "PENDING") {
        matchesTab = g.status === "SUBMITTED" || g.status === "AI_TRIAGED";
      } else if (activeTab === "IN_PROGRESS") {
        matchesTab =
          g.status === "ASSIGNED" ||
          g.status === "IN_PROGRESS" ||
          g.status === "UNDER_INSPECTION";
      } else if (activeTab === "RESOLVED") {
        matchesTab = g.status === "RESOLVED";
      } else if (activeTab === "ESCALATED") {
        matchesTab = g.status === "ESCALATED";
      }

      // 2. Search Query Filter
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
      return grievances.filter((g) => g.status === "SUBMITTED" || g.status === "AI_TRIAGED").length;
    if (statusType === "IN_PROGRESS")
      return grievances.filter(
        (g) =>
          g.status === "ASSIGNED" ||
          g.status === "IN_PROGRESS" ||
          g.status === "UNDER_INSPECTION"
      ).length;
    if (statusType === "RESOLVED")
      return grievances.filter((g) => g.status === "RESOLVED").length;
    if (statusType === "ESCALATED")
      return grievances.filter((g) => g.status === "ESCALATED").length;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Public Grievances
          </h1>
          <p className="text-xs text-slate-500">
            Track and monitor the status of all complaints submitted by you
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadGrievances}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link to="/citizen/grievances/new">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white font-bold" leftIcon={<FilePlus className="w-4 h-4" />}>
              Lodge Grievance
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Toolbar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium">
              {[
                { id: "ALL", label: "All Grievances" },
                { id: "PENDING", label: "Pending Triage" },
                { id: "IN_PROGRESS", label: "In Progress" },
                { id: "RESOLVED", label: "Resolved" },
                { id: "ESCALATED", label: "Escalated" },
              ].map((tab) => {
                const count = getStatusCount(tab.id);
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white text-blue-700 font-bold shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search tracking #, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-1.5 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Grievances List Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Subject Title</TableHead>
                <TableHead>Governing Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lodged On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-400">
                    Loading citizen grievances...
                  </TableCell>
                </TableRow>
              ) : filteredGrievances.length === 0 ? (
                <EmptyTableState
                  title="No grievances found"
                  description={
                    searchQuery
                      ? "No records match your search query."
                      : "You have no complaints under this filter category."
                  }
                  colSpan={7}
                />
              ) : (
                filteredGrievances.map((g) => (
                  <TableRow key={g.id} className="cursor-pointer hover:bg-blue-50/30">
                    <TableCell className="font-mono font-bold text-blue-700 text-xs">
                      {g.trackingNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 max-w-xs truncate">
                      {g.title}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {g.department?.name || "General Administration"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={g.priority} type="priority" size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={g.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGrievance(g)}
                        className="text-xs py-1 px-2.5"
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. Grievance Inspection Modal */}
      {selectedGrievance && (
        <Modal
          isOpen={!!selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
          title={`Grievance Details: ${selectedGrievance.trackingNumber}`}
          description={`Filed on ${new Date(selectedGrievance.createdAt).toLocaleString()}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Status Header Strip */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedGrievance.status} size="md" />
                <StatusBadge status={selectedGrievance.priority} type="priority" size="md" />
              </div>

              {selectedGrievance.slaDeadline && (
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>
                    SLA Deadline: <strong className="text-slate-900">{new Date(selectedGrievance.slaDeadline).toLocaleDateString()}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint Subject</h4>
              <p className="text-base font-bold text-slate-900">{selectedGrievance.title}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedGrievance.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Jurisdiction Authority</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedGrievance.department?.name || "Pending Triage"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase">Incident Location / PIN</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedGrievance.addressText || "Not specified"} ({selectedGrievance.pincode || "N/A"})
                </span>
              </div>
            </div>

            {/* Resolution History / Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Official Redressal Timeline
              </h4>

              {selectedGrievance.statusHistories && selectedGrievance.statusHistories.length > 0 ? (
                <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                  {selectedGrievance.statusHistories.map((h) => (
                    <div key={h.id} className="relative pl-4 space-y-1">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{h.actionTaken}</span>
                        <StatusBadge status={h.newStatus} size="sm" />
                      </div>
                      {h.remarks && <p className="text-xs text-slate-600">{h.remarks}</p>}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No historical transitions recorded yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CitizenGrievancesPage;
