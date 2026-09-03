import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { ServiceApplicationItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  PlusCircle,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";

export const CitizenApplicationsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ServiceApplicationItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await citizenApi.getMyApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      } else {
        toast.error("Failed to load service applications.", "Error");
      }
    } catch {
      toast.error("Network error retrieving service applications.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      let matchesTab = true;
      if (activeTab !== "ALL") {
        matchesTab = app.status === activeTab;
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch =
          app.applicationNumber.toLowerCase().includes(q) ||
          (app.service?.name || "").toLowerCase().includes(q) ||
          (app.department?.name || "").toLowerCase().includes(q);
      }

      return matchesTab && matchesSearch;
    });
  }, [applications, activeTab, searchQuery]);

  const getStatusCount = (status: string) => {
    if (status === "ALL") return applications.length;
    return applications.filter((a) => a.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Government Service Applications
          </h1>
          <p className="text-xs text-slate-500">
            Track statutory verification progress and download official permits / sanction certificates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link to="/citizen/services">
            <Button
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Browse Services Catalog
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
                { id: "ALL", label: "All Applications" },
                { id: "SUBMITTED", label: "Submitted" },
                { id: "DOCUMENT_VERIFICATION", label: "Verification" },
                { id: "UNDER_REVIEW", label: "Under Review" },
                { id: "APPROVED", label: "Approved" },
                { id: "COMPLETED", label: "Completed" },
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
                placeholder="Search application #, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-1.5 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Applications Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application #</TableHead>
                <TableHead>Government Service</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Documents Attached</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-400">
                    Loading your service applications...
                  </TableCell>
                </TableRow>
              ) : filteredApps.length === 0 ? (
                <EmptyTableState
                  title="No service applications found"
                  description={
                    searchQuery
                      ? "No records match your search criteria."
                      : "You have not submitted any service applications under this filter."
                  }
                  colSpan={7}
                />
              ) : (
                filteredApps.map((app) => (
                  <TableRow
                    key={app.id}
                    onClick={() => navigate(`/citizen/applications/${app.id}`)}
                    className="cursor-pointer hover:bg-blue-50/40 transition"
                  >
                    <TableCell className="font-mono font-bold text-blue-700 text-xs">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 max-w-xs truncate text-xs">
                      {app.service?.name || "Civic Service Scheme"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {app.department?.name || "State Authority"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} type="application" size="sm" />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {app.documents?.length || 0} File(s)
                    </TableCell>
                    <TableCell>
                      <Link to={`/citizen/applications/${app.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2.5 font-bold"
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                        >
                          Track Status
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

export default CitizenApplicationsPage;
