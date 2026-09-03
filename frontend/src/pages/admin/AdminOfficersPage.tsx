import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import adminApi, { AdminOfficerItem } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export const AdminOfficersPage: React.FC = () => {
  const toast = useToast();
  const [officers, setOfficers] = useState<AdminOfficerItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadOfficers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getOfficers({
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setOfficers(res.data);
      }
    } catch {
      toast.error("Failed to load officers roster.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadOfficers();
  }, [loadOfficers]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-700" />
            <span>Field Officer Staffing & Caseload Roster</span>
          </h1>
          <p className="text-xs text-slate-500">
            Monitor active investigation loads, department allocations, and grievance resolution throughput
          </p>
        </div>

        <Button
          onClick={loadOfficers}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Roster
        </Button>
      </div>

      {/* 2. Search Toolbar */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by officer name, badge number, designation, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Officers Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer Details</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Badge & Ward</TableHead>
                <TableHead>Active Cases</TableHead>
                <TableHead>Resolved Cases</TableHead>
                <TableHead>Duty Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading officer records..." description="Querying officer roster..." colSpan={7} />
              ) : officers.length === 0 ? (
                <EmptyTableState title="No matching officers found" description="Adjust search term or add officers." colSpan={7} />
              ) : (
                officers.map((off) => (
                  <TableRow key={off.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-slate-900">{off.user.fullName}</p>
                        <p className="text-[11px] text-slate-500">{off.designation || "Investigating Officer"}</p>
                        <p className="text-[10px] text-slate-400">{off.user.email}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <Building className="w-3.5 h-3.5" />
                        {off.department.name}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-mono">
                        <p className="font-bold text-slate-800">{off.badgeNumber || "BADGE-NA"}</p>
                        <p className="text-[11px] text-slate-500">{off.jurisdictionWard || "All Wards"}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {off.activeGrievanceCount} Active
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {off.resolvedGrievanceCount} Done
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          off.isAvailable
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {off.isAvailable ? "On Duty" : "Off Duty"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link to={`/admin/grievances?search=${encodeURIComponent(off.user.fullName)}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-900" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          View Cases
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

export default AdminOfficersPage;
