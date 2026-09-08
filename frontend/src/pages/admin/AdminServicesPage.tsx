import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import citizenApi, { ServiceItem } from "../../api/citizenApi";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Briefcase,
  Search,
  RefreshCw,
  Clock,
  Building,
  ExternalLink,
} from "lucide-react";

export const AdminServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await citizenApi.getServices({
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setServices(res.data);
      }
    } catch {
      toast.error("Failed to load government services.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-700" />
            <span>{t("admin.servicesMaster")}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Publish citizen service schemes, statutory processing timelines, and scrutiny document requirements
          </p>
        </div>

        <Button
          onClick={loadServices}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          {t("admin.refreshCatalog")}
        </Button>
      </div>

      {/* 2. Search Toolbar */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by service scheme name, department, or service code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 transition"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Services Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Code & Name</TableHead>
                <TableHead>Governing Department</TableHead>
                <TableHead>Application Fee</TableHead>
                <TableHead>SLA Turnaround</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Public View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EmptyTableState title="Loading services..." description="Querying service catalog..." colSpan={6} />
              ) : services.length === 0 ? (
                <EmptyTableState title="No government services found" description="Adjust search term." colSpan={6} />
              ) : (
                services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-[10px] text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {s.code}
                        </span>
                        <p className="font-bold text-xs text-slate-900 pt-1">{s.name}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-950 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <Building className="w-3.5 h-3.5" />
                        {s.department?.name || "Municipal Department"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-bold text-slate-800">
                        {Number(s.feeAmount) > 0 ? `₹${s.feeAmount}` : "Free"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {s.estimatedProcessingDays} Working Days
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link to={`/citizen/services/${s.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-900" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Inspect Scheme
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

export default AdminServicesPage;
