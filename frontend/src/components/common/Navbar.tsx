import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, LogOut, LayoutDashboard, PlusCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
      case "SENIOR_OFFICER":
        return "/officer";
      case "ADMIN":
        return "/admin";
      default:
        return "/";
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200">
                PROJECT SETU
              </span>
              <span className="block text-[10px] tracking-wider text-slate-400 font-medium uppercase">
                AI-Powered Government Services & Grievance Management Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {user.role === "CITIZEN" && (
                  <Link
                    to="/citizen"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>New Grievance</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white leading-tight">{user.fullName}</p>
                    <p className="text-[11px] text-blue-400 uppercase font-medium">{user.role.replace("_", " ")}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
