import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { axiosClient } from "../api/axiosClient";
import { Grievance, GrievanceStatus } from "../types";
import { ShieldCheck, Filter } from "lucide-react";

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchGrievances = async () => {
    try {
      const url = selectedStatus ? `/grievances?status=${selectedStatus}` : "/grievances";
      const res = await axiosClient.get(url);
      setGrievances(res.data.data);
    } catch (err) {
      console.error("Failed to load officer grievances", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [selectedStatus]);

  const handleUpdateStatus = async (id: string, newStatus: GrievanceStatus) => {
    setUpdatingId(id);
    try {
      await axiosClient.patch(`/grievances/${id}/status`, {
        status: newStatus,
        remarks: `Updated by Officer ${user?.fullName}`,
      });
      fetchGrievances();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const criticalCount = grievances.filter((g) => g.priority === "CRITICAL").length;
  const inProgressCount = grievances.filter((g) => g.status === "IN_PROGRESS").length;
  const resolvedCount = grievances.filter((g) => g.status === "RESOLVED").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Officer Redressal Workbench</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Department: <strong className="text-slate-800">{user?.department?.name || "All Departments"}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="AI_TRIAGED">AI Triaged</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase">Active Queue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{grievances.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
          <p className="text-xs text-red-600 font-medium uppercase">Critical SLA Priority</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm">
          <p className="text-xs text-blue-600 font-medium uppercase">In Progress</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <p className="text-xs text-emerald-600 font-medium uppercase">Resolved</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Grievance Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Grievance Escalation Queue</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading queue...</div>
        ) : grievances.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No grievances matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Tracking No</th>
                  <th className="p-3.5">Title & Description</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-semibold text-blue-600">{g.trackingNumber}</td>
                    <td className="p-3.5 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{g.title}</p>
                      <p className="text-slate-500 text-[11px] truncate">{g.description}</p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          g.priority === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : g.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {g.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700 text-[11px]">
                        {g.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right space-x-1">
                      {g.status !== "IN_PROGRESS" && g.status !== "RESOLVED" && (
                        <button
                          disabled={updatingId === g.id}
                          onClick={() => handleUpdateStatus(g.id, "IN_PROGRESS")}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium text-[11px] transition"
                        >
                          Start Investigation
                        </button>
                      )}
                      {g.status !== "RESOLVED" && (
                        <button
                          disabled={updatingId === g.id}
                          onClick={() => handleUpdateStatus(g.id, "RESOLVED")}
                          className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded font-medium text-[11px] transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
