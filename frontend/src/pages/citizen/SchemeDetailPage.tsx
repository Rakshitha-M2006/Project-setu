import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi from "../../api/citizenApi";
import SchemeEligibilityModal from "../../components/schemes/SchemeEligibilityModal";
import {
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Award,
  Users,
  Building,
  Calendar,
  AlertCircle,
  } from "lucide-react";

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();

  const [scheme, setScheme] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await citizenApi.getSchemeDetails(id);
        if (res.success && res.data?.scheme) {
          setScheme(res.data.scheme);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-semibold text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">{t("schemes.notFoundTitle") || "Government Scheme Not Found"}</h3>
        <p className="text-xs text-slate-500">
          The requested scheme could not be located in the central registry.
        </p>
        <Link
          to="/citizen/schemes"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("schemes.backToCatalog") || "Back to Schemes Catalog"}</span>
        </Link>
      </div>
    );
  }

  const localizedName = scheme.translations?.[language]?.name || scheme.name;
  const localizedOverview = scheme.translations?.[language]?.overview || scheme.overview;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Back Link */}
      <Link
        to="/citizen/schemes"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("schemes.backToAll") || "Back to All Schemes"}</span>
      </Link>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200/60">
            {scheme.category}
          </span>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {t("common.lastUpdated")}: {scheme.lastUpdated || "August 2026"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif leading-tight">
          {localizedName}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" />
            <strong>{scheme.sponsoringAgency}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{t("schemes.targetLabel") || "Target:"} <strong>{scheme.targetAudience}</strong></span>
          </span>
        </div>

        {/* Hero Actions */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEligibilityOpen(true)}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("schemes.checkEligibilityBtn")}</span>
          </button>

          {scheme.officialPortalUrl && (
            <a
              href={scheme.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition shadow-sm flex items-center gap-1.5"
            >
              <span>{t("schemes.applyPortalBtn")}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Scheme Overview & Benefits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <span>{t("schemes.overview")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {localizedOverview}
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>{t("schemes.keyBenefits")}</span>
            </h2>
            <div className="space-y-2.5">
              {scheme.benefits?.map((benefit: string, i: number) => (
                <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>{t("schemes.eligibilitySummary")}</span>
            </h2>
            <div className="space-y-2.5">
              {scheme.eligibilityCriteria?.map((crit: string, i: number) => (
                <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
                  <span className="leading-relaxed">{crit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Required Documents & Application Details */}
        <div className="space-y-6">
          {/* Documents Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>{t("schemes.requiredDocsSummary")}</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {scheme.requiredDocuments?.map((doc: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Source & Disclaimer */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800">{t("schemes.officialSource")}</h4>
            {scheme.officialPortalUrl && (
              <a
                href={scheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline flex items-center gap-1 font-semibold break-all"
              >
                <span>{scheme.officialPortalUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
              {t("schemes.disclaimer")}
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility Modal */}
      {isEligibilityOpen && (
        <SchemeEligibilityModal
          isOpen={isEligibilityOpen}
          onClose={() => setIsEligibilityOpen(false)}
          scheme={scheme}
        />
      )}
    </div>
  );
};

export default SchemeDetailPage;
