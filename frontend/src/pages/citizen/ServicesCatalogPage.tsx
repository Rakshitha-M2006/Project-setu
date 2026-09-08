import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi, { ServiceItem } from "../../api/citizenApi";
import { Department } from "../../types";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Search,
  Building,
  FileCheck2,
  Clock,
  IndianRupee,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  } from "lucide-react";

const SERVICE_CATEGORIES = [
  "ALL",
  "Identity & Civil Documents",
  "Revenue & Certificates",
  "Municipal & Urban Services",
  "Public Utilities & Water",
  "Agriculture & Farmers",
  "Health & Family Welfare",
  "Education & Scholarships",
  "Social Welfare & Pensions",
  "Employment & Skill Development",
  "Transport & Driving Services",
  "Food & Civil Supplies (Ration)",
  "Business, MSME & Trade Licensing",
  "Police, Verification & Safety",
  "Housing & Urban Development",
  "Legal, Court & Notary",
  "General Administration",
];

export const ServicesCatalogPage: React.FC = () => {
  const toast = useToast();
  const { t } = useLanguage();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [, setDepartments] = useState<Department[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "INTERNAL" | "EXTERNAL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCatalogData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch departments
      const deptRes = await citizenApi.getDepartments();
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }

      // 2. Fetch services
      const servRes = await citizenApi.getServices({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      });

      if (servRes.success && servRes.data) {
        setServices(servRes.data);
      }
    } catch {
      toast.error("Failed to load government services catalog.", "Catalog Error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, toast]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  const filteredServices = services.filter((s) => {
    if (activeTab === "INTERNAL") {
      return !s.isExternal && s.applicationType !== "EXTERNAL";
    }
    if (activeTab === "EXTERNAL") {
      return s.isExternal || s.applicationType === "EXTERNAL";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-0.5 rounded-full border border-blue-400/30 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              {t("services.title") || "National Citizen Service Directory"}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-bold">
              16 Essential Categories
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t("services.title")}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/citizen/schemes">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              leftIcon={<Layers className="w-4 h-4" />}
            >
              {t("nav.schemes") || "Government Schemes"}
            </Button>
          </Link>
          <Link to="/citizen/applications">
            <Button
              className="bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t("nav.applications")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Type Tabs (All / Internal / External) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-blue-700 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>{t("common.all") || "All"} {t("navigation.services") || "Services"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {services.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("INTERNAL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "INTERNAL"
              ? "bg-blue-700 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>{t("services.directApplyTab") || "SETU Direct Apply (Internal 7-Step)"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            {services.filter((s) => !s.isExternal && s.applicationType !== "EXTERNAL").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("EXTERNAL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "EXTERNAL"
              ? "bg-blue-700 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
          <span>{t("services.externalPortalsTab") || "Official Portals (External)"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
            {services.filter((s) => s.isExternal || s.applicationType === "EXTERNAL").length}
          </span>
        </button>
      </div>

      {/* 3. Category Carousel / Filter Pills */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-96">
              <Input
                placeholder={t("services.searchPlaceholder") || "Search services by title or department..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="py-1.5 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCatalogData}
                isLoading={isLoading}
                className="text-xs font-semibold"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                {t("common.loading") ? "Refresh" : "Refresh"}
              </Button>
            </div>
          </div>

          {/* 16 Category Badges */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Filter by Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-blue-700 text-white shadow-xs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "ALL" ? t("common.all") : cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">{t("common.loading")}</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <Card className="border-slate-200 p-12 text-center space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{t("services.noServices") || "No Services Found"}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No public services match your selected category or search filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => {
            const requiredDocCount = Array.isArray(s.requiredDocuments) ? s.requiredDocuments.length : 2;
            const fee = Number(s.feeAmount) || 0;
            const isExternal = s.isExternal || s.applicationType === "EXTERNAL";

            return (
              <Card
                key={s.id}
                className="border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Category & Badge Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {s.category || s.department?.name || "General Administration"}
                    </span>

                    {isExternal ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        Official Portal
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        SETU Direct Apply
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{s.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {s.description || "Official government citizen service."}
                    </p>
                  </div>

                  {/* Service Specs: Fee & Timeline */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t("services.fee")}
                      </span>
                      <span className="font-bold text-slate-900 flex items-center">
                        {fee > 0 ? (
                          <>
                            <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                            {fee.toFixed(2)}
                          </>
                        ) : (
                          <span className="text-emerald-700 font-bold">{t("services.freeService")}</span>
                        )}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t("services.processingTime")}
                      </span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {s.estimatedProcessingDays} {t("services.days")}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Preview */}
                  {s.eligibilityCriteria && (
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-blue-800 block">{t("schemes.eligibilityCriteria") || "Eligibility:"}</span>
                      <p className="line-clamp-2 text-[11px] leading-relaxed">{s.eligibilityCriteria}</p>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {requiredDocCount} {t("services.requiredDocuments").toLowerCase()}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link to={`/citizen/services/${s.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-semibold">
                        {t("common.viewDetails") || "Details"}
                      </Button>
                    </Link>

                    {isExternal && s.officialPortalUrl ? (
                      <a
                        href={s.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        <span>{t("assistant.visitOfficialPortal") || "Visit Portal"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link to={`/citizen/services/${s.id}/apply`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs font-bold shadow-sm"
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                        >
                          {t("services.applyNow")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServicesCatalogPage;
