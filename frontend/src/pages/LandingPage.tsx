import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  Award,
  Layers,
  Sparkles,
  Bot,
  Building,
  } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Platform Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-sm shadow-inner">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{t("home.hero.badge")}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-serif">
            {t("home.hero.title")}
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-300 leading-relaxed font-normal">
            {t("home.hero.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 px-8">
                {t("home.hero.lodgeBtn")}
              </Button>
            </Link>
            <Link to="/citizen/schemes">
              <Button size="lg" variant="outline" className="bg-emerald-800/60 border-emerald-500/40 text-emerald-200 hover:bg-emerald-700/80 font-semibold px-6 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>{t("home.hero.exploreSchemesBtn")}</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 font-semibold px-6">
                {t("home.hero.loginBtn")}
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{t("home.metrics.triageAccuracy")}</p>
              <p className="text-xs text-slate-400 mt-1">{t("home.metrics.triageAccuracyLabel")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">{t("home.metrics.slaTime")}</p>
              <p className="text-xs text-slate-400 mt-1">{t("home.metrics.slaTimeLabel")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{t("home.metrics.autoEscalation")}</p>
              <p className="text-xs text-slate-400 mt-1">{t("home.metrics.autoEscalationLabel")}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">{t("home.metrics.auditTrail")}</p>
              <p className="text-xs text-slate-400 mt-1">{t("home.metrics.auditTrailLabel")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How SETU Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest">{t("home.workflow.tagline")}</h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("home.workflow.title")}
          </h3>
          <p className="text-sm text-slate-500">
            {t("home.workflow.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="border-slate-200 relative group hover:border-blue-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg font-mono">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-base">{t("home.workflow.step1Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("home.workflow.step1Desc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 relative group hover:border-purple-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg font-mono">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-base">{t("home.workflow.step2Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("home.workflow.step2Desc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 relative group hover:border-amber-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg font-mono">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-base">{t("home.workflow.step3Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("home.workflow.step3Desc")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 relative group hover:border-emerald-300 transition shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg font-mono">
                04
              </div>
              <h4 className="font-bold text-slate-900 text-base">{t("home.workflow.step4Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("home.workflow.step4Desc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest">{t("home.features.tagline")}</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("home.features.title")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t("home.features.feature1Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t("home.features.feature1Desc")}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t("home.features.feature2Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t("home.features.feature2Desc")}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t("home.features.feature3Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t("home.features.feature3Desc")}</p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t("home.features.feature4Title")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t("home.features.feature4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black">{t("home.hero.title")}</h3>
          <p className="text-xs sm:text-sm text-blue-200 max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="md" className="bg-white text-blue-950 hover:bg-blue-50 font-bold px-6 shadow-md">
                {t("common.register")}
              </Button>
            </Link>
            <Link to="/citizen/services">
              <Button size="md" variant="outline" className="border-blue-400/40 text-white hover:bg-blue-800 font-semibold px-6">
                {t("navigation.services")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
