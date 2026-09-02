import React, { useState, useEffect } from "react";
import { axiosClient } from "../api/axiosClient";
import { Grievance } from "../types";
import { PlusCircle, FileText, CheckCircle2, Clock, Send } from "lucide-react";

export const CitizenDashboard: React.FC = () => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");

  const fetchGrievances = async () => {
    try {
      const res = await axiosClient.get("/grievances");
      setGrievances(res.data.data);
    } catch (err) {
      console.error("Failed to fetch grievances", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await axiosClient.post("/grievances", {
        title,
        description,
        location,
        pincode,
      });

      const newGrv = res.data.data.grievance;
      setGrievances([newGrv, ...grievances]);
      setSuccessMsg(`Grievance submitted successfully! Tracking ID: ${newGrv.trackingNumber}`);
      setTitle("");
      setDescription("");
      setLocation("");
      setPincode("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit grievance");
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Citizen Grievance Portal</h1>
          <p className="text-slate-500 text-sm">Submit new complaints and track dynamic resolution SLA status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h2>Lodge New Grievance</h2>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sewage water leaking near main market road"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the issue, urgency, or safety hazards..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Ward</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Sector 4 / Ward 12"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="110001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-700 space-y-1">
              <p className="font-semibold">🤖 AI Auto-Triage Enabled:</p>
              <p>Your issue will be automatically classified for department routing, sentiment, and dynamic SLA deadline.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit to AI Triage</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Submitted Grievances List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Submitted Complaints</h2>
            <span className="text-xs text-slate-500 font-medium">{grievances.length} Total</span>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Loading your grievances...
            </div>
          ) : grievances.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">No grievances lodged yet</h3>
              <p className="text-xs text-slate-400">Use the form on the left to submit your first civic issue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grievances.map((grv) => (
                <div
                  key={grv.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {grv.trackingNumber}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(grv.priority)}`}>
                        {grv.priority}
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {grv.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{grv.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{grv.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center space-x-3">
                      <span>Dept: <strong className="text-slate-600">{grv.department?.name || "Auto-Triage"}</strong></span>
                      {grv.location && <span>Loc: {grv.location}</span>}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(grv.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
