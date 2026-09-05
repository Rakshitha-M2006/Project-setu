import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { Button } from "../components/ui/Button";

export const UnauthorizedPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            ACCESS DENIED • 403
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("errors.unauthorized") || "Restricted Government Portal"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t("errors.unauthorized") || "You do not have the required statutory authority or credentials to access this administrative section."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-xs" leftIcon={<LogIn className="w-4 h-4" />}>
              {t("common.signIn") || "Sign In with Credentials"}
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-xs" leftIcon={<Home className="w-4 h-4" />}>
              {t("common.home") || "Return to Home"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
