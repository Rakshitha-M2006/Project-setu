import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { Alert } from "../../components/ui/Alert";
import { Department, GrievanceCategory } from "../../types";
import {
  Send,
  MapPin,
  ArrowLeft,
  Navigation,
  Paperclip,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  ShieldCheck,
} from "lucide-react";

interface AttachmentFile {
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export const NewGrievancePage: React.FC = () => {
  const toast = useToast();

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [addressText, setAddressText] = useState("");
  const [pincode, setPincode] = useState("");
  const [locality, setLocality] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // State Management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success Confirmation State
  const [submittedGrievance, setSubmittedGrievance] = useState<{
    id: string;
    trackingNumber: string;
    title: string;
    departmentName?: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await citizenApi.getDepartments();
        if (response.success && response.data) {
          setDepartments(response.data);
        }
      } catch {
        toast.error("Failed to load departments catalog.", "Error");
      }
    };

    fetchDepartments();
  }, [toast]);

  // Available categories for selected department
  const selectedDept = departments.find((d) => d.id === departmentId);
  const categories: GrievanceCategory[] = selectedDept?.categories || [];

  // GPS Location Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", "GPS Error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
        setIsLocating(false);
        toast.success(
          `GPS Coordinates captured: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          "Location Detected"
        );
      },
      () => {
        setIsLocating(false);
        toast.warning(
          "Could not acquire exact GPS coordinates. You may enter the physical address manually.",
          "Location Notice"
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Mock / Client Attachment Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachmentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 10 * 1024 * 1024) {
        toast.warning(`File ${f.name} exceeds maximum 10MB limit.`, "File Too Large");
        continue;
      }

      // Create preview / simulated file URL
      const fileUrl = URL.createObjectURL(f);
      newAttachments.push({
        fileName: `${Date.now()}-${f.name.replace(/\s+/g, "_")}`,
        originalName: f.name,
        fileUrl,
        mimeType: f.type || "application/octet-stream",
        fileSizeBytes: f.size,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`${newAttachments.length} document(s) attached.`, "Attachment Added");
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyTrackingNumber = () => {
    if (submittedGrievance?.trackingNumber) {
      navigator.clipboard.writeText(submittedGrievance.trackingNumber);
      toast.success("Reference Number copied to clipboard!", "Copied");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg("Please provide a grievance title of at least 3 characters.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg("Please provide a detailed description of at least 10 characters.");
      return;
    }

    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await citizenApi.submitGrievance({
        title,
        description,
        departmentId: departmentId || null,
        categoryId: categoryId || null,
        addressText: addressText || null,
        pincode: pincode || null,
        locality: locality || null,
        district: district || null,
        state: state || null,
        latitude: latitude || null,
        longitude: longitude || null,
        additionalDetails: additionalDetails || null,
        attachments: attachments.map((a) => ({
          fileName: a.fileName,
          originalName: a.originalName,
          fileUrl: a.fileUrl,
          mimeType: a.mimeType,
          fileSizeBytes: a.fileSizeBytes,
        })),
      });

      if (response.success && response.data) {
        const created = response.data.grievance;
        setSubmittedGrievance({
          id: created.id,
          trackingNumber: response.data.trackingNumber || created.trackingNumber,
          title: created.title,
          departmentName: created.department?.name || selectedDept?.name || "General Administration",
          createdAt: created.createdAt,
        });
        toast.success(
          `Grievance submitted! Reference: ${response.data.trackingNumber || created.trackingNumber}`,
          "Success"
        );
      } else {
        setErrorMsg(response.message || "Failed to submit grievance. Please try again.");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Error submitting grievance.";
      setErrorMsg(message);
      toast.error(message, "Submission Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUCCESS CONFIRMATION SCREEN
  // --------------------------------------------------------------------------
  if (submittedGrievance) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card className="border-emerald-200 bg-white shadow-xl overflow-hidden">
          <div className="bg-emerald-600 p-6 text-white text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto ring-8 ring-white/10">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Grievance Successfully Registered!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
              Your complaint has been entered into the government redressal registry with immutable audit logs.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Reference Number Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Reference & Tracking Number
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-blue-700 tracking-wider">
                  {submittedGrievance.trackingNumber}
                </span>
                <button
                  onClick={handleCopyTrackingNumber}
                  title="Copy Reference Number"
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 transition shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Please quote this reference number for all future inquiries and official correspondence.
              </p>
            </div>

            {/* Grievance Summary Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Subject</span>
                <p className="font-bold text-slate-900 line-clamp-2">{submittedGrievance.title}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Department</span>
                <p className="font-bold text-slate-900">{submittedGrievance.departmentName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  SUBMITTED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Turnaround SLA</span>
                <p className="font-bold text-emerald-700">48 Working Hours</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-950">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                An instant notification has been added to your Notification Center. You can track real-time
                officer updates and investigation reports directly on the tracking portal.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link to={`/citizen/grievances/${submittedGrievance.id}`} className="w-full sm:w-1/2">
                <Button variant="primary" size="md" className="w-full font-bold shadow-md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                  Track Grievance Live
                </Button>
              </Link>

              <Link to="/citizen/grievances" className="w-full sm:w-1/2">
                <Button variant="outline" size="md" className="w-full font-semibold">
                  View All My Grievances
                </Button>
              </Link>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setSubmittedGrievance(null);
                  setTitle("");
                  setDescription("");
                  setDepartmentId("");
                  setCategoryId("");
                  setAddressText("");
                  setPincode("");
                  setLocality("");
                  setDistrict("");
                  setState("");
                  setLatitude(null);
                  setLongitude(null);
                  setAdditionalDetails("");
                  setAttachments([]);
                }}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline"
              >
                + Lodge Another Public Grievance
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // GRIEVANCE SUBMISSION FORM
  // --------------------------------------------------------------------------
  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const categoryOptions = categories.map((c: GrievanceCategory) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/citizen/grievances">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lodge Public Grievance
            </h1>
            <p className="text-xs text-slate-500">
              Submit your complaint directly to municipal and state government departments
            </p>
          </div>
        </div>
      </div>

      {/* 2. Official Redressal Notice */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-700 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs leading-relaxed">
          <h4 className="font-bold text-sm text-white">Guaranteed Citizen SLA Oversight</h4>
          <p className="text-blue-200">
            Every submission generates a unique human-readable tracking token (e.g.,{" "}
            <code className="bg-blue-950 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">
              SETU-2026-ELC-001245
            </code>
            ) with automated 48-hour resolution tracking and supervisor escalation.
          </p>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* 3. Grievance Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Grievance Registration Form</CardTitle>
          <CardDescription>
            Provide accurate details to assist jurisdictional field officers in prompt investigation & resolution
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Subject / Title of Grievance"
              required
              placeholder="e.g. Broken water pipeline causing street flooding near Market Square"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Summarize the core problem concisely (min 3 characters)"
            />

            {/* Department & Problem Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Governing Department (Optional / Auto-Route)"
                options={departmentOptions}
                placeholder="-- Select Department --"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setCategoryId(""); // Reset category when department changes
                }}
              />

              <Select
                label="Problem Category"
                options={categoryOptions}
                placeholder={departmentId ? "-- Select Problem Category --" : "-- Select Dept First --"}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!departmentId || categories.length === 0}
              />
            </div>

            {/* Description */}
            <Textarea
              label="Detailed Problem Description"
              required
              rows={5}
              maxLength={5000}
              placeholder="Describe what occurred, duration of the issue, severity, and any previous reference numbers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Location & GPS Coordinates Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Incident Location & Geography
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  isLoading={isLocating}
                  className="text-xs bg-white text-blue-700 hover:bg-blue-50 border-blue-200 font-semibold"
                  leftIcon={<Navigation className="w-3.5 h-3.5 text-blue-700" />}
                >
                  Use My Current GPS Location
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Physical Address / Street / Landmark"
                  placeholder="e.g. Near Community Center, Sector 4"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                />

                <Input
                  label="Postal PIN Code"
                  placeholder="e.g. 110001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="District / Zone"
                  placeholder="e.g. South Delhi / Central Zone"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />

                <Input
                  label="Locality / Ward"
                  placeholder="e.g. Ward 12 / Saket"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                />
              </div>

              {/* Coordinates Display */}
              {(latitude || longitude) && (
                <div className="p-3 rounded-lg bg-blue-100/50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-700" />
                    <span>
                      GPS Coordinates Attached: <strong>{latitude}, {longitude}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLatitude(null);
                      setLongitude(null);
                    }}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Clear GPS
                  </button>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Supporting Documents & Photo Evidence
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Max 10MB per file (Images, PDF)</span>
              </div>

              <label className="block border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Click to upload photo evidence or documents</p>
                <p className="text-[11px] text-slate-400">PNG, JPG, JPEG, PDF up to 10MB</p>
              </label>

              {/* Uploaded Files List */}
              {attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{att.originalName}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({(att.fileSizeBytes / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <Textarea
              label="Additional Remarks / Contact Instructions (Optional)"
              rows={3}
              placeholder="Provide any additional landmarks, preferred contact hours, or alternate phone numbers..."
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
            />

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Link to="/citizen/grievances">
                <Button variant="outline" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="font-bold shadow-md px-8"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Register Grievance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewGrievancePage;
