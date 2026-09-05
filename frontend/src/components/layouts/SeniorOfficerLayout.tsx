import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ToastContainer from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  TrendingUp,
  AlertOctagon,
  Users,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const SeniorOfficerLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { label: t("navigation.overview") || "Executive Overview", path: "/senior-officer", icon: <TrendingUp className="w-4 h-4" /> },
    { label: t("common.statusEscalated") || "Critical Escalations", path: "/senior-officer/escalations", icon: <AlertOctagon className="w-4 h-4" /> },
    { label: t("navigation.officers") || "Officer Performance", path: "/senior-officer/officers", icon: <Users className="w-4 h-4" /> },
    { label: t("navigation.analytics") || "Department Analytics", path: "/senior-officer/analytics", icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Senior Officer / HOD Header */}
      <div className="bg-indigo-950 text-white border-b border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-700 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{user?.fullName}</p>
              <p className="text-[11px] text-indigo-300 mt-0.5">
                Senior Officer / Head of Department (HOD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="bg-indigo-900 border border-indigo-800 text-indigo-200 px-2.5 py-1 rounded font-mono">
              Jurisdiction: State Nodal Level
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-100">
                {t("navigation.overview") || "Senior Oversight"}
              </p>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                      isActive
                        ? "bg-indigo-800 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-indigo-800">
                <ShieldCheck className="w-4 h-4" />
                <span>Executive Authority</span>
              </p>
              <p className="text-indigo-800/90 leading-relaxed text-[11px]">
                {t("home.workflow.step3Desc") ||
                  "You hold authority to re-assign stalled matters, issue direct inquiries, and override classification tags."}
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-4">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default SeniorOfficerLayout;
