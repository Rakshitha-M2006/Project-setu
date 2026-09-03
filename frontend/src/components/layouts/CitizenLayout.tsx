import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import ToastContainer from "../ui/Toast";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FilePlus,
  ListOrdered,
  Briefcase,
  FileCheck2,
  User,
  Bell,
  HelpCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";

export const CitizenLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/citizen/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "My Grievances", path: "/citizen/grievances", icon: <ListOrdered className="w-4 h-4" /> },
    { label: "Lodge New Issue", path: "/citizen/grievances/new", icon: <FilePlus className="w-4 h-4" /> },
    { label: "Apply Services", path: "/citizen/services", icon: <Briefcase className="w-4 h-4" /> },
    { label: "My Applications", path: "/citizen/applications", icon: <FileCheck2 className="w-4 h-4" /> },
    { label: "Notifications", path: "/citizen/notifications", icon: <Bell className="w-4 h-4" /> },
    { label: "Citizen Profile", path: "/citizen/profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      <Header />

      {/* Sub-header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citizen Portal:</span>
            <span className="text-sm font-bold text-slate-900">{user?.fullName}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
              Verified Citizen
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Aadhaar eKYC: <strong className="text-emerald-600">Linked</strong></span>
            <span>•</span>
            <span>Emergency SOS: <strong>112</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-100">
                Citizen Menu
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
                <span>Need Assistance?</span>
              </p>
              <p className="text-blue-200 leading-relaxed text-[11px]">
                Our AI grievance routing system prioritizes urgent complaints within 6 hours.
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

export default CitizenLayout;
