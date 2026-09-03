import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import citizenApi, { ServiceItem } from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ArrowLeft,
  Building,
  Clock,
  IndianRupee,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchService = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await citizenApi.getServiceById(id);
      if (response.success && response.data) {
        setService(response.data);
      } else {
        toast.error("Government service record not found.", "Service Error");
        navigate("/citizen/services");
      }
    } catch {
      toast.error("Network error retrieving service specifications.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading government service specifications...</p>
      </div>
    );
  }

  if (!service) return null;

  const fee = Number(service.feeAmount) || 0;
  const docsList: string[] = Array.isArray(service.requiredDocuments)
    ? service.requiredDocuments
    : ["Government Issued Photo Identity Card (Aadhaar / Voter ID)", "Valid Address / Property Proof Document"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/citizen/services">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {service.code}
              </span>
              <span className="text-xs text-slate-500">• {service.department?.name || "General Administration"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {service.name}
            </h1>
          </div>
        </div>

        <Link to={`/citizen/services/${service.id}/apply`}>
          <Button
            variant="primary"
            size="md"
            className="font-bold shadow-md px-6 text-xs sm:text-sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Application
          </Button>
        </Link>
      </div>

      {/* 2. Key Specs Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Governing Authority</span>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">{service.department?.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Processing Window</span>
              <p className="text-xs font-bold text-slate-900">{service.estimatedProcessingDays} Working Days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Fee</span>
              <p className="text-xs font-bold text-slate-900">
                {fee > 0 ? `₹${fee.toFixed(2)} (Online Payment)` : "Free of Cost"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Detailed Service Info & Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Description & Eligibility */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Service Overview & Purpose</CardTitle>
              <CardDescription className="text-xs">
                Official public service description as cataloged by the government department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="whitespace-pre-wrap">{service.description || "Official government citizen service."}</p>

              {/* Eligibility Criteria */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Citizen Eligibility Criteria</span>
                </div>
                <p className="text-blue-950 leading-relaxed">
                  {service.eligibilityCriteria ||
                    "Open to all bona fide residents of the state possessing valid identity & address proof."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step-by-Step Instructions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Step-by-Step Application Workflow</CardTitle>
              <CardDescription className="text-xs">
                Procedural lifecycle from submission to departmental approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900">Submit Digital Application</p>
                  <p className="text-slate-500">
                    Fill in applicant personal details, address, and upload certified document scans.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">Scrutiny & Document Verification</p>
                  <p className="text-slate-500">
                    Department verification officer verifies proofs against municipal registry records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">Sanction / Certificate Issuance</p>
                  <p className="text-slate-500">
                    Upon approval, the digital permit / connection sanction order is delivered to your portal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Mandatory Document Checklist */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-700" />
                <CardTitle className="text-sm">Mandatory Required Documents</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Ensure scanned PDF or image copies are prepared prior to applying
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {docsList.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800 leading-snug">{doc}</span>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900 mt-3">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>Scanned files must be clear and under 10MB in size (PDF, JPG, PNG).</p>
              </div>

              <div className="pt-3">
                <Link to={`/citizen/services/${service.id}/apply`}>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full font-bold shadow-md text-xs py-2.5"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Application Form
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
