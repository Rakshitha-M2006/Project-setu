import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 font-serif">403 • Access Restricted</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            You do not possess the necessary official government authorization or security clearance
            to access this jurisdictional area.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Switch Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
