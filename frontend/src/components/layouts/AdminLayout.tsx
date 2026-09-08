import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ToastContainer from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  ShieldAlert,
  Building,
  Users2,
  Activity,
  History,
  Settings,
  Cpu,
  Flame,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { label: t("navigation.adminDashboard") || "Admin Dashboard", path: "/admin", icon: <ShieldAlert className="w-4 h-4" /> },
    { label: t("navigation.anomalies") || "Anomaly Surveillance", path: "/admin/anomalies", icon: <Flame className="w-4 h-4 text-rose-400" /> },
    { label: t("navigation.userManagement") || "User Management", path: "/admin/users", icon: <Users2 className="w-4 h-4" /> },
    { label: t("navigation.officers") || "Officers Directory", path: "/admin/officers", icon: <Users2 className="w-4 h-4" /> },
    { label: t("navigation.departments") || "Departments Master", path: "/admin/departments", icon: <Building className="w-4 h-4" /> },
    { label: t("navigation.grievances") || "Grievances Master", path: "/admin/grievances", icon: <Building className="w-4 h-4" /> },
    { label: t("navigation.services") || "Public Services", path: "/admin/services", icon: <Building className="w-4 h-4" /> },
    { label: t("navigation.analytics") || "Analytics & Reports", path: "/admin/analytics", icon: <Activity className="w-4 h-4" /> },
    { label: t("navigation.auditLogs") || "Forensic Audit Logs", path: "/admin/audit-logs", icon: <History className="w-4 h-4" /> },
    { label: t("navigation.aiMonitoring") || "AI Pipeline Monitoring", path: "/admin/ai-monitoring", icon: <Cpu className="w-4 h-4" /> },
  ];

  const currentNavItem = navItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path === "/admin" && location.pathname === "/admin/dashboard")
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Super Administrator Header Bar */}
      <div className="bg-purple-950 text-white border-b border-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-none truncate">{user?.fullName}</p>
              <p className="text-[11px] text-purple-300 mt-0.5 truncate">
                {t("navigation.adminDashboard") || "Super Administrator"} • Central IT & Governance Cell
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="bg-purple-900 border border-purple-800 text-purple-200 px-2.5 py-1 rounded font-mono">
              Root Level Admin
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        {/* Mobile Navigation Bar & Drawer Trigger (<768px) */}
        <div className="md:hidden mb-4 flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Admin:
            </span>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 truncate">
              {currentNavItem?.label || "Dashboard"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-800 text-white hover:bg-purple-900 active:bg-purple-950 transition shadow-sm"
            aria-label="Open admin navigation menu"
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
                  <div className="w-7 h-7 rounded-lg bg-purple-800 text-white flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t("navigation.adminDashboard") || "Administration"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close admin menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/admin" && location.pathname === "/admin/dashboard");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                        isActive
                          ? "bg-purple-800 text-white shadow-sm font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Security Governance Box */}
              <div className="bg-purple-50 border border-purple-100 text-purple-900 rounded-xl p-4 text-xs space-y-2 mt-auto">
                <p className="font-bold flex items-center gap-1.5 text-purple-800">
                  <Settings className="w-4 h-4" />
                  <span>Security Governance</span>
                </p>
                <p className="text-purple-800/90 leading-relaxed text-[11px]">
                  {t("admin.auditLogsTitle") || "All administrative changes, role grants, and master catalog edits are written to immutable audit logs."}
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
                {t("navigation.adminDashboard") || "Administration"}
              </p>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/admin" && location.pathname === "/admin/dashboard");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition",
                      isActive
                        ? "bg-purple-800 text-white shadow-sm font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="bg-purple-50 border border-purple-100 text-purple-900 rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-purple-800">
                <Settings className="w-4 h-4" />
                <span>Security Governance</span>
              </p>
              <p className="text-purple-800/90 leading-relaxed text-[11px]">
                {t("admin.auditLogsTitle") || "All administrative changes, role grants, and master catalog edits are written to immutable audit logs."}
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

export default AdminLayout;
