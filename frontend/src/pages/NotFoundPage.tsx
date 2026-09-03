import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { HelpCircle, Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 font-serif">404</h1>
          <h2 className="text-base font-bold text-slate-800">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The requested government portal resource or route does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Back to Safety (Home)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
