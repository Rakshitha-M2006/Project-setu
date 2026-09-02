import React, { useState, useEffect } from "react";
import { axiosClient } from "../api/axiosClient";
import { Department } from "../types";
import { Shield, Plus } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slaHours, setSlaHours] = useState(48);
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await axiosClient.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.post("/departments", {
        code,
        name,
        description,
        slaHoursDefault: Number(slaHours),
      });
      setCode("");
      setName("");
      setDescription("");
      setSlaHours(48);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 text-sm">Configure departments, SLA thresholds, and system governance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Department Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-purple-600" />
            <h2>Register Department</h2>
          </div>

          <form onSubmit={handleCreateDepartment} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MUNICIPAL_HEALTH"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Department of Public Sanitation"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Scope of work and responsibilities..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default SLA Window (Hours)</label>
              <input
                type="number"
                min={1}
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <span>Add Department</span>
            </button>
          </form>
        </div>

        {/* Existing Departments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Departments ({departments.length})</h2>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Loading department matrix...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {dept.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">SLA: {dept.slaHoursDefault}h</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{dept.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{dept.description || "No description provided."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
