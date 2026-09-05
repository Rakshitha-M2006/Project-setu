import React from "react";
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
} from "lucide-react";
import { cn } from "../../utils/cn";

export const OfficerLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { label: t("officer.dashboardTitle") || "Officer Dashboard", path: "/officer/dashboard", icon: <Inbox className="w-4 h-4" /> },
    { label: t("officer.assignedComplaints") || "Grievances Queue", path: "/officer/grievances", icon: <Clock className="w-4 h-4" /> },
    { label: t("common.profile") || "My Profile & Duty", path: "/officer/profile", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Official Government Officer Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t("officer.dashboardTitle") || "Field Officer"} • {user?.officerProfile?.department?.name || "General Administration"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
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

export default OfficerLayout;
