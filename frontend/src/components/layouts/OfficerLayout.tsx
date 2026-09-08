import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ToastContainer from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  Inbox,
  Clock,
  AlertTriangle,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const OfficerLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { label: t("officer.dashboardTitle") || "Officer Dashboard", path: "/officer/dashboard", icon: <Inbox className="w-4 h-4" /> },
    { label: t("officer.assignedComplaints") || "Grievances Queue", path: "/officer/grievances", icon: <Clock className="w-4 h-4" /> },
    { label: t("common.profile") || "My Profile & Duty", path: "/officer/profile", icon: <Shield className="w-4 h-4" /> },
  ];

  const currentNavItem = navItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path === "/officer/dashboard" && location.pathname === "/officer")
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Official Government Officer Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {t("officer.dashboardTitle") || "Field Officer"} • {user?.officerProfile?.department?.name || "General Administration"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs shrink-0">
            <span className="bg-blue-950 border border-blue-800 text-blue-300 px-2.5 py-1 rounded font-mono">
              Badge: {user?.officerProfile?.badgeNumber || "SETU-OFF-01"}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t("common.statusActive") || "Duty Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        {/* Mobile Navigation Bar & Drawer Trigger (<768px) */}
        <div className="md:hidden mb-4 flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Officer:
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 truncate">
              {currentNavItem?.label || "Dashboard"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition shadow-sm"
            aria-label="Open officer navigation menu"
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
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t("navigation.officerWorkbench") || "Officer Workbench"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close officer menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/officer/dashboard" && location.pathname === "/officer");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* SLA Policy Directive Box */}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs space-y-2 mt-auto">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t("home.metrics.slaTimeLabel") || "SLA Policy Directive"}</span>
                </p>
                <p className="text-amber-800/90 leading-relaxed text-[11px]">
                  {t("officer.dashboardSubtitle") ||
                    "Complaints marked High Priority must have action updates logged within 24 hours to prevent Level-1 automatic escalation."}
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
                {t("navigation.officerWorkbench") || "Officer Workbench"}
              </p>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/officer/dashboard" && location.pathname === "/officer");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                      isActive
                        ? "bg-slate-900 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span>{t("home.metrics.slaTimeLabel") || "SLA Policy Directive"}</span>
              </p>
              <p className="text-amber-800/90 leading-relaxed text-[11px]">
                {t("officer.dashboardSubtitle") ||
                  "Complaints marked High Priority must have action updates logged within 24 hours to prevent Level-1 automatic escalation."}
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

export default OfficerLayout;
