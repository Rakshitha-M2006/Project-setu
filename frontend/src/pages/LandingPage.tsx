import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Award } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* SIH 2026 Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-sm shadow-inner">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Smart India Hackathon 2026 • AI-GovTech Flagship</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-serif">
            Bridging Citizens & Governance through{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              Intelligent AI
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-300 leading-relaxed font-normal">
            PROJECT SETU is an AI-powered grievance redressal and public service platform.
            Automating complaint triage, enforcing strict SLA timelines, and providing 100% transparent tracking
            for every citizen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 px-8">
                Lodge Grievance Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 font-semibold px-6">
                Official Department Login
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">98.4%</p>
              <p className="text-xs text-slate-400 mt-1">AI Triage Accuracy</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">&lt; 6 Hrs</p>
              <p className="text-xs text-slate-400 mt-1">Critical SLA Response</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">3-Tier</p>
              <p className="text-xs text-slate-400 mt-1">Auto Escalation</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">100%</p>
              <p className="text-xs text-slate-400 mt-1">Immutable Audit Trail</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How the SETU AI Engine Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest">End-to-End Workflow</h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How SETU Transforms Grievance Redressal
          </h3>
          <p className="text-sm text-slate-500">
            From submission to resolution, every step is automated, timed, and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <Card className="border-slate-200 relative group hover:border-blue-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg font-mono">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-base">Citizen Lodges Issue</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe the problem in plain English or local language with optional photo evidence.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-slate-200 relative group hover:border-purple-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg font-mono">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-base">AI NLP Auto-Triage</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Python NLP microservice evaluates urgency, assigns department, and sets strict SLA deadlines.
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-slate-200 relative group hover:border-amber-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-lg font-mono">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-base">Field Officer Action</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ward officers receive assigned tasks with SLA countdowns. Overdue cases trigger auto-escalation.
              </p>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="border-slate-200 relative group hover:border-emerald-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg font-mono">
                04
              </div>
              <h4 className="font-bold text-slate-900 text-base">Redressal & Feedback</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Citizen receives resolution evidence and provides 1-5 star feedback with satisfaction ratings.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Governed Departments Directory */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest">Public Administration</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Integrated Government Departments
            </h3>
            <p className="text-sm text-slate-600">
              Seamlessly connect with jurisdictional authorities across key civic utilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                💧
              </div>
              <h4 className="font-bold text-slate-900 text-base">Department of Water Supply</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Water contamination, pipeline bursts, new connections, low water pressure, and tanker delivery.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ⚡
              </div>
              <h4 className="font-bold text-slate-900 text-base">Electricity & Power Utility</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Power outages, transformer failures, damaged electric poles, faulty smart meters, and billing issues.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                🛣️
              </div>
              <h4 className="font-bold text-slate-900 text-base">Public Works (PWD - Roads)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Road potholes, broken footpaths, clogged stormwater drains, illegal roadblocks, and streetlights.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                🏥
              </div>
              <h4 className="font-bold text-slate-900 text-base">Health & Family Welfare</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hospital hygiene, emergency doctor unavailability, immunization drives, and medical grievances.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                📜
              </div>
              <h4 className="font-bold text-slate-900 text-base">Revenue & Land Administration</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Land records mutation, caste/income certificates, encumbrance verification, and revenue appeals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                👶
              </div>
              <h4 className="font-bold text-slate-900 text-base">Women & Child Development</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anganwadi services, nutritional supplementary support, maternity benefit schemes, and child welfare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Official Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to experience transparent digital governance?
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              Create your citizen profile in under 2 minutes. Track grievances live with automated SMS/email alerts.
            </p>
          </div>

          <div className="shrink-0 flex gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 shadow-lg">
                Register as Citizen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
