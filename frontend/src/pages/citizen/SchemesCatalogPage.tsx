import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi from "../../api/citizenApi";
import SchemeEligibilityModal from "../../components/schemes/SchemeEligibilityModal";
import {
  Search,
  Sparkles,
  ExternalLink,
  Users,
  Award,
  Layers,
} from "lucide-react";

export const SchemesCatalogPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [schemes, setSchemes] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Selected scheme for eligibility modal
  const [eligibilityScheme, setEligibilityScheme] = useState<any | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await citizenApi.getSchemes({
        q: searchQuery,
        category: selectedCategory,
      });

      if (res.success && res.data) {
        setSchemes(res.data.schemes || []);
        if (res.data.categories) {
          setCategories(res.data.categories);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("schemes.catalogTitle") || "National Welfare Schemes Repository"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
            {t("schemes.title")}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
            {t("schemes.subtitle")}
          </p>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("schemes.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-800 transition shadow-sm"
          >
            {t("common.search")}
          </button>
        </form>

        {/* Categories Horizontal Scroll / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Schemes Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-500">{t("common.loading")}</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">{t("common.noData")}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No government schemes match the selected filter. Try searching with general terms like 'farmer', 'health', or 'pension'.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => {
            const localizedName = scheme.translations?.[language]?.name || scheme.name;
            const localizedDesc = scheme.translations?.[language]?.shortDescription || scheme.shortDescription;

            return (
              <div
                key={scheme.code}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200/60">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {scheme.code}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {localizedName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {localizedDesc}
                    </p>
                  </div>

                  {/* Highlights Pill Grid */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-[11px]">
                        <strong>{t("schemes.targetAudience")}:</strong> {scheme.targetAudience}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-1">
                        <strong>{t("schemes.keyBenefits")}:</strong> {scheme.benefits?.[0] || "Statutory financial & welfare benefit"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/citizen/schemes/${scheme.slug}`}
                      className="px-3.5 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                    >
                      {t("schemes.viewDetailsBtn")}
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEligibilityScheme(scheme)}
                      className="px-3 py-2 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-200/60 hover:bg-amber-100 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t("schemes.checkEligibilityBtn")}</span>
                    </button>
                  </div>

                  {scheme.officialPortalUrl && (
                    <a
                      href={scheme.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition flex items-center gap-1 shadow-sm"
                    >
                      <span>{t("schemes.applyPortalBtn")}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Eligibility Evaluation Modal */}
      {eligibilityScheme && (
        <SchemeEligibilityModal
          isOpen={Boolean(eligibilityScheme)}
          onClose={() => setEligibilityScheme(null)}
          scheme={eligibilityScheme}
        />
      )}
    </div>
  );
};

export default SchemesCatalogPage;
