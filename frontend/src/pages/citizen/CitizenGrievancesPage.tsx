import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { GrievanceItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Input } from "../../components/ui/Input";
import {
  FilePlus,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const CitizenGrievancesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
        matchesTab =
          g.status === "SUBMITTED" ||
          g.status === "AI_CLASSIFIED" ||
          g.status === "AI_REVIEW_REQUIRED" ||
          g.status === "NEEDS_REVIEW" ||
          g.status === "AI_TRIAGED";
      } else if (activeTab === "IN_PROGRESS") {
        matchesTab =
          g.status === "DEPARTMENT_ASSIGNED" ||
          g.status === "OFFICER_PENDING" ||
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
      return grievances.filter(
        (g) =>
          g.status === "SUBMITTED" ||
          g.status === "AI_CLASSIFIED" ||
          g.status === "AI_REVIEW_REQUIRED" ||
          g.status === "NEEDS_REVIEW" ||
          g.status === "AI_TRIAGED"
      ).length;
    if (statusType === "IN_PROGRESS")
      return grievances.filter(
        (g) =>
          g.status === "DEPARTMENT_ASSIGNED" ||
          g.status === "OFFICER_PENDING" ||
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
                  <TableRow
                    key={g.id}
                    onClick={() => navigate(`/citizen/grievances/${g.id}`)}
                    className="cursor-pointer hover:bg-blue-50/40 transition"
                  >
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
                      <Link
                        to={`/citizen/grievances/${g.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2.5"
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                        >
                          Track
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenGrievancesPage;
