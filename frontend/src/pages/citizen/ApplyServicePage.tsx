import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import citizenApi, {
  ServiceItem,
  ServiceRequirementsSchema,
  ServiceFieldRequirement,
} from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Alert } from "../../components/ui/Alert";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Trash2,
  Send,
  Save,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileText,
  User,
  Phone,
  MapPin,
  Briefcase,
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface UploadedDoc {
  documentType: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

const STEPS = [
  { id: 1, name: "Personal Details", icon: User },
  { id: 2, name: "Contact Info", icon: Phone },
  { id: 3, name: "Address", icon: MapPin },
  { id: 4, name: "Service Details", icon: Briefcase },
  { id: 5, name: "Documents", icon: FileText },
  { id: 6, name: "Checklist", icon: CheckSquare },
  { id: 7, name: "Declaration", icon: ShieldCheck },
];

export const ApplyServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [schema, setSchema] = useState<ServiceRequirementsSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State: Step 1 - Personal
  const [applicantName, setApplicantName] = useState<string>(user?.fullName || "");
  const [fatherOrSpouseName, setFatherOrSpouseName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<string>("MALE");

  // Form State: Step 2 - Contact
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [altPhone, setAltPhone] = useState<string>("");

  // Form State: Step 3 - Address
  const [addressLine, setAddressLine] = useState<string>("");
  const [locality, setLocality] = useState<string>("");
  const [district, setDistrict] = useState<string>("Central District");
  const [stateName, setStateName] = useState<string>("National Capital Territory");
  const [pincode, setPincode] = useState<string>("110001");

  // Form State: Step 4 - Service-Specific Dynamic Fields
  const [serviceFormData, setServiceFormData] = useState<Record<string, any>>({});

  // Form State: Step 5 - Uploaded Documents
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);

  // Form State: Step 7 - Declaration
  const [isDeclared, setIsDeclared] = useState<boolean>(false);

  // Success Confirmation State
  const [submittedApp, setSubmittedApp] = useState<{
    id: string;
    applicationNumber: string;
    serviceName: string;
    departmentName: string;
    estimatedDays: number;
  } | null>(null);

  // Prefill state from navigation (e.g. from SETU Assistant)
  useEffect(() => {
    if (location.state && (location.state as any).prefill) {
      const p = (location.state as any).prefill;
      if (p.applicantName) setApplicantName(p.applicantName);
      if (p.mobileNumber) setMobileNumber(p.mobileNumber);
      if (p.email) setEmail(p.email);
      if (p.addressLine) setAddressLine(p.addressLine);
      if (p.pincode) setPincode(p.pincode);
      if (p.formData) setServiceFormData((prev) => ({ ...prev, ...p.formData }));
    }
  }, [location.state]);

  // Load Service & Schema
  const fetchServiceAndSchema = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [srvRes, schemaRes] = await Promise.all([
        citizenApi.getServiceById(id),
        citizenApi.getServiceRequirements(id).catch(() => null),
      ]);

      if (srvRes.success && srvRes.data) {
        setService(srvRes.data);
      } else {
        toast.error("Government service catalog entry not found.", "Service Not Found");
        navigate("/citizen/services");
        return;
      }

      if (schemaRes && schemaRes.success && schemaRes.data) {
        setSchema(schemaRes.data);
      }
    } catch {
      toast.error("Network error retrieving service application requirements.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchServiceAndSchema();
  }, [fetchServiceAndSchema]);

  // Dynamic Field Change Handler
  const handleDynamicFieldChange = (fieldId: string, value: any) => {
    setServiceFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Condition Evaluator for Step 4 Dynamic Fields
  const shouldRenderField = (field: ServiceFieldRequirement): boolean => {
    if (field.requirement !== "CONDITIONAL" || !field.condition) {
      return true;
    }
    const cond = field.condition;
    const currentVal = serviceFormData[cond.field];

    if (cond.operator === "truthy") {
      return Boolean(currentVal);
    }
    if (cond.operator === "equals") {
      return currentVal === cond.value;
    }
    if (cond.operator === "not_equals") {
      return currentVal !== cond.value;
    }
    return true;
  };

  // Document Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docCode: string, docName: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File exceeds 5MB size limit. Please upload a smaller document.", "File Too Large");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    const newDoc: UploadedDoc = {
      documentType: docCode,
      fileName: `${Date.now()}-${file.name.replace(/\s+/g, "_")}`,
      originalName: file.name,
      fileUrl,
      mimeType: file.type || "application/pdf",
      fileSizeBytes: file.size,
    };

    setDocuments((prev) => [...prev.filter((d) => d.documentType !== docCode), newDoc]);
    toast.success(`${docName} attached successfully.`, "Document Attached");
  };

  const handleRemoveDoc = (docCode: string) => {
    setDocuments((prev) => prev.filter((d) => d.documentType !== docCode));
  };

  // Step Validation Helpers
  const validateStep1 = () => Boolean(applicantName.trim() && fatherOrSpouseName.trim() && dateOfBirth && gender);
  const validateStep2 = () => Boolean(mobileNumber.trim() && /^[6-9]\d{9}$/.test(mobileNumber.trim()));
  const validateStep3 = () => Boolean(addressLine.trim() && locality.trim() && district.trim() && stateName.trim() && /^[1-9][0-9]{5}$/.test(pincode.trim()));

  const validateStep4 = (): boolean => {
    if (!schema) return true;
    for (const f of schema.fields.serviceSpecific) {
      if (!shouldRenderField(f)) continue;
      if (f.requirement === "REQUIRED" || f.requirement === "CONDITIONAL") {
        const val = serviceFormData[f.id];
        if (val === undefined || val === null || String(val).trim() === "") {
          return false;
        }
      }
    }
    return true;
  };

  const validateStep5 = (): boolean => {
    if (!schema) return documents.length > 0;
    const requiredDocs = schema.documents.filter((d) => d.requirement === "REQUIRED");
    return requiredDocs.every((rd) =>
      documents.some((u) => u.documentType === rd.code || u.documentType === rd.name)
    );
  };

  // Full Checklist Assessment
  const checklistItems = [
    {
      step: 1,
      title: "Applicant Personal Details",
      isComplete: validateStep1(),
      description: "Full name, parentage/spouse, date of birth, and gender declaration.",
    },
    {
      step: 2,
      title: "Verified Contact Details",
      isComplete: validateStep2(),
      description: "Active 10-digit mobile number for statutory SMS alerts.",
    },
    {
      step: 3,
      title: "Permanent / Domicile Address",
      isComplete: validateStep3(),
      description: "Street address, ward/locality, district, and 6-digit postal PIN.",
    },
    {
      step: 4,
      title: "Service-Specific Parameters",
      isComplete: validateStep4(),
      description: "Mandatory declarations and questionnaire for this departmental service.",
    },
    {
      step: 5,
      title: "Statutory Supporting Documents",
      isComplete: validateStep5(),
      description: schema
        ? `${documents.length} document(s) uploaded (${schema.documents.filter((d) => d.requirement === "REQUIRED").length} mandatory required).`
        : `${documents.length} document(s) attached.`,
    },
  ];

  const allChecksPassed = checklistItems.every((item) => item.isComplete);

  // Navigation between steps
  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1 && !validateStep1()) {
      setErrorMsg("Please complete all required personal details before continuing.");
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      setErrorMsg("Please provide a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      setErrorMsg("Please fill all required residential address fields and valid 6-digit PIN code.");
      return;
    }
    if (currentStep === 4 && !validateStep4()) {
      setErrorMsg("Please complete all mandatory service parameters.");
      return;
    }
    if (currentStep === 5 && !validateStep5()) {
      setErrorMsg("Please upload all mandatory verification documents.");
      return;
    }
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Copy Reference Number
  const handleCopyAppNumber = () => {
    if (submittedApp?.applicationNumber) {
      navigator.clipboard.writeText(submittedApp.applicationNumber);
      toast.success("Official Application Reference copied to clipboard!", "Copied");
    }
  };

  // Submit / Save Draft Application
  const handleSubmit = async (isDraft: boolean = false) => {
    setErrorMsg(null);

    if (!isDraft) {
      if (!allChecksPassed) {
        setErrorMsg("Your application checklist is incomplete. Please complete all mandatory sections.");
        setCurrentStep(6);
        return;
      }
      if (!isDeclared) {
        setErrorMsg("You must accept the official statutory declaration undertaking to proceed.");
        return;
      }
    }

    if (!service) return;

    setIsSubmitting(true);
    try {
      const payload = {
        formData: {
          applicantName: applicantName.trim(),
          fatherOrSpouseName: fatherOrSpouseName.trim(),
          dateOfBirth,
          gender,
          mobileNumber: mobileNumber.trim(),
          email: email.trim(),
          altPhone: altPhone.trim(),
          addressLine: addressLine.trim(),
          locality: locality.trim(),
          district: district.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          ...serviceFormData,
        },
        isDraft,
        documents: documents.map((d) => ({
          documentType: d.documentType,
          fileName: d.fileName,
          originalName: d.originalName,
          fileUrl: d.fileUrl,
          mimeType: d.mimeType,
          fileSizeBytes: d.fileSizeBytes,
        })),
      };

      const res = await citizenApi.applyForService(service.id, payload);

      if (res.success && res.data) {
        setSubmittedApp({
          id: res.data.application.id,
          applicationNumber: res.data.applicationNumber,
          serviceName: res.data.serviceName,
          departmentName: res.data.departmentName,
          estimatedDays: res.data.estimatedDays,
        });

        toast.success(
          isDraft
            ? "Application saved to drafts successfully."
            : `Application submitted! Reference: ${res.data.applicationNumber}`,
          "Success"
        );
      } else {
        setErrorMsg(res.message || "Failed to submit application.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error submitting application.";
      setErrorMsg(msg);
      toast.error(msg, "Submission Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUCCESS CONFIRMATION SCREEN
  // --------------------------------------------------------------------------
  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card className="border-emerald-200 bg-white shadow-xl overflow-hidden">
          <div className="bg-emerald-700 p-6 text-white text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto ring-8 ring-white/10">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Service Application Registered!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
              Your application has been queued for departmental scrutiny and digital processing.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Reference Number Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Application Reference Number
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-blue-700 tracking-wider">
                  {submittedApp.applicationNumber}
                </span>
                <button
                  onClick={handleCopyAppNumber}
                  title="Copy Application Number"
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 transition shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Quote this reference number for all grievance escalations and officer correspondence.
              </p>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Government Service</span>
                <p className="font-bold text-slate-900 line-clamp-1">{submittedApp.serviceName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Governing Department</span>
                <p className="font-bold text-slate-900 line-clamp-1">{submittedApp.departmentName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  SUBMITTED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Turnaround</span>
                <p className="font-bold text-emerald-700">{submittedApp.estimatedDays} Working Days</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link to={`/citizen/applications/${submittedApp.id}`} className="w-full sm:w-1/2">
                <Button variant="primary" size="md" className="w-full font-bold shadow-md" rightIcon={<ExternalLink className="w-4 h-4" />}>
                  Track Application Status
                </Button>
              </Link>

              <Link to="/citizen/applications" className="w-full sm:w-1/2">
                <Button variant="outline" size="md" className="w-full font-semibold">
                  View All My Applications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading digital application form & dynamic schema...</p>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to={`/citizen/services/${service.id}`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {service.code}
              </span>
              <span className="text-xs text-slate-500">• {service.department?.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Apply: {service.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(true)}
            isLoading={isSubmitting}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* 7-Step Horizontal Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-none">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : isCompleted
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                    isActive
                      ? "bg-white text-blue-600"
                      : isCompleted
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : s.id}
                </div>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Personal Details */}
      {currentStep === 1 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Step 1 of 7 — Applicant Identity</span>
            </div>
            <CardTitle className="text-lg">Personal Details</CardTitle>
            <CardDescription className="text-xs">
              Provide legal identification matching your government ID proof.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name of Applicant"
                required
                placeholder="As per Aadhaar / Official ID"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />

              <Input
                label="Father's / Husband's Full Name"
                required
                placeholder="Parent or Spouse full name"
                value={fatherOrSpouseName}
                onChange={(e) => setFatherOrSpouseName(e.target.value)}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Non-Binary</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="primary" size="md" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next: Contact Info
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Contact Info */}
      {currentStep === 2 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4" />
              <span>Step 2 of 7 — Communication & Alerts</span>
            </div>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription className="text-xs">
              Official status notifications and scrutiny updates will be dispatched to these coordinates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Mobile Number"
                required
                placeholder="10-digit mobile (e.g. 9876543210)"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                helperText="Must be an active Indian mobile number for SMS OTP and status updates."
              />

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="citizen@example.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Digital acknowledgment copy will be emailed."
              />

              <Input
                label="Alternate Contact Number (Optional)"
                placeholder="Secondary phone / Landline"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handlePrev} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button variant="primary" size="md" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next: Address Details
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Address Details */}
      {currentStep === 3 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Step 3 of 7 — Residential Jurisdiction</span>
            </div>
            <CardTitle className="text-lg">Address Details</CardTitle>
            <CardDescription className="text-xs">
              Permanent residential address determines departmental jurisdiction and field verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address / House No."
              required
              placeholder="House/Plot No., Street / Building Name"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Village / Ward / Locality"
                required
                placeholder="Locality or Municipal Ward"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />

              <Input
                label="District / Tehsil"
                required
                placeholder="District name"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />

              <Input
                label="State / Union Territory"
                required
                placeholder="State or UT"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />

              <Input
                label="Postal PIN Code"
                required
                placeholder="6-digit PIN code (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handlePrev} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button variant="primary" size="md" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next: Service Specifics
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: Service Specific Details */}
      {currentStep === 4 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>Step 4 of 7 — Service Parameters</span>
            </div>
            <CardTitle className="text-lg">Service Specific Information</CardTitle>
            <CardDescription className="text-xs">
              Fill the parameters required specifically for {service.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schema && schema.fields.serviceSpecific.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schema.fields.serviceSpecific.map((field) => {
                  if (!shouldRenderField(field)) return null;

                  const isRequired = field.requirement === "REQUIRED" || field.requirement === "CONDITIONAL";

                  if (field.type === "select" && field.options) {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {field.label} {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          value={serviceFormData[field.id] || ""}
                          onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          <option value="">-- Select Option --</option>
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {field.helperText && <p className="text-[11px] text-slate-400 mt-1">{field.helperText}</p>}
                      </div>
                    );
                  }

                  if (field.type === "boolean") {
                    return (
                      <div key={field.id} className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={field.id}
                          checked={Boolean(serviceFormData[field.id])}
                          onChange={(e) => handleDynamicFieldChange(field.id, e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <label htmlFor={field.id} className="text-xs font-bold text-slate-800 cursor-pointer">
                          {field.label}
                        </label>
                      </div>
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <div key={field.id} className="sm:col-span-2">
                        <Textarea
                          label={field.label}
                          required={isRequired}
                          placeholder={field.placeholder}
                          value={serviceFormData[field.id] || ""}
                          onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                          helperText={field.helperText}
                        />
                      </div>
                    );
                  }

                  return (
                    <Input
                      key={field.id}
                      label={field.label}
                      required={isRequired}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      placeholder={field.placeholder}
                      value={serviceFormData[field.id] || ""}
                      onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                      helperText={field.helperText}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Purpose of Application"
                  required
                  placeholder="e.g. Higher Education Scholarship, Employment, Statutory Clearance"
                  value={serviceFormData.purpose || ""}
                  onChange={(e) => handleDynamicFieldChange("purpose", e.target.value)}
                />
                <Textarea
                  label="Additional Explanatory Remarks"
                  placeholder="Any supporting context or reference numbers"
                  value={serviceFormData.remarks || ""}
                  onChange={(e) => handleDynamicFieldChange("remarks", e.target.value)}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handlePrev} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button variant="primary" size="md" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next: Upload Documents
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 5: Document Upload */}
      {currentStep === 5 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Step 5 of 7 — Statutory Enclosures</span>
            </div>
            <CardTitle className="text-lg">Upload Supporting Verification Documents</CardTitle>
            <CardDescription className="text-xs">
              Upload clear PDF, JPG, or PNG copies (max 5MB each). Documents are cryptographically logged.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schema && schema.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schema.documents.map((doc) => {
                  const uploaded = documents.find(
                    (d) => d.documentType === doc.code || d.documentType === doc.name
                  );
                  const isRequired = doc.requirement === "REQUIRED";

                  return (
                    <div
                      key={doc.code}
                      className={`p-4 rounded-2xl border transition ${
                        uploaded
                          ? "border-emerald-200 bg-emerald-50/50"
                          : isRequired
                          ? "border-amber-200 bg-amber-50/30"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isRequired
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {doc.requirement}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
                        </div>
                      </div>

                      {uploaded ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                              {uploaded.originalName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({(uploaded.fileSizeBytes / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.code)}
                            title="Remove Document"
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition text-xs font-bold text-slate-600">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span>Choose Document</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, doc.code, doc.name)}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Attach Identity & Supporting Proofs</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "GENERAL_DOC", "General Document")}
                  className="mt-3 text-xs"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handlePrev} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button variant="primary" size="md" onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Next: Review Checklist
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 6: Interactive Application Readiness Checklist */}
      {currentStep === 6 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <CheckSquare className="w-4 h-4" />
              <span>Step 6 of 7 — Pre-Submission Audit</span>
            </div>
            <CardTitle className="text-lg">Application Readiness Checklist</CardTitle>
            <CardDescription className="text-xs">
              Verify all statutory mandatory criteria before final digital submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                allChecksPassed
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-3">
                {allChecksPassed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {allChecksPassed
                      ? "All Statutory Requirements Met"
                      : "Incomplete Requirements Detected"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {allChecksPassed
                      ? "Your digital application is ready for final declaration and departmental filing."
                      : "Please resolve the highlighted incomplete sections below prior to final submission."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.step}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    item.isComplete
                      ? "bg-white border-slate-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.isComplete
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isComplete ? "✓" : "!"}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </div>
                  </div>

                  {!item.isComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(item.step)}
                      className="text-red-700 border-red-200 hover:bg-red-50 text-xs"
                    >
                      Fix Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handlePrev} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!allChecksPassed}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next: Statutory Declaration
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 7: Statutory Declaration & Submit */}
      {currentStep === 7 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Step 7 of 7 — Legal Undertaking</span>
            </div>
            <CardTitle className="text-lg">Statutory Declaration & Submission</CardTitle>
            <CardDescription className="text-xs">
              Carefully review the declaration undertaking before committing your digital application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Legal Undertaking Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-900">Official Declaration:</p>
              <p>
                {schema?.declarationText ||
                  "I hereby solemnly affirm and declare that the statements made above and documents enclosed are true, complete, and correct to the best of my knowledge and belief. I understand that submitting fraudulent or falsified documentation is punishable under the Indian Penal Code and applicable state governance acts."}
              </p>
            </div>

            {/* Checkbox */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
              <input
                type="checkbox"
                id="statutoryDeclaration"
                checked={isDeclared}
                onChange={(e) => setIsDeclared(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="statutoryDeclaration" className="text-xs font-semibold text-slate-800 cursor-pointer leading-snug">
                I accept the statutory declaration, affirm the accuracy of the attached documents, and request official processing of my application.
              </label>
            </div>

            {/* Application Overview Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Application Snapshot</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <p><span className="font-bold">Applicant:</span> {applicantName}</p>
                <p><span className="font-bold">Contact:</span> {mobileNumber}</p>
                <p><span className="font-bold">District:</span> {district}, {stateName}</p>
                <p><span className="font-bold">Documents:</span> {documents.length} attached</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="md" onClick={handlePrev} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Previous
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => handleSubmit(true)}
                isLoading={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Save as Draft
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleSubmit(false)}
                isLoading={isSubmitting}
                disabled={!isDeclared || !allChecksPassed}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold shadow-md"
              >
                Submit Application
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ApplyServicePage;
