import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const SeniorOfficerLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { label: t("navigation.overview") || "Executive Overview", path: "/senior-officer", icon: <TrendingUp className="w-4 h-4" /> },
    { label: t("common.statusEscalated") || "Critical Escalations", path: "/senior-officer/escalations", icon: <AlertOctagon className="w-4 h-4" /> },
    { label: t("navigation.officers") || "Officer Performance", path: "/senior-officer/officers", icon: <Users className="w-4 h-4" /> },
    { label: t("navigation.analytics") || "Department Analytics", path: "/senior-officer/analytics", icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const currentNavItem = navItems.find((item) => location.pathname === item.path);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Senior Officer / HOD Header */}
      <div className="bg-indigo-950 text-white border-b border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-700 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none truncate">{user?.fullName}</p>
              <p className="text-[11px] text-indigo-300 mt-0.5 truncate">
                Senior Officer / Head of Department (HOD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="bg-indigo-900 border border-indigo-800 text-indigo-200 px-2.5 py-1 rounded font-mono">
              Jurisdiction: State Nodal Level
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        {/* Mobile Navigation Bar & Drawer Trigger (<768px) */}
        <div className="md:hidden mb-4 flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Senior Officer:
            </span>
            <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 truncate">
              {currentNavItem?.label || "Overview"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-800 text-white hover:bg-indigo-900 active:bg-indigo-950 transition shadow-sm"
            aria-label="Open senior officer navigation menu"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

        {/* Mobile Off-Canvas Drawer (<768px) */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
              aria-hidden="true"
            />

            {/* Off-Canvas Sidebar Container */}
            <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col p-4 overflow-y-auto space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-800 text-white flex items-center justify-center shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t("navigation.overview") || "Senior Oversight"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileNavOpen(false)}
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

              {/* Executive Authority Box */}
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl p-4 text-xs space-y-2 mt-auto">
                <p className="font-bold flex items-center gap-1.5 text-indigo-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Executive Authority</span>
                </p>
                <p className="text-indigo-800/90 leading-relaxed text-[11px]">
                  {t("home.workflow.step3Desc") ||
                    "You hold authority to re-assign stalled matters, issue direct inquiries, and override classification tags."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Desktop & Tablet Sidebar (≥768px) - Sticky & Scroll-pinned */}
          <aside className="hidden md:block md:col-span-1 space-y-4 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
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
          <main className="col-span-1 md:col-span-3 lg:col-span-4 min-w-0 w-full">
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
