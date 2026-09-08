import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
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
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  X,
  Compass,
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
  const { t } = useLanguage();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

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
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string } | null>(null);

  // State Management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check prefill state from navigation (e.g. SETU Assistant)
  useEffect(() => {
    if (location.state && (location.state as any).prefill) {
      const p = (location.state as any).prefill;
      if (p.title) setTitle(p.title);
      if (p.description) setDescription(p.description);
      if (p.departmentId) setDepartmentId(p.departmentId);
      if (p.addressText) setAddressText(p.addressText);
      if (p.pincode) setPincode(p.pincode);
    }
  }, [location.state]);

  // Success Confirmation State
  const [submittedGrievance, setSubmittedGrievance] = useState<{
    id: string;
    trackingNumber: string;
    title: string;
    category?: string;
    departmentName?: string;
    priority?: string;
    status?: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDepartments = async () => {
      try {
        const response = await citizenApi.getDepartments();
        if (isMounted && response.success && response.data) {
          setDepartments(response.data);
        }
      } catch {
        if (isMounted) {
          toast.error("Failed to load departments catalog.", "Error");
        }
      }
    };

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  // Available categories for selected department
  const selectedDept = departments.find((d) => d.id === departmentId);
  const categories: GrievanceCategory[] = selectedDept?.categories || [];

  // GPS Location Auto-Detection with High Accuracy & Fallback
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", "GPS Error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        const acc = Math.round(position.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(acc);
        setIsLocating(false);

        toast.success(
          `GPS Coordinates captured (${lat}, ${lng}) with ±${acc}m accuracy.`,
          "Location Tagged"
        );
      },
      (error) => {
        setIsLocating(false);
        let msg = "Could not acquire GPS coordinates. Please enter the physical address manually.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enter address details manually.";
        }
        toast.warning(msg, "Location Notice");
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Upload Photo / Evidence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachmentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 10 * 1024 * 1024) {
        toast.warning(`File '${f.name}' exceeds maximum 10MB limit.`, "File Too Large");
        continue;
      }

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
    toast.success(`${newAttachments.length} evidence file(s) attached.`, "Evidence Added");
    if (e.target) e.target.value = "";
  };

  // Replace existing attachment
  const triggerReplace = (index: number) => {
    setReplacingIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || replacingIndex === null) return;

    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      toast.warning(`File '${f.name}' exceeds 10MB limit.`, "File Too Large");
      return;
    }

    const fileUrl = URL.createObjectURL(f);
    const updatedDoc: AttachmentFile = {
      fileName: `${Date.now()}-${f.name.replace(/\s+/g, "_")}`,
      originalName: f.name,
      fileUrl,
      mimeType: f.type || "application/octet-stream",
      fileSizeBytes: f.size,
    };

    setAttachments((prev) => {
      const copy = [...prev];
      copy[replacingIndex] = updatedDoc;
      return copy;
    });

    toast.success(`Attachment replaced with '${f.name}'.`, "Evidence Updated");
    setReplacingIndex(null);
    if (e.target) e.target.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.info("Attachment removed.", "Removed");
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
          category: response.data.category || created.category?.name || "General Public Grievance",
          departmentName: response.data.department || created.department?.name || "General Administration",
          priority: response.data.priority || created.priority || "MEDIUM",
          status: response.data.status || created.status || "OFFICER_PENDING",
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
              {t("grievances.successTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
              Your complaint has been automatically routed to the responsible department with resolution tracking.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Reference Number Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("grievances.trackingNumber")}
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

            {/* Grievance Summary Information for Citizen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("common.subject")}</span>
                <p className="font-bold text-slate-900 line-clamp-2">{submittedGrievance.title}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("common.category")}</span>
                <p className="font-bold text-slate-900 line-clamp-1">{submittedGrievance.category}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("dashboard.assignedDepartment")}</span>
                <p className="font-bold text-slate-900">{submittedGrievance.departmentName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t("dashboard.assignedPriority")}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  {submittedGrievance.priority}
                </span>
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
                  {t("grievances.trackLive")}
                </Button>
              </Link>

              <Link to="/citizen/grievances" className="w-full sm:w-1/2">
                <Button variant="outline" size="md" className="w-full font-semibold">
                  {t("navigation.grievances")}
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
                {t("grievances.lodgeAnother") || "+ Lodge Another Public Grievance"}
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
              {t("grievances.title")}
            </h1>
            <p className="text-xs text-slate-500">
              {t("grievances.newSubtitle") || "Submit your complaint directly to municipal and state government departments"}
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
          <h4 className="font-bold text-sm text-white">{t("grievances.slaOversight") || "Guaranteed Citizen SLA Oversight"}</h4>
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
          <CardTitle className="text-base">{t("grievances.formTitle") || "Grievance Registration Form"}</CardTitle>
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
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Incident Location & Geo-Tagging
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Coordinates aid quick navigation for field response teams.
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  isLoading={isLocating}
                  className="text-xs bg-white text-blue-700 hover:bg-blue-50 border-blue-200 font-bold shadow-sm"
                  leftIcon={<Navigation className="w-3.5 h-3.5 text-blue-700" />}
                >
                  Acquire GPS Location
                </Button>
              </div>

              {/* Informational Alert on GPS Usage */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>{t("grievances.whyGeotag") || "Why Geo-tag?"}</strong> Attaching GPS coordinates enables departmental field teams to locate the problem site (e.g. leaking pipeline, road pothole, damaged street lamp) without delays. If GPS is unavailable, please provide the physical address below.
                </p>
              </div>

              {/* Coordinates Display Card */}
              {(latitude !== null && longitude !== null) && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        GPS Tagged: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </span>
                      {gpsAccuracy && (
                        <span className="text-[10px] text-emerald-700">
                          Estimated Accuracy: ±{gpsAccuracy} meters
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLatitude(null);
                      setLongitude(null);
                      setGpsAccuracy(null);
                    }}
                    className="text-rose-600 hover:underline font-bold text-xs"
                  >
                    {t("grievances.clearGps")}
                  </button>
                </div>
              )}

              {/* Physical Address Fields (Manual Fallback / Reinforcement) */}
              <div className="space-y-4 pt-1">
                <Input
                  label="Physical Address / Landmark / Street Name"
                  placeholder="e.g. Near Market Gate 2, Sector 4"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Locality / Ward"
                    placeholder="e.g. Ward 12 / Saket"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />

                  <Input
                    label="District / Zone"
                    placeholder="e.g. South Delhi"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />

                  <Input
                    label="Postal PIN Code"
                    placeholder="e.g. 110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Photo Evidence & Supporting Documents Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Photo Evidence & Supporting Documents
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Upload photos of the problem site or related documents (PNG, JPG, PDF up to 10MB)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Hidden regular file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Hidden camera input for mobile */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Hidden replace input */}
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleReplaceFile}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    className="text-xs bg-white text-slate-700 hover:bg-slate-100 border-slate-300 font-semibold"
                    leftIcon={<Camera className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Camera
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-white text-blue-700 hover:bg-blue-50 border-blue-200 font-bold"
                    leftIcon={<Paperclip className="w-3.5 h-3.5 text-blue-700" />}
                  >
                    Upload Files
                  </Button>
                </div>
              </div>

              {/* Uploaded Evidence Gallery */}
              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {attachments.map((att, idx) => {
                    const isImg = att.mimeType.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(att.fileName);

                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between"
                      >
                        {isImg ? (
                          <div className="relative h-32 bg-slate-100 overflow-hidden group">
                            <img
                              src={att.fileUrl}
                              alt={att.originalName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewModalImg({ url: att.fileUrl, title: att.originalName })}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition"
                                title="View Fullscreen"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerReplace(idx)}
                                className="p-1.5 rounded-lg bg-white/90 text-blue-700 hover:bg-white transition"
                                title="Replace Photo"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(idx)}
                                className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-white transition"
                                title="Delete Evidence"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Paperclip className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{att.originalName}</p>
                              <span className="text-[10px] text-slate-400">PDF Document</span>
                            </div>
                          </div>
                        )}

                        <div className="p-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-white">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate text-[11px] max-w-[140px]">
                              {att.originalName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {(att.fileSizeBytes / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => triggerReplace(idx)}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded transition"
                              title="Replace file"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="p-1 text-slate-500 hover:text-rose-600 rounded transition"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition"
                >
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">{t("grievances.clickToAttach") || "Click to attach photo evidence or documentation"}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t("grievances.photoDesc") || "High-resolution photos accelerate departmental verification."}</p>
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
                {t("grievances.submitBtn")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">{previewModalImg.title}</span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img src={previewModalImg.url} alt={previewModalImg.title} className="max-h-[65vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGrievancePage;
