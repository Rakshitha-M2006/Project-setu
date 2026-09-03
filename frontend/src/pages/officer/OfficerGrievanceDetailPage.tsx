import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import officerApi from "../../api/officerApi";
import { GrievanceItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Paperclip,
  Send,
  Upload,
  User,
  Shield,
  ExternalLink,
  MessageSquare,
  Check,
  FileCheck,
} from "lucide-react";

export const OfficerGrievanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState<GrievanceItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Action Modals State
  const [activeModal, setActiveModal] = useState<"status" | "evidence" | "request_info" | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Form State
  const [targetStatus, setTargetStatus] = useState<string>("IN_PROGRESS");
  const [actionRemarks, setActionRemarks] = useState<string>("");
  const [resolutionSummary, setResolutionSummary] = useState<string>("");
  const [infoRequestMessage, setInfoRequestMessage] = useState<string>("");

  // Evidence Upload State
  const [evidenceFileName, setEvidenceFileName] = useState<string>("");
  const [evidenceFileUrl, setEvidenceFileUrl] = useState<string>("");
  const [evidenceRemarks, setEvidenceRemarks] = useState<string>("");

  const fetchGrievance = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await officerApi.getGrievanceById(id);
      if (response.success && response.data) {
        setGrievance(response.data);
        setTargetStatus(response.data.status);
      } else {
        toast.error("Grievance not found or unauthorized.", "Access Denied");
        navigate("/officer/grievances");
      }
    } catch {
      toast.error("Error retrieving official grievance record.", "Error");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchGrievance();
  }, [fetchGrievance]);

  // Handle Accept / Claim
  const handleAccept = async () => {
    if (!grievance) return;
    setIsSubmittingAction(true);
    try {
      const res = await officerApi.acceptGrievance(grievance.id);
      if (res.success) {
        toast.success("Grievance claimed and assigned to your investigation queue.", "Assigned");
        fetchGrievance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to claim grievance.", "Error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance) return;
    if (!actionRemarks.trim()) {
      toast.warning("Please provide official remarks for the status update.", "Remarks Required");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await officerApi.updateStatus(grievance.id, {
        status: targetStatus as any,
        remarks: actionRemarks.trim(),
        resolutionSummary: targetStatus === "RESOLVED" ? resolutionSummary.trim() : undefined,
      });

      if (res.success) {
        toast.success(`Grievance status updated to ${targetStatus.replace(/_/g, " ")}.`, "Status Updated");
        setActiveModal(null);
        setActionRemarks("");
        setResolutionSummary("");
        fetchGrievance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.", "Error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Upload Evidence
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance) return;
    if (!evidenceFileName.trim() || !evidenceFileUrl.trim()) {
      toast.warning("Please provide a valid document name and storage URL.", "Incomplete Form");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await officerApi.uploadEvidence(grievance.id, {
        fileName: `${Date.now()}-${evidenceFileName.replace(/\s+/g, "_")}`,
        originalName: evidenceFileName.trim(),
        fileUrl: evidenceFileUrl.trim(),
        mimeType: "image/jpeg",
        fileSizeBytes: 204800,
        remarks: evidenceRemarks.trim(),
      });

      if (res.success) {
        toast.success("Verification evidence successfully attached.", "Evidence Uploaded");
        setActiveModal(null);
        setEvidenceFileName("");
        setEvidenceFileUrl("");
        setEvidenceRemarks("");
        fetchGrievance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload evidence.", "Error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Request Information from Citizen
  const handleRequestInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance) return;
    if (!infoRequestMessage.trim() || infoRequestMessage.trim().length < 5) {
      toast.warning("Please enter a detailed message for the citizen.", "Message Required");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await officerApi.requestInfo(grievance.id, {
        message: infoRequestMessage.trim(),
      });

      if (res.success) {
        toast.success("Clarification request sent to the citizen with alert notification.", "Request Dispatched");
        setActiveModal(null);
        setInfoRequestMessage("");
        fetchGrievance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to dispatch information request.", "Error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading grievance inspection record...</p>
      </div>
    );
  }

  if (!grievance) return null;

  const isAssignedToCurrentUser = grievance.assignments?.some(
    (a) => a.officerProfile?.user?.email === user?.email && a.isActive
  );

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/officer/grievances">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-blue-700">
                {grievance.trackingNumber}
              </span>
              <StatusBadge status={grievance.status} size="sm" />
              <StatusBadge status={grievance.priority} type="priority" size="sm" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 line-clamp-1 mt-0.5">
              {grievance.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGrievance}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Official Action Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-700" />
          <span className="text-xs font-bold text-slate-800">Investigation Action Center:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Claim Grievance Button */}
          {!isAssignedToCurrentUser && grievance.status !== "RESOLVED" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAccept}
              isLoading={isSubmittingAction}
              className="text-xs font-bold shadow-sm"
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Claim & Assign to Me
            </Button>
          )}

          {/* Update Status Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("status")}
            className="text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
            leftIcon={<FileCheck className="w-3.5 h-3.5" />}
          >
            Update Status / Resolve
          </Button>

          {/* Upload Evidence Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("evidence")}
            className="text-xs font-semibold"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Attach Evidence
          </Button>

          {/* Request Info from Citizen */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("request_info")}
            className="text-xs font-semibold text-amber-800 border-amber-200 hover:bg-amber-50"
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
          >
            Request Citizen Info
          </Button>
        </div>
      </div>

      {/* 3. Main Inspection Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Problem Description, Complainant Info, Location, Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grievance Summary Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Grievance Case File</CardTitle>
              <CardDescription className="text-xs">
                Official grievance particulars lodged by citizen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Detailed Complaint Description
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 mt-1 whitespace-pre-wrap">
                  {grievance.description}
                </p>
              </div>

              {grievance.resolutionSummary && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Official Resolution Summary
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {grievance.resolutionSummary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Governing Department</span>
                  <p className="font-bold text-slate-900">{grievance.department?.name || "General Administration"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Problem Category</span>
                  <p className="font-bold text-slate-900">{grievance.category?.name || "General Complaint"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citizen Complainant Profile */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-sm">Complainant Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Citizen Name</span>
                  <p className="font-bold text-slate-900">{grievance.citizen?.fullName || "Citizen"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                  <p className="font-mono font-semibold text-slate-900">
                    {grievance.citizen?.phone || "Not provided"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                  <p className="font-medium text-slate-700 truncate">{grievance.citizen?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incident Location & Coordinates */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-sm">Incident Geography & Jurisdiction</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Physical Address / Landmark</span>
                  <p className="font-semibold text-slate-800">{grievance.addressText || "Not specified"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">PIN Code</span>
                  <p className="font-mono font-bold text-slate-900">{grievance.pincode || "110001"}</p>
                </div>
              </div>

              {grievance.location && (grievance.location.latitude || grievance.location.longitude) && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <div className="space-y-0.5">
                    <p className="font-bold">GPS Coordinates:</p>
                    <p className="font-mono text-[11px]">
                      {grievance.location.latitude}, {grievance.location.longitude}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${grievance.location.latitude},${grievance.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline text-xs bg-white px-3 py-1.5 rounded-lg border border-blue-200"
                  >
                    <span>View on Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attached Files & Evidence */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-700" />
                  <CardTitle className="text-sm">
                    Evidence & Document Exhibits ({grievance.attachments.length})
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
                          Officer Evidence
                        </span>
                      )}
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

        {/* Right Column (1 Col): Redressal Audit Trail & Timeline */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Redressal Action & Audit Log</CardTitle>
              <CardDescription className="text-xs">
                Immutable chronological ledger of all actions
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

                      {h.actor && (
                        <p className="text-[10px] text-blue-700 font-semibold">
                          By: {h.actor.fullName} ({h.actor.role})
                        </p>
                      )}

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

      {/* 4. MODAL: Update Status & Resolve */}
      {activeModal === "status" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900">Update Grievance Status</h3>
              <p className="text-xs text-slate-500">
                Change state, record officer remarks, and mark complaint resolved
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <Select
                label="Target Status"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                options={[
                  { value: "IN_PROGRESS", label: "In Progress (Field Investigation)" },
                  { value: "UNDER_INSPECTION", label: "Under Inspection (On-site Visit)" },
                  { value: "RESOLVED", label: "Resolved (Action Completed)" },
                  { value: "REJECTED", label: "Rejected (Out of Scope / Invalid)" },
                  { value: "ESCALATED", label: "Escalated (Supervisor Review Required)" },
                ]}
              />

              {targetStatus === "RESOLVED" && (
                <Textarea
                  label="Official Resolution Summary (Citizen Visible)"
                  required
                  rows={3}
                  placeholder="Explain steps taken to fix the issue (e.g. Repaired 4-inch main pipeline, restored full water pressure)..."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                />
              )}

              <Textarea
                label="Officer Remarks / Audit Notes"
                required
                rows={3}
                placeholder="Enter internal inspection notes and observations..."
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
              />

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingAction}
                  className="font-bold"
                >
                  Save Status Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Upload Verification Evidence */}
      {activeModal === "evidence" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900">Attach Resolution Evidence</h3>
              <p className="text-xs text-slate-500">
                Upload work completion photograph or official engineering inspection report
              </p>
            </div>

            <form onSubmit={handleUploadEvidence} className="space-y-4">
              <Input
                label="Document / Exhibit Title"
                required
                placeholder="e.g. Site Repair Completion Photo - Oct 2026"
                value={evidenceFileName}
                onChange={(e) => setEvidenceFileName(e.target.value)}
              />

              <Input
                label="File Storage URL / Link"
                required
                placeholder="https://storage.projectsetu.gov.in/evidence/site_repair.jpg"
                value={evidenceFileUrl}
                onChange={(e) => setEvidenceFileUrl(e.target.value)}
              />

              <Textarea
                label="Officer Verification Notes"
                rows={2}
                placeholder="Provide context regarding the uploaded verification document..."
                value={evidenceRemarks}
                onChange={(e) => setEvidenceRemarks(e.target.value)}
              />

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingAction}
                  className="font-bold"
                >
                  Attach Evidence
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Request Info from Citizen */}
      {activeModal === "request_info" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900">Request Information from Citizen</h3>
              <p className="text-xs text-slate-500">
                Sends a high-priority alert to the complainant requesting additional details or landmark clarification
              </p>
            </div>

            <form onSubmit={handleRequestInfo} className="space-y-4">
              <Textarea
                label="Information Request Message"
                required
                rows={4}
                placeholder="e.g. Please provide the exact house number or electricity pole number near the faulty transformer..."
                value={infoRequestMessage}
                onChange={(e) => setInfoRequestMessage(e.target.value)}
              />

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingAction}
                  className="font-bold bg-amber-700 hover:bg-amber-800 text-white"
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Dispatch Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerGrievanceDetailPage;
