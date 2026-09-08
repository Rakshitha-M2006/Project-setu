import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ToastContainer from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  LayoutDashboard,
  FilePlus,
  ListOrdered,
  Briefcase,
  Layers,
  FileCheck2,
  User,
  Bell,
  HelpCircle,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const CitizenLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { label: t("navigation.dashboard") || "Dashboard", path: "/citizen/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: t("navigation.grievances") || "Public Grievances", path: "/citizen/grievances", icon: <ListOrdered className="w-4 h-4" /> },
    { label: t("navigation.newLodgeIssue") || "Lodge New Issue", path: "/citizen/grievances/new", icon: <FilePlus className="w-4 h-4" /> },
    { label: t("navigation.schemes") || "Government Schemes", path: "/citizen/schemes", icon: <Layers className="w-4 h-4 text-emerald-500" /> },
    { label: t("navigation.services") || "Government Services", path: "/citizen/services", icon: <Briefcase className="w-4 h-4" /> },
    { label: t("navigation.applications") || "My Applications", path: "/citizen/applications", icon: <FileCheck2 className="w-4 h-4" /> },
    { label: t("navigation.notifications") || "Notification Center", path: "/citizen/notifications", icon: <Bell className="w-4 h-4" /> },
    { label: t("navigation.profile") || "Citizen Profile", path: "/citizen/profile", icon: <User className="w-4 h-4" /> },
  ];

  const currentNavItem = navItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path === "/citizen/dashboard" && location.pathname === "/citizen")
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Sub-header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("dashboard.activeCitizenPortal") || "National Citizen Portal"}:
            </span>
            <span className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("common.verifiedCitizen") || "Verified Citizen"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 shrink-0">
            <span>{t("common.ekycLinked") || "Aadhaar eKYC: Linked"}</span>
            <span>•</span>
            <span>{t("common.emergencySos") || "Emergency SOS: 112"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        {/* Mobile Navigation Bar & Drawer Trigger (<768px) */}
        <div className="md:hidden mb-4 flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Menu:
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 truncate">
              {currentNavItem?.label || "Dashboard"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 transition shadow-sm"
            aria-label="Open navigation menu"
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
                  <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t("navigation.dashboard") || "Dashboard"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/citizen/dashboard" && location.pathname === "/citizen");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                        isActive
                          ? "bg-blue-700 text-white shadow-sm font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Help & Support Card inside Mobile Drawer */}
              <div className="bg-blue-900 text-white rounded-xl p-4 text-xs space-y-2 mt-auto">
                <p className="font-bold flex items-center gap-1.5 text-amber-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>{t("common.help") || "Help & Support"}</span>
                </p>
                <p className="text-blue-200 leading-relaxed text-[11px]">
                  {t("dashboard.activeCitizenPortal") || "National Citizen Service & Grievance Portal"}
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
                {t("navigation.dashboard") || "Dashboard"}
              </p>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/citizen/dashboard" && location.pathname === "/citizen");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                      isActive
                        ? "bg-blue-700 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="bg-blue-900 text-white rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>{t("common.help") || "Help & Support"}</span>
              </p>
              <p className="text-blue-200 leading-relaxed text-[11px]">
                {t("dashboard.activeCitizenPortal") || "National Citizen Service & Grievance Portal"}
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

export default CitizenLayout;
