import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { ServiceItem } from "../../api/citizenApi";
import { Department } from "../../types";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Search,
  Building,
  FileCheck2,
  Clock,
  IndianRupee,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export const ServicesCatalogPage: React.FC = () => {
  const toast = useToast();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCatalogData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch departments
      const deptRes = await citizenApi.getDepartments();
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }

      // 2. Fetch services
      const servRes = await citizenApi.getServices({
        departmentId: selectedDeptId !== "ALL" ? selectedDeptId : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (servRes.success && servRes.data) {
        setServices(servRes.data);
      }
    } catch {
      toast.error("Failed to load government services catalog.", "Catalog Error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeptId, searchQuery, toast]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-0.5 rounded-full border border-blue-400/30 font-bold">
              Citizen Digital Service Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Apply for Government Services Online
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
            Streamlined single-window citizen portal for municipal licenses, water connections, electricity meter
            approvals, and property registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/citizen/applications">
            <Button
              className="bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              My Submitted Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Department Filters & Search Toolbar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search services (e.g. water connection, meter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-1.5 text-xs"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchCatalogData}
              isLoading={isLoading}
              className="text-xs font-semibold self-end sm:self-auto"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            <button
              onClick={() => setSelectedDeptId("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedDeptId === "ALL"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Departments ({services.length})
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDeptId(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDeptId === d.id
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading government services catalog...</p>
        </div>
      ) : services.length === 0 ? (
        <Card className="border-slate-200 p-12 text-center space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No public services match your selected department or search query.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => {
            const requiredDocCount = Array.isArray(s.requiredDocuments) ? s.requiredDocuments.length : 2;
            const fee = Number(s.feeAmount) || 0;

            return (
              <Card
                key={s.id}
                className="border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Department & Code Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {s.department?.name || "General Administration"}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{s.code}</span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{s.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {s.description || "Official government citizen service."}
                    </p>
                  </div>

                  {/* Service Specs: Fee & Timeline */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Application Fee</span>
                      <span className="font-bold text-slate-900 flex items-center">
                        {fee > 0 ? (
                          <>
                            <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                            {fee.toFixed(2)}
                          </>
                        ) : (
                          <span className="text-emerald-700 font-bold">Free of Cost</span>
                        )}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Processing Window</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {s.estimatedProcessingDays} Working Days
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Preview */}
                  {s.eligibilityCriteria && (
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-blue-800 block">Eligibility:</span>
                      <p className="line-clamp-2 text-[11px] leading-relaxed">{s.eligibilityCriteria}</p>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {requiredDocCount} Document{requiredDocCount === 1 ? "" : "s"} required
                  </span>

                  <div className="flex items-center gap-2">
                    <Link to={`/citizen/services/${s.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-semibold">
                        Details
                      </Button>
                    </Link>

                    <Link to={`/citizen/services/${s.id}/apply`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold shadow-sm"
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                      >
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServicesCatalogPage;
