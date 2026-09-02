import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">PROJECT SETU (सेतु)</span>
          <span>•</span>
          <span>Smart India Hackathon 2026</span>
        </div>
        <p className="text-xs text-slate-500">
          AI-Powered Citizen Grievance Redressal & Dynamic SLA Escalation Platform.
        </p>
      </div>
    </footer>
  );
};
