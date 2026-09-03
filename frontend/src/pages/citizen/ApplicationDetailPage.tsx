import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { ServiceApplicationItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Alert } from "../../components/ui/Alert";
import {
  ArrowLeft,
  Copy,
  Clock,
  Building,
  Paperclip,
  Shield,
  Check,
  XCircle,
  RefreshCw,
} from "lucide-react";

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [application, setApplication] = useState<ServiceApplicationItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await citizenApi.getApplicationById(id);
      if (response.success && response.data) {
        setApplication(response.data);
      } else {
        setErrorMsg("Could not find this service application in official records.");
      }
    } catch (err: any) {
      const msg =
        err.response?.status === 403
          ? "You are not authorized to inspect this service application."
          : err.response?.data?.message || "Failed to load application details.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleCopyAppNumber = () => {
    if (application?.applicationNumber) {
      navigator.clipboard.writeText(application.applicationNumber);
      toast.success("Application number copied to clipboard!", "Copied");
    }
  };

  // Map 6-Step Lifecycle Index
  const getStepIndex = (status: string): number => {
    switch (status) {
      case "DRAFT":
        return 1;
      case "SUBMITTED":
        return 2;
      case "DOCUMENT_VERIFICATION":
        return 3;
      case "UNDER_REVIEW":
        return 4;
      case "APPROVED":
      case "REJECTED":
        return 5;
      case "COMPLETED":
        return 6;
      default:
        return 2;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Retrieving service application records...</p>
      </div>
    );
  }

  if (errorMsg || !application) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <Alert variant="danger">{errorMsg || "Application not found."}</Alert>
        <div className="text-center">
          <Link to="/citizen/applications">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Applications
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(application.status);
  const isRejected = application.status === "REJECTED";
  const formData = (application.formData as any) || {};

  const lifecycleSteps = [
    { title: "Draft", desc: "Form initiated" },
    { title: "Submitted", desc: "Lodged in registry" },
    { title: "Doc Verification", desc: "Proofs scrutinized" },
    { title: "Under Review", desc: "Department inspection" },
    { title: isRejected ? "Rejected" : "Approved", desc: isRejected ? "Sanction denied" : "Sanction granted" },
    { title: "Completed", desc: "Certificate delivered" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/citizen/applications">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Application Reference:</span>
              <h1 className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight font-mono">
                {application.applicationNumber}
              </h1>
              <button
                onClick={handleCopyAppNumber}
                title="Copy Reference"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Service: <strong>{application.service?.name}</strong> • Lodged on{" "}
              {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplication}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {/* 2. Visual 6-Step Stepper */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">Scrutiny & Verification Stepper</CardTitle>
            </div>
            <span className="text-[11px] text-slate-500">
              Stage <strong>{currentStep}</strong> of <strong>6</strong>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="relative">
            {/* Connecting Bar */}
            <div className="hidden md:block absolute top-4 left-8 right-8 h-1 bg-slate-100 rounded-full">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isRejected ? "bg-rose-500" : "bg-blue-600"
                }`}
                style={{ width: `${((currentStep - 1) / (lifecycleSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative">
              {lifecycleSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ring-4 ${
                        isRejected && isCurrent
                          ? "bg-rose-600 text-white ring-rose-100"
                          : isCompleted
                          ? "bg-blue-600 text-white ring-blue-100"
                          : isCurrent
                          ? "bg-amber-500 text-white ring-amber-100 animate-pulse"
                          : "bg-slate-100 text-slate-400 ring-transparent"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : isRejected && isCurrent ? <XCircle className="w-4 h-4" /> : stepNum}
                    </div>
                    <p
                      className={`text-[11px] font-bold ${
                        isCurrent ? "text-blue-900" : isCompleted ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <span className="text-[9px] text-slate-400 hidden sm:block">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Status & Officer Remarks Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} type="application" size="md" />
          {application.completedAt && (
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Completed on {new Date(application.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {application.service && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              Standard Turnaround: <strong>{application.service.estimatedProcessingDays} Working Days</strong>
            </span>
          </div>
        )}
      </div>

      {application.officerRemarks && (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1 text-xs text-blue-950">
          <span className="text-[10px] font-bold uppercase text-blue-800 block">Department Scrutiny Remarks:</span>
          <p className="leading-relaxed">{application.officerRemarks}</p>
        </div>
      )}

      {/* 4. Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Service Particulars & Submitted Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Applicant & Service Location Particulars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Applicant Full Name</span>
                  <p className="font-bold text-slate-900">{formData.applicantName || application.citizen?.fullName}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Contact Phone</span>
                  <p className="font-mono font-semibold text-slate-900">{formData.contactPhone || application.citizen?.phone || "N/A"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Registered Address</span>
                  <p className="font-medium text-slate-800">
                    {formData.addressLine || "Plot 42, Sector 5"}, {formData.locality || ""}, {formData.district || "Central Zone"} — PIN: {formData.pincode || "110001"}
                  </p>
                </div>

                {formData.propertyNumber && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Property / Consumer Holding ID</span>
                    <p className="font-mono font-bold text-blue-700">{formData.propertyNumber}</p>
                  </div>
                )}

                {formData.servicePurpose && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Connection Purpose</span>
                    <p className="font-semibold text-slate-800">{formData.servicePurpose}</p>
                  </div>
                )}
              </div>

              {formData.additionalRemarks && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Applicant Remarks</span>
                  <p className="text-slate-700">{formData.additionalRemarks}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Verification Documents & Department Info */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-sm">
                  Attached Scrutiny Documents ({application.documents?.length || 0})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {!application.documents || application.documents.length === 0 ? (
                <p className="text-slate-400 italic text-center py-4">No documents uploaded.</p>
              ) : (
                application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="truncate max-w-[180px]">
                      <p className="font-bold text-slate-900 truncate">{doc.documentType}</p>
                      <p className="text-[10px] text-slate-400 truncate">{doc.originalName}</p>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-bold hover:underline shrink-0"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-sm">Departmental Authority</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Authority</span>
                <p className="font-bold text-slate-900">{application.department?.name}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Scrutiny Officer</span>
                <p className="text-slate-700">
                  {application.reviewingOfficer?.fullName || "Assigned during technical verification"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
