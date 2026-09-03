import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import citizenApi, { ServiceItem, ServiceApplicationItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyTableState } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Textarea";
import {
  Briefcase,
  Clock,
  FileCheck2,
  Send,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

export const CitizenApplicationsPage: React.FC = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"MY_APPS" | "SERVICES">("MY_APPS");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [applications, setApplications] = useState<ServiceApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [applicantRemarks, setApplicantRemarks] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes, appsRes] = await Promise.all([
        citizenApi.getServices(),
        citizenApi.getMyApplications(),
      ]);

      if (servicesRes.success && servicesRes.data) {
        setServices(servicesRes.data);
      }
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data);
      }
    } catch (err: any) {
      toast.error("Failed to load government services.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsApplying(true);
    try {
      const response = await citizenApi.applyForService(selectedService.id, {
        applicantRemarks,
        submittedAt: new Date().toISOString(),
      });

      if (response.success && response.data) {
        toast.success(
          `Application ${response.data.applicationNumber} submitted successfully!`,
          "Application Lodged"
        );
        setSelectedService(null);
        setApplicantRemarks("");
        setActiveTab("MY_APPS");
        await loadData();
      }
    } catch (err: any) {
      toast.error("Failed to submit service application.", "Submission Error");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Government Public Services
          </h1>
          <p className="text-xs text-slate-500">
            Apply online for public utility services, permits, and track active verification requests
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

          <Button
            size="sm"
            onClick={() => setActiveTab("SERVICES")}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Apply for Service
          </Button>
        </div>
      </div>

      {/* 2. Mode Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("MY_APPS")}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "MY_APPS"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>My Submitted Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SERVICES")}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === "SERVICES"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Available Government Services ({services.length})</span>
        </button>
      </div>

      {/* 3. Tab Content: My Applications */}
      {activeTab === "MY_APPS" && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Scrutiny Officer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-400">
                      Loading service applications...
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <EmptyTableState
                    title="No service applications found"
                    description="You have not submitted any government service applications yet."
                    colSpan={6}
                  />
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono font-bold text-blue-700 text-xs">
                        {app.applicationNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {app.service?.name || "Government Service"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {app.department?.name || "General Administration"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {app.reviewingOfficer?.fullName || "Awaiting Assignment"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 4. Tab Content: Services Directory */}
      {activeTab === "SERVICES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="text-xs text-slate-400 col-span-3 text-center py-12">
              Loading service catalog...
            </p>
          ) : services.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-3 text-center py-12">
              No services catalog entries available.
            </p>
          ) : (
            services.map((srv) => (
              <Card key={srv.id} className="border-slate-200 hover:border-blue-300 transition shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                    <span>{srv.code}</span>
                    <span className="flex items-center gap-1 text-slate-600 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{srv.estimatedProcessingDays} Days SLA</span>
                    </span>
                  </div>
                  <CardTitle className="text-base text-slate-900">{srv.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Governed by: <strong>{srv.department?.name || "State Department"}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 py-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.description || "Official government citizen service scheme."}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Statutory Fee:</span>
                    <span className="font-bold text-slate-900 flex items-center">
                      ₹ {srv.feeAmount}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedService(srv);
                      setApplicantRemarks("");
                    }}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold"
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedService && (
        <Modal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          title={`Apply for: ${selectedService.name}`}
          description={`Governed by ${selectedService.department?.name || "State Authority"}`}
          size="md"
        >
          <form onSubmit={handleApply} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
              <p className="font-bold">Service Guidelines:</p>
              <p>Turnaround SLA: <strong>{selectedService.estimatedProcessingDays} Working Days</strong></p>
              <p>Statutory Application Fee: <strong>₹ {selectedService.feeAmount}</strong></p>
            </div>

            <Textarea
              label="Applicant Remarks / Specific Request Details"
              rows={4}
              placeholder="State any specific requests, consumer account numbers, or address landmarks..."
              value={applicantRemarks}
              onChange={(e) => setApplicantRemarks(e.target.value)}
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedService(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isApplying} rightIcon={<Send className="w-4 h-4" />}>
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CitizenApplicationsPage;
