import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import citizenApi from "../../api/citizenApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Alert } from "../../components/ui/Alert";
import { Gender } from "../../types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  Briefcase,
  Calendar,
} from "lucide-react";

export const CitizenProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [pincode, setPincode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await citizenApi.getProfile();
        if (response.success && response.data) {
          const u = response.data;
          setFullName(u.fullName || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");

          const p = u.citizenProfile || {};
          setGender(p.gender || "");
          setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "");
          setAddressLine1(p.addressLine1 || "");
          setAddressLine2(p.addressLine2 || "");
          setPincode(p.pincode || "");
          setOccupation(p.occupation || "");
          setEmergencyContact(p.emergencyContact || "");
        }
      } catch (err: any) {
        toast.error("Failed to load profile details.", "Error");
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Full name cannot be empty.");
      return;
    }

    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await citizenApi.updateProfile({
        fullName,
        phone,
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        addressLine1,
        addressLine2,
        pincode,
        occupation,
        emergencyContact,
      });

      if (response.success) {
        toast.success("Profile information updated successfully!", "Saved");
        await refreshUser();
      } else {
        setErrorMsg(response.message || "Failed to save profile changes.");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update profile.";
      setErrorMsg(message);
      toast.error(message, "Save Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {fullName ? fullName.charAt(0).toUpperCase() : "C"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{fullName || "Citizen"}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Aadhaar eKYC: <strong className="text-slate-900">Active</strong></span>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="danger" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* 2. Profile Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Personal & Demographic Information</CardTitle>
          <CardDescription>
            Keep your residential and contact details up-to-date for accurate location triage
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Registered Email Address"
                disabled
                value={email}
                helperText="Email is bound to your digital authentication token"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Contact Number"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Select
                label="Gender"
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" },
                  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
                ]}
                placeholder="Select Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                label="Postal PIN Code"
                placeholder="e.g. 110001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Residential Address"
                placeholder="House / Flat / Street Name"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />

              <Input
                label="Address Line 2 / Landmark"
                placeholder="Near Metro Station / Market"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Profession / Occupation"
                placeholder="e.g. Healthcare / Teacher / Trader"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
              />

              <Input
                label="Emergency Contact Phone"
                placeholder="Family / Alternate Number"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className="font-bold shadow-md px-6"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenProfilePage;
