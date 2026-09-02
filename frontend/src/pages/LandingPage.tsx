import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Cpu, Clock, Building2, ArrowRight, CheckCircle2 } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Smart India Hackathon 2026</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
          Transforming Public Grievance Redressal with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Intelligent AI
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          PROJECT SETU bridges citizens and government administration with real-time NLP classification, automatic department routing, and dynamic SLA escalation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Lodge a Grievance</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-sm transition"
          >
            Officer / Admin Portal
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">AI-Powered NLP Triage</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Extracts keywords, detects urgency, and automatically routes grievances to the responsible municipal department within milliseconds.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Dynamic SLA & Escalation</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Assigns tailored resolution windows (6h–72h) and automatically escalates stalled cases to Senior Officers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">End-to-End Audit & RBAC</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transparent tracking for citizens with immutable status timeline logging and granular role-based permissions.
          </p>
        </div>
      </section>

      {/* Department Network Preview */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Integrated Department Network</h2>
        </div>
        <p className="text-slate-300 text-sm max-w-2xl">
          Unified pipeline supporting Drinking Water & Sanitation, Power & Electricity, Public Works (PWD), Municipal Waste & Health, and Revenue administration.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
          {["Water Supply & Leakage", "Electricity & Transformers", "PWD Roads & Potholes", "Public Health & Waste", "Land Revenue & Mutation", "Women & Child Support"].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
