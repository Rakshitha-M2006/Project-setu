import React from "react";
import { Link } from "react-router-dom";
import { Landmark, Shield, PhoneCall, Globe } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* 1. Emergency Helpline Strip */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              National Citizen Emergency & Grievance Helplines:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 font-mono text-[11px]">
            <span>
              National Emergency: <strong className="text-white">112</strong>
            </span>
            <span>
              Electricity Helplines: <strong className="text-white">1912</strong>
            </span>
            <span>
              Water Supply Complaints: <strong className="text-white">1916</strong>
            </span>
            <span>
              Anti-Corruption Bureau: <strong className="text-white">1064</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Portal Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center text-amber-400">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white tracking-tight font-serif">
                PROJECT SETU
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI-driven citizen grievance redressal and public service delivery ecosystem built for the
              Smart India Hackathon 2026. Empowering citizens through real-time NLP classification, strict SLA
              enforcement, and automated escalation pipelines.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Certified SIH 2026 GovTech Architecture</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Citizen Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Lodge Public Grievance
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Track Grievance Status
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Apply for Government Services
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Submit Resolution Feedback
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Download Application Certificates
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Participating Ministries */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Governing Departments</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Department of Drinking Water & Sanitation</li>
              <li>Ministry of Power & Energy</li>
              <li>Public Works Department (PWD - Roads)</li>
              <li>Department of Health & Family Welfare</li>
              <li>Revenue, Land Records & Survey</li>
              <li>Women & Child Development (WCD)</li>
            </ul>
          </div>

          {/* Col 4: Platform Security & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security & Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compliant with Guidelines for Indian Government Websites (GIGW) & ISO 27001 standard data protection
              protocols. Zero plaintext credentials.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Node.js • Prisma • PostgreSQL • FastAPI</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bottom Copyright & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PROJECT SETU. Designed and Developed for Smart India Hackathon 2026.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#" className="hover:text-slate-300 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-300 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-300 transition">
              Accessibility Statement
            </a>
            <a href="#" className="hover:text-slate-300 transition">
              Hyperlinking Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
