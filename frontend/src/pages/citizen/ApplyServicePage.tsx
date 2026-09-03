import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import citizenApi, { ServiceItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
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
} from "lucide-react";

interface UploadedDoc {
  documentType: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export const ApplyServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [applicantName, setApplicantName] = useState<string>(user?.fullName || "");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [applicantEmail, setApplicantEmail] = useState<string>(user?.email || "");
  const [addressLine, setAddressLine] = useState<string>("");
  const [locality, setLocality] = useState<string>("");
  const [district, setDistrict] = useState<string>("Central District");
  const [pincode, setPincode] = useState<string>("110001");
  const [servicePurpose, setServicePurpose] = useState<string>("");
  const [propertyNumber, setPropertyNumber] = useState<string>("");
  const [additionalRemarks, setAdditionalRemarks] = useState<string>("");

  // Uploaded Documents
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);

  // Success Confirmation State
  const [submittedApp, setSubmittedApp] = useState<{
    id: string;
    applicationNumber: string;
    serviceName: string;
    departmentName: string;
    estimatedDays: number;
  } | null>(null);

  const fetchService = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await citizenApi.getServiceById(id);
      if (response.success && response.data) {
        setService(response.data);
      } else {
        toast.error("Service record not found.", "Error");
        navigate("/citizen/services");
      }
    } catch {
      toast.error("Network error loading service.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File exceeds maximum 10MB limit.", "File Too Large");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    const newDoc: UploadedDoc = {
      documentType: docType,
      fileName: `${Date.now()}-${file.name.replace(/\s+/g, "_")}`,
      originalName: file.name,
      fileUrl,
      mimeType: file.type || "application/pdf",
      fileSizeBytes: file.size,
    };

    setDocuments((prev) => [...prev.filter((d) => d.documentType !== docType), newDoc]);
    toast.success(`${docType} attached successfully.`, "Document Attached");
  };

  const handleRemoveDoc = (docType: string) => {
    setDocuments((prev) => prev.filter((d) => d.documentType !== docType));
  };

  const handleCopyAppNumber = () => {
    if (submittedApp?.applicationNumber) {
      navigator.clipboard.writeText(submittedApp.applicationNumber);
      toast.success("Application Number copied to clipboard!", "Copied");
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setErrorMsg(null);

    if (!applicantName.trim()) {
      setErrorMsg("Applicant full name is required.");
      return;
    }

    if (!addressLine.trim()) {
      setErrorMsg("Physical address is required.");
      return;
    }

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setErrorMsg("Please provide a valid 6-digit Indian PIN code.");
      return;
    }

    if (!service) return;

    setIsSubmitting(true);
    try {
      const payload = {
        formData: {
          applicantName: applicantName.trim(),
          contactPhone: contactPhone.trim() || user?.email,
          applicantEmail: applicantEmail.trim(),
          addressLine: addressLine.trim(),
          locality: locality.trim(),
          district: district.trim(),
          pincode: pincode.trim(),
          servicePurpose: servicePurpose.trim(),
          propertyNumber: propertyNumber.trim(),
          additionalRemarks: additionalRemarks.trim(),
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
            ? "Application saved as draft."
            : `Application submitted! Reference: ${res.data.applicationNumber}`,
          "Success"
        );
      } else {
        setErrorMsg(res.message || "Failed to submit application.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error submitting application.";
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
          <div className="bg-emerald-600 p-6 text-white text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto ring-8 ring-white/10">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Service Application Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
              Your application has been registered with the departmental scrutiny wing.
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
                Quote this application number for all departmental correspondence and status tracking.
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
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Initial Status</span>
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
        <p className="text-xs text-slate-500">Loading digital application form...</p>
      </div>
    );
  }

  if (!service) return null;

  const docsList: string[] = Array.isArray(service.requiredDocuments)
    ? service.requiredDocuments
    : ["Identity Proof (Aadhaar / Voter ID)", "Address / Property Document"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between">
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
      </div>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* 2. Application Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Citizen Service Application Form</CardTitle>
          <CardDescription className="text-xs">
            Complete the required information and upload supporting verification documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section A: Applicant Personal Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>1. Applicant Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name of Applicant"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />

              <Input
                label="Contact Mobile Number"
                placeholder="e.g. 9876543210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <Input
              label="Email Address"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
            />
          </div>

          {/* Section B: Property / Service Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>2. Service Location & Address Details</span>
            </h4>

            <Input
              label="Premises / House / Street Address"
              required
              placeholder="e.g. Plot No. 42, Sector 5"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Locality / Ward"
                placeholder="e.g. Ward 14"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />

              <Input
                label="District / Zone"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />

              <Input
                label="Postal PIN Code"
                required
                placeholder="110001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          {/* Section C: Service Specific Particulars */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>3. Service Specific Particulars</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Property / Consumer Holding ID (if any)"
                placeholder="e.g. PROP-9842"
                value={propertyNumber}
                onChange={(e) => setPropertyNumber(e.target.value)}
              />

              <Input
                label="Connection Purpose / Classification"
                placeholder="e.g. Domestic Residential"
                value={servicePurpose}
                onChange={(e) => setServicePurpose(e.target.value)}
              />
            </div>

            <Textarea
              label="Additional Remarks / Specific Instructions"
              rows={3}
              placeholder="Any specific instructions for the site inspection team..."
              value={additionalRemarks}
              onChange={(e) => setAdditionalRemarks(e.target.value)}
            />
          </div>

          {/* Section D: Required Documents Upload */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>4. Supporting Verification Documents</span>
            </h4>

            <div className="space-y-3">
              {docsList.map((docType, idx) => {
                const attached = documents.find((d) => d.documentType === docType);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{docType}</p>
                      {attached ? (
                        <p className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Attached: {attached.originalName} ({(attached.fileSizeBytes / 1024).toFixed(1)} KB)
                        </p>
                      ) : (
                        <p className="text-slate-400">PDF, JPG, PNG up to 10MB</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {attached ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDoc(docType)}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs py-1"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Remove
                        </Button>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, docType)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section E: Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <Link to={`/citizen/services/${service.id}`}>
              <Button type="button" variant="outline" size="md" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={isSubmitting}
                onClick={() => handleSubmit(true)}
                className="text-xs font-semibold"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="font-bold px-8 shadow-md"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyServicePage;
