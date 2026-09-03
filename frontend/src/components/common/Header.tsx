import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../ui/StatusBadge";
import {
  Landmark,
  LogOut,
  Menu,
  X,
  FileText,
  Home,
  Bell,
} from "lucide-react";

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "CITIZEN":
        return "/citizen";
      case "OFFICER":
        return "/officer";
      case "SENIOR_OFFICER":
        return "/senior-officer";
      case "ADMIN":
        return "/admin";
      default:
        return "/";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* 1. Indian National Tiranga subtle stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. Top Accessibility & Official Govt Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wider">भारत सरकार | GOVERNMENT OF INDIA</span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">Ministry of Electronics & Information Technology</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span className="hidden sm:inline bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/60 font-medium">
            SIH 2026
          </span>
          <span>Toll-Free: 1800-11-7388</span>
        </div>
      </div>

      {/* 3. Main Header Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-800 to-indigo-950 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-[1.02] transition">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-serif">
                  PROJECT SETU
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  AI-GOV
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Unified Citizen Grievance & Public Service Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 hover:text-blue-700 transition flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 hover:bg-blue-100 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Workbench Portal</span>
                </Link>

                <Link
                  to="/citizen/notifications"
                  className="p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition relative"
                  title="Notifications Center"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                <div className="h-5 w-px bg-slate-200" />

                {/* User Profile Pill */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.fullName}</p>
                    <div className="mt-1">
                      <StatusBadge status={user?.role} type="role" size="sm" />
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg transition"
                >
                  Official Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-sm transition active:scale-[0.98]"
                >
                  Citizen Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="px-3 py-2 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                </div>
                <StatusBadge status={user?.role} type="role" size="sm" />
              </div>

              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
              >
                Go to Dashboard
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold shadow-sm"
              >
                Citizen Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
