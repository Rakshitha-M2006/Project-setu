import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import officerApi, { OfficerProfileData } from "../../api/officerApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Shield,
  Phone,
  Mail,
  Award,
  Building,
  MapPin,
  RefreshCw,
  Save,
} from "lucide-react";

export const OfficerProfilePage: React.FC = () => {
  const toast = useToast();

  const [profile, setProfile] = useState<OfficerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Edit fields
  const [phone, setPhone] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [jurisdictionWard, setJurisdictionWard] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await officerApi.getProfile();
      if (response.success && response.data) {
        const p = response.data;
        setProfile(p);
        setPhone(p.user.phone || "");
        setDesignation(p.designation);
        setJurisdictionWard(p.jurisdictionWard || "");
        setIsAvailable(p.isAvailable);
      } else {
        toast.error("Failed to load officer profile.", "Error");
      }
    } catch {
      toast.error("Network error loading officer profile.", "Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await officerApi.updateProfile({
        phone: phone.trim() || undefined,
        designation: designation.trim() || undefined,
        jurisdictionWard: jurisdictionWard.trim() || undefined,
        isAvailable,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        toast.success("Officer profile and duty status saved successfully.", "Profile Updated");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.", "Save Error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading officer profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Officer Profile & Duty Credentials
          </h1>
          <p className="text-xs text-slate-500">
            Official government field officer registry and jurisdictional settings
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadProfile}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {/* 2. Official Badge Credential Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/50 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                {profile?.badgeNumber || "BADGE PENDING"}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                VERIFIED OFFICER
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{profile?.user.fullName}</h2>
            <p className="text-xs text-slate-300">
              {profile?.designation} • {profile?.department.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:border-l sm:border-slate-800 sm:pl-6 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Cases
            </span>
            <span className="text-2xl font-mono font-black text-amber-400">
              {profile?.activeGrievanceCount || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Resolved Cases
            </span>
            <span className="text-2xl font-mono font-black text-emerald-400">
              {profile?.resolvedGrievanceCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Profile Information & Duty Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Officer Information & Jurisdictional Settings</CardTitle>
            <CardDescription className="text-xs">
              Manage your availability status, official phone number, and municipal ward coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Duty Availability Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900">Duty Availability Status</p>
                <p className="text-xs text-slate-500">
                  When enabled, new AI-routed department grievances may be assigned to your queue
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Designation / Title"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                leftIcon={<Award className="w-4 h-4" />}
              />

              <Input
                label="Jurisdictional Ward / Sector"
                placeholder="e.g. Ward 12, South District"
                value={jurisdictionWard}
                onChange={(e) => setJurisdictionWard(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Contact Phone"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Government Email (Fixed)"
                disabled
                value={profile?.user.email || ""}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            {/* Department Master Specs */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Building className="w-4 h-4 text-blue-700" />
                <span>Department Policy Standards</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Department Name</span>
                  <span className="font-semibold">{profile?.department.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Department Code</span>
                  <span className="font-mono font-bold text-blue-700">{profile?.department.code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Standard Resolution SLA</span>
                  <span className="font-bold text-emerald-700">{profile?.department.defaultSlaHours || 48} Hours</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className="font-bold px-6 shadow-md"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default OfficerProfilePage;
