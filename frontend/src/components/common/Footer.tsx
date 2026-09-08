import React from "react";
import { Link } from "react-router-dom";
import { Landmark, Shield, PhoneCall, Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* 1. Emergency Helpline Strip */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {t("footer.emergencyHelplines") || "National Citizen Emergency & Grievance Helplines"}:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 font-mono text-[11px]">
            <span>{t("footer.emergency112") || "National Emergency: 112"}</span>
            <span>{t("footer.electricity1912") || "Electricity Helplines: 1912"}</span>
            <span>{t("footer.water1916") || "Water Supply Complaints: 1916"}</span>
            <span>{t("footer.antiCorruption1064") || "Anti-Corruption Bureau: 1064"}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Portal Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center text-amber-400">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white tracking-tight font-serif">
                {t("common.appName") || "PROJECT SETU"}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("footer.description") ||
                "An enterprise AI-driven citizen grievance redressal and public service delivery ecosystem. Empowering citizens through real-time NLP classification, strict SLA enforcement, and automated escalation pipelines."}
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>{t("footer.dpiArchitecture") || "National Digital Public Infrastructure Architecture"}</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t("footer.citizenServices") || "Citizen Services"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/citizen/grievances/new" className="hover:text-amber-400 transition">
                  {t("footer.lodgeGrievance") || "Lodge Public Grievance"}
                </Link>
              </li>
              <li>
                <Link to="/citizen/grievances" className="hover:text-amber-400 transition">
                  {t("footer.trackGrievance") || "Track Grievance Status"}
                </Link>
              </li>
              <li>
                <Link to="/citizen/services" className="hover:text-amber-400 transition">
                  {t("footer.applyServices") || "Apply for Government Services"}
                </Link>
              </li>
              <li>
                <Link to="/citizen/schemes" className="hover:text-amber-400 transition">
                  {t("navigation.schemes") || "Government Schemes"}
                </Link>
              </li>
              <li>
                <Link to="/citizen/applications" className="hover:text-amber-400 transition">
                  {t("footer.downloadCertificates") || "Download Application Certificates"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Participating Ministries */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t("footer.governingDepartments") || "Governing Departments"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>{t("footer.deptWater") || "Department of Drinking Water & Sanitation"}</li>
              <li>{t("footer.deptPower") || "Ministry of Power & Energy"}</li>
              <li>{t("footer.deptPwd") || "Public Works Department (PWD - Roads)"}</li>
              <li>{t("footer.deptHealth") || "Department of Health & Family Welfare"}</li>
              <li>{t("footer.deptRevenue") || "Revenue, Land Records & Survey"}</li>
              <li>{t("footer.deptWcd") || "Women & Child Development (WCD)"}</li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t("footer.securityTitle") || "Security & Compliance"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("footer.securityDesc") ||
                "Compliant with Guidelines for Indian Government Websites (GIGW) & ISO 27001 standard data protection protocols. Zero plaintext credentials."}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{t("footer.techStack") || "Node.js • Prisma • PostgreSQL • FastAPI"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bottom Copyright & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>{t("footer.copyright") || "© 2026 PROJECT SETU. All Rights Reserved. Government Services & Grievance Management Platform."}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer transition">
              {t("footer.terms") || "Terms of Service"}
            </span>
            <span className="hover:text-slate-300 cursor-pointer transition">
              {t("footer.privacy") || "Privacy Policy"}
            </span>
            <span className="hover:text-slate-300 cursor-pointer transition">
              {t("footer.accessibility") || "Accessibility Statement"}
            </span>
            <span className="hover:text-slate-300 cursor-pointer transition">
              {t("footer.hyperlinkPolicy") || "Hyperlinking Policy"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
