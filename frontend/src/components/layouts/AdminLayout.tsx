import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ToastContainer from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldAlert,
  Building,
  Users2,
  Activity,
  History,
  Settings,
  Cpu,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Admin Dashboard", path: "/admin", icon: <ShieldAlert className="w-4 h-4" /> },
    { label: "Departments Master", path: "/admin/departments", icon: <Building className="w-4 h-4" /> },
    { label: "User Management", path: "/admin/users", icon: <Users2 className="w-4 h-4" /> },
    { label: "AI Pipeline Engine", path: "/admin/ai-engine", icon: <Cpu className="w-4 h-4" /> },
    { label: "System Audit Logs", path: "/admin/audit-logs", icon: <History className="w-4 h-4" /> },
    { label: "System Health & Metrics", path: "/admin/system-health", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Super Administrator Header Bar */}
      <div className="bg-purple-950 text-white border-b border-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">{user?.fullName}</p>
              <p className="text-[11px] text-purple-300 mt-0.5">
                Super Administrator • Central IT & Governance Cell
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="bg-purple-900 border border-purple-800 text-purple-200 px-2.5 py-1 rounded font-mono">
              Root Level Admin
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
                Administration
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
                        ? "bg-purple-800 text-white shadow-sm"
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
                All administrative changes, role grants, and master catalog edits are written to immutable audit logs.
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

export default AdminLayout;
