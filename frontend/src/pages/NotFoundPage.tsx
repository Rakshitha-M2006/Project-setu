import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            ERROR 404
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("errors.notFound") || "Page Not Found"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t("errors.notFound") || "The requested government page or record does not exist or has been relocated."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-xs" leftIcon={<Home className="w-4 h-4" />}>
              {t("common.home") || "Return Home"}
            </Button>
          </Link>
          <Link to="/citizen" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t("common.workbench") || "Citizen Workbench"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
