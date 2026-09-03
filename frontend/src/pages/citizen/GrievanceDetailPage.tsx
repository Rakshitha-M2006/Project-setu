import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { GrievanceItem } from "../../api/citizenApi";
import axiosClient from "../../api/axiosClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Alert } from "../../components/ui/Alert";
import {
  ArrowLeft,
  Copy,
  Clock,
  MapPin,
  Paperclip,
  RefreshCw,
  ExternalLink,
  Shield,
  Check,
  Flame,
} from "lucide-react";

interface SlaData {
  totalHours: number;
  elapsedHours: number;
  remainingHours: number;
  progressPercentage: number;
  isBreached: boolean;
  isWarning: boolean;
  slaState: "ON_TRACK" | "WARNING" | "BREACHED" | "RESOLVED_ON_TIME" | "RESOLVED_OVERDUE";
  slaDeadline: string | null;
  currentEscalationLevel: string | null;
  citizenFriendlyStatus: string;
}

export const GrievanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [grievance, setGrievance] = useState<GrievanceItem | null>(null);
  const [slaData, setSlaData] = useState<SlaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGrievanceData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Grievance Details
      const response = await citizenApi.getGrievanceById(id);
      if (response.success && response.data) {
        setGrievance(response.data);
      } else {
        setErrorMsg("Could not find this grievance in official records.");
      }

      // 2. Fetch Live SLA Status
      try {
        const slaRes = await axiosClient.get<{ success: boolean; data: SlaData }>(
          `/sla/grievances/${id}/status`
        );
        if (slaRes.data?.success && slaRes.data?.data) {
          setSlaData(slaRes.data.data);
        }
      } catch {
        // SLA calculation optional fallback
      }
    } catch (err: any) {
      const message =
        err.response?.status === 403
          ? "You are not authorized to view this grievance."
          : err.response?.data?.message || "Failed to load grievance details.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGrievanceData();
  }, [fetchGrievanceData]);

  const handleCopyTrackingNumber = () => {
    if (grievance?.trackingNumber) {
      navigator.clipboard.writeText(grievance.trackingNumber);
      toast.success("Tracking number copied to clipboard!", "Copied");
    }
  };

  // Determine Active Step (1 to 8)
  const getStepIndex = (status: string): number => {
    switch (status) {
      case "SUBMITTED":
        return 1;
      case "AI_CLASSIFIED":
      case "AI_TRIAGED":
      case "AI_REVIEW_REQUIRED":
      case "NEEDS_REVIEW":
        return 2;
      case "DEPARTMENT_ASSIGNED":
      case "OFFICER_PENDING":
        return 3;
      case "ASSIGNED":
        return 4;
      case "UNDER_INSPECTION":
      case "UNDER_REVIEW":
      case "DOCUMENT_VERIFICATION":
        return 5;
      case "IN_PROGRESS":
      case "ESCALATED":
      case "REOPENED":
        return 6;
      case "RESOLVED":
        return 7;
      case "COMPLETED":
        return 8;
      default:
        return 1;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Retrieving grievance records and SLA tracking...</p>
      </div>
    );
  }

  if (errorMsg || !grievance) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <Alert variant="danger">{errorMsg || "Grievance not found."}</Alert>
        <div className="text-center">
          <Link to="/citizen/grievances">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Grievances
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(grievance.status);

  // Visual 8-Step Lifecycle Steps
  const timelineSteps = [
    { title: "Submitted", desc: "Lodged in registry" },
    { title: "AI Classified", desc: "NLP triage & SLA set" },
    { title: "Dept Assigned", desc: "Routed to department" },
    { title: "Officer Assigned", desc: "Field officer claimed" },
    { title: "Under Review", desc: "On-site inspection" },
    { title: "In Progress", desc: "Rectification underway" },
    { title: "Resolved", desc: "Action verified" },
    { title: "Closed", desc: "Case finalized" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Navigation & Copy Reference */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/citizen/grievances">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Public Reference:</span>
              <h1 className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight font-mono">
                {grievance.trackingNumber}
              </h1>
              <button
                onClick={handleCopyTrackingNumber}
                title="Copy Reference"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lodged on {new Date(grievance.createdAt).toLocaleDateString()} at{" "}
              {new Date(grievance.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGrievanceData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {/* 2. Visual 8-Step Lifecycle Stepper */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-sm">Redressal Progress Stepper</CardTitle>
            </div>
            <span className="text-[11px] text-slate-500">
              Stage <strong>{currentStep}</strong> of <strong>8</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="relative">
            {/* Connecting Bar */}
            <div className="hidden md:block absolute top-4 left-6 right-6 h-1 bg-slate-100 rounded-full">
              <div
                className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                style={{ width: `${((currentStep - 1) / (timelineSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Stepper Dots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-2 relative">
              {timelineSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ring-4 ${
                        isCompleted
                          ? "bg-blue-600 text-white ring-blue-100"
                          : isCurrent
                          ? "bg-amber-500 text-white ring-amber-100 animate-pulse"
                          : "bg-slate-100 text-slate-400 ring-transparent"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
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

      {/* 3. SLA Progress & Status Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={grievance.status} size="md" />
            <StatusBadge status={grievance.priority} type="priority" size="md" />
            {grievance.isUrgent && (
              <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                Urgent Public Hazard
              </span>
            )}
            {slaData?.currentEscalationLevel && (
              <span className="bg-red-100 text-red-900 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                🚨 Escalated to Supervisor
              </span>
            )}
          </div>

          {grievance.slaDeadline && (
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>
                Target Resolution SLA:{" "}
                <strong className="text-slate-900">
                  {new Date(grievance.slaDeadline).toLocaleDateString()} (
                  {new Date(grievance.slaDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* SLA Progress Bar & Status Text */}
        {slaData && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{slaData.citizenFriendlyStatus}</span>
              <span className="font-mono font-bold text-slate-800">
                {slaData.isBreached && grievance.status !== "RESOLVED"
                  ? `Overdue by ${Math.abs(slaData.remainingHours)} hours`
                  : grievance.status === "RESOLVED"
                  ? "Completed within window"
                  : `${Math.max(0, slaData.remainingHours)}h turnaround remaining`}
              </span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  slaData.slaState === "BREACHED"
                    ? "bg-rose-600"
                    : slaData.slaState === "WARNING"
                    ? "bg-amber-500"
                    : slaData.slaState === "RESOLVED_ON_TIME"
                    ? "bg-emerald-500"
                    : "bg-blue-600"
                }`}
                style={{ width: `${slaData.progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Problem Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Grievance Particulars</CardTitle>
              <CardDescription>Submitted details and administrative assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Title</h4>
                <p className="text-base font-bold text-slate-900 mt-1">{grievance.title}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 mt-1 whitespace-pre-wrap">
                  {grievance.description}
                </p>
              </div>

              {/* Resolution Card if Resolved */}
              {grievance.resolutionSummary && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Verified Resolution Summary
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {grievance.resolutionSummary}
                  </p>
                  {grievance.resolvedAt && (
                    <p className="text-[10px] text-emerald-700 font-mono pt-1">
                      Action finalized on {new Date(grievance.resolvedAt).toLocaleDateString()} at{" "}
                      {new Date(grievance.resolvedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              )}

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Department</span>
                  <p className="font-bold text-xs text-slate-900">
                    {grievance.department?.name || "General Administration"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Problem Category</span>
                  <p className="font-bold text-xs text-slate-900">
                    {grievance.category?.name || "General Public Grievance"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-sm">Incident Location & Landmark</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Landmark</span>
                  <p className="font-semibold text-slate-800">{grievance.addressText || "Not specified"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Postal PIN Code</span>
                  <p className="font-mono font-bold text-slate-800">{grievance.pincode || "110001"}</p>
                </div>
              </div>

              {grievance.location && (grievance.location.latitude || grievance.location.longitude) && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <div className="space-y-0.5">
                    <p className="font-bold">GPS Coordinates Attached:</p>
                    <p className="font-mono text-[11px]">
                      Lat: {grievance.location.latitude}, Lng: {grievance.location.longitude}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${grievance.location.latitude},${grievance.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline text-xs bg-white px-3 py-1.5 rounded-lg border border-blue-200"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments Section */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-700" />
                  <CardTitle className="text-sm">
                    Attached Evidence Exhibits ({grievance.attachments.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {grievance.attachments.map((att) => (
                  <div
                    key={att.id || att.fileName}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate max-w-sm">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.originalName}</span>
                      {att.isResolutionEvidence && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-bold">
                          Resolution Verification Exhibit
                        </span>
                      )}
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-bold hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col): Redressal Action Timeline */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Official Redressal Timeline</CardTitle>
              <CardDescription className="text-xs">
                Chronological record of all updates & transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {grievance.statusHistories && grievance.statusHistories.length > 0 ? (
                <div className="space-y-6 relative pl-3 border-l-2 border-blue-200 ml-2">
                  {grievance.statusHistories.map((h) => (
                    <div key={h.id} className="relative pl-4 space-y-1">
                      {/* Timeline dot */}
                      <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {h.actionTaken.replace(/_/g, " ")}
                        </span>
                        <StatusBadge status={h.newStatus} size="sm" />
                      </div>

                      {h.remarks && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200">
                          {h.remarks}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                        <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(h.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  No historical actions recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailPage;
