import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { GrievanceItem } from "../../api/citizenApi";
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
} from "lucide-react";

export const GrievanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [grievance, setGrievance] = useState<GrievanceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGrievance = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await citizenApi.getGrievanceById(id);
      if (response.success && response.data) {
        setGrievance(response.data);
      } else {
        setErrorMsg("Could not find this grievance in official records.");
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
  };

  useEffect(() => {
    fetchGrievance();
  }, [id]);

  const handleCopyTrackingNumber = () => {
    if (grievance?.trackingNumber) {
      navigator.clipboard.writeText(grievance.trackingNumber);
      toast.success("Tracking number copied to clipboard!", "Copied");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Retrieving grievance audit records from MySQL...</p>
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/citizen/grievances">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
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
              Filed on {new Date(grievance.createdAt).toLocaleDateString()} at{" "}
              {new Date(grievance.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGrievance}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {/* 2. Status & SLA Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={grievance.status} size="md" />
          <StatusBadge status={grievance.priority} type="priority" size="md" />
          {grievance.isUrgent && (
            <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-rose-200">
              🚨 Urgent Trigger
            </span>
          )}
        </div>

        {grievance.slaDeadline && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              Mandatory Resolution SLA:{" "}
              <strong className="text-slate-900">
                {new Date(grievance.slaDeadline).toLocaleDateString()} (48h target)
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* 3. Grievance Content & Resolution Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Problem Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Grievance Overview</CardTitle>
              <CardDescription>Official citizen complaint record submitted to administration</CardDescription>
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

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <p className="font-bold text-xs text-slate-900">
                    {grievance.department?.name || "General Administration"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
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
                <CardTitle className="text-sm">Incident Location & Coordinates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Landmark</span>
                  <p className="font-semibold text-slate-800">{grievance.addressText || "Not specified"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">PIN Code</span>
                  <p className="font-mono font-bold text-slate-800">{grievance.pincode || "110001"}</p>
                </div>
              </div>

              {grievance.location && (grievance.location.latitude || grievance.location.longitude) && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <div className="space-y-0.5">
                    <p className="font-bold">GPS Coordinates:</p>
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
                    Attached Evidence & Documents ({grievance.attachments.length})
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
                      <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.originalName}</span>
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 font-bold hover:underline"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col): Resolution Audit Timeline */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Redressal Action Timeline</CardTitle>
              <CardDescription className="text-xs">Immutable chronological audit trail</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {grievance.statusHistories && grievance.statusHistories.length > 0 ? (
                <div className="space-y-6 relative pl-3 border-l-2 border-blue-200 ml-2">
                  {grievance.statusHistories.map((h) => (
                    <div key={h.id} className="relative pl-4 space-y-1">
                      {/* Timeline dot */}
                      <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{h.actionTaken.replace(/_/g, " ")}</span>
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
