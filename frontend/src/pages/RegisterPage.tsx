import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { authApi } from "../api/authApi";
import { citizenApi } from "../api/citizenApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import {
  Landmark,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Building,
  Compass,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Gender } from "../types";

type RegistrationRole = "CITIZEN" | "OFFICER" | "SENIOR_OFFICER" | "ADMIN";

interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const roleParam = searchParams.get("role")?.toUpperCase();
  const initialRole: RegistrationRole =
    roleParam === "OFFICER" || roleParam === "SENIOR_OFFICER" || roleParam === "ADMIN"
      ? (roleParam as RegistrationRole)
      : "CITIZEN";

  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(initialRole);

  // Common form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [declaration, setDeclaration] = useState(false);

  // Citizen specific fields
  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [occupation, setOccupation] = useState("");

  // Officer specific fields
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState(
    initialRole === "OFFICER"
      ? "Assistant Engineer - Field Redressal"
      : initialRole === "SENIOR_OFFICER"
      ? "Chief Engineer & Department HOD"
      : initialRole === "ADMIN"
      ? "Platform Super Administrator"
      : ""
  );
  const [badgeNumber, setBadgeNumber] = useState("");
  const [jurisdictionWard, setJurisdictionWard] = useState("");

  // Departments list
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDepartments() {
      setIsLoadingDepts(true);
      try {
        const response = await citizenApi.getDepartments();
        if (response.success && response.data) {
          setDepartments(
            response.data.map((d: any) => ({
              id: d.id,
              name: d.name,
              code: d.code,
            }))
          );
          if (response.data.length > 0) {
            setDepartmentId((prev) => prev || response.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading departments for registration:", err);
      } finally {
        setIsLoadingDepts(false);
      }
    }

    fetchDepartments();
  }, []);

  useEffect(() => {
    const r = searchParams.get("role")?.toUpperCase();
    if (r === "CITIZEN" || r === "OFFICER" || r === "SENIOR_OFFICER" || r === "ADMIN") {
      handleRoleChange(r as RegistrationRole);
    }
  }, [searchParams]);

  const handleRoleChange = (role: RegistrationRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setDeclaration(false);

    if (role === "OFFICER" && !designation) {
      setDesignation("Assistant Engineer - Field Redressal");
    } else if (role === "SENIOR_OFFICER" && !designation) {
      setDesignation("Chief Engineer & Department HOD");
    } else if (role === "ADMIN" && !designation) {
      setDesignation("Platform Super Administrator");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Mandatory Fields Check
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !pincode.trim()) {
      setErrorMsg(t("validation.requiredField") || "Please fill in all mandatory fields.");
      return;
    }

    // Role-specific mandatory checks
    if (selectedRole === "OFFICER" || selectedRole === "SENIOR_OFFICER") {
      if (!departmentId) {
        setErrorMsg("Please select your government department.");
        return;
      }
      if (!designation.trim()) {
        setErrorMsg("Please enter your official designation.");
        return;
      }
    } else if (selectedRole === "ADMIN") {
      if (!designation.trim()) {
        setDesignation("Platform Super Administrator");
      }
    }

    // 2. Password Match Check
    if (password !== confirmPassword) {
      setErrorMsg(t("validation.passwordMismatch") || "Passwords do not match.");
      return;
    }

    // 3. Password Strength (Min 8 chars, at least 1 letter and 1 number)
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setErrorMsg("Password must contain at least one letter and one number (e.g. Password123).");
      return;
    }

    // 4. Mobile format validation (10 digits starting with 6-9)
    const cleanPhone = phone.trim().replace(/^\+91|^91/, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg(t("validation.invalidPhone") || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // 5. PIN code format (6 digits, cannot start with 0)
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setErrorMsg(t("validation.invalidPincode") || "Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    // 6. Undertaking Declaration
    if (!declaration) {
      setErrorMsg(
        selectedRole === "CITIZEN"
          ? (t("validation.acceptDeclaration") || "You must accept the citizen undertaking declaration to proceed.")
          : selectedRole === "ADMIN"
          ? "You must accept the administrative security and governance undertaking to proceed."
          : "You must accept the official code of conduct and statutory duty undertaking to proceed."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole === "CITIZEN") {
        // Citizen Registration Flow
        const response = await authApi.register({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          password,
          gender: (gender || "MALE") as Gender,
          dateOfBirth: dateOfBirth || "2000-01-01",
          addressLine1: addressLine1.trim() || "Residential Address",
          city: city.trim() || "District Center",
          state: state.trim() || "State",
          pincode: pincode.trim(),
          occupation: occupation.trim() || undefined,
        });

        if (response.success && response.data) {
          const { token, user } = response.data;
          login(token, user);
          toast.success(`${t("auth.welcomeBack") || "Welcome"}, ${user.fullName}!`, t("auth.authSuccess") || "Registration Successful");
          navigate("/citizen", { replace: true });
        } else {
          setErrorMsg(response.message || "Registration failed.");
        }
      } else {
        // Field Officer, Senior Government Officer, or Admin Registration Flow
        const response = await authApi.registerOfficer({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          password,
          role: selectedRole,
          departmentId: departmentId || undefined,
          designation: designation.trim() || (selectedRole === "ADMIN" ? "Platform Super Administrator" : "Official"),
          badgeNumber: badgeNumber.trim() || null,
          jurisdictionWard: jurisdictionWard.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          pincode: pincode.trim() || null,
        });

        if (response.success && response.data) {
          const { token, user } = response.data;
          login(token, user);

          const roleLabel =
            selectedRole === "ADMIN"
              ? "Super Administrator"
              : selectedRole === "SENIOR_OFFICER"
              ? "Senior Government Officer"
              : "Field Officer";
          toast.success(`${t("auth.welcomeBack") || "Welcome"}, ${user.fullName}!`, `${roleLabel} Registration Successful`);

          if (selectedRole === "ADMIN") {
            navigate("/admin", { replace: true });
          } else if (selectedRole === "SENIOR_OFFICER") {
            navigate("/senior-officer", { replace: true });
          } else {
            navigate("/officer", { replace: true });
          }
        } else {
          setErrorMsg(response.message || "Registration failed.");
        }
      }
    } catch (err: any) {
      const validationError = err.response?.data?.errors?.[0]?.message;
      const serverMessage = err.response?.data?.message;
      const message = validationError || serverMessage || err.message || t("errors.serverError") || "Registration failed. Please try again.";
      setErrorMsg(message);
      toast.error(message, t("common.error") || "Registration Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 text-amber-400 shadow-lg mb-1 ring-4 ring-blue-600/20">
            <Landmark className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
            {selectedRole === "CITIZEN" && (t("auth.registerTitle") || "Citizen Registration")}
            {selectedRole === "OFFICER" && "Field Officer Registration"}
            {selectedRole === "SENIOR_OFFICER" && "Government Officer Registration"}
            {selectedRole === "ADMIN" && "Super Administrator Registration"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {selectedRole === "CITIZEN" && (t("auth.registerSubtitle") || "Create your verified Citizen account on PROJECT SETU")}
            {selectedRole === "OFFICER" && "Register as an official Department Field Officer for on-ground inspections and grievance redressal"}
            {selectedRole === "SENIOR_OFFICER" && "Register as a Senior Department Executive / HOD for command oversight and SLA monitoring"}
            {selectedRole === "ADMIN" && "Register as a Platform Super Administrator for root governance, system auditing, and nodal oversight"}
          </p>
        </div>

        {/* 1. Interactive 4-Role Registration Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Choose Registration Category:
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Citizens & Official Personnel
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Citizen Tab */}
            <button
              type="button"
              onClick={() => handleRoleChange("CITIZEN")}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                selectedRole === "CITIZEN"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/70"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs bg-emerald-600 text-white">
                  <User className="w-4 h-4" />
                </div>
                {selectedRole === "CITIZEN" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">Public Citizen</p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 bg-emerald-100 text-emerald-800 border-emerald-200">
                  Citizen Services
                </span>
              </div>
            </button>

            {/* 2. Field Officer Tab */}
            <button
              type="button"
              onClick={() => handleRoleChange("OFFICER")}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                selectedRole === "OFFICER"
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/70"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs bg-blue-600 text-white">
                  <Briefcase className="w-4 h-4" />
                </div>
                {selectedRole === "OFFICER" && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 animate-in zoom-in-75 duration-150" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">Field Officer</p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 bg-blue-100 text-blue-800 border-blue-200">
                  Site Inspections
                </span>
              </div>
            </button>

            {/* 3. Government Officer / HOD Tab */}
            <button
              type="button"
              onClick={() => handleRoleChange("SENIOR_OFFICER")}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                selectedRole === "SENIOR_OFFICER"
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/70"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs bg-indigo-600 text-white">
                  <Layers className="w-4 h-4" />
                </div>
                {selectedRole === "SENIOR_OFFICER" && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 animate-in zoom-in-75 duration-150" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">Govt Officer (HOD)</p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 bg-indigo-100 text-indigo-800 border-indigo-200">
                  Department Nodal
                </span>
              </div>
            </button>

            {/* 4. Super Admin Tab */}
            <button
              type="button"
              onClick={() => handleRoleChange("ADMIN")}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                selectedRole === "ADMIN"
                  ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/70"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs bg-purple-700 text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                {selectedRole === "ADMIN" && (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 animate-in zoom-in-75 duration-150" />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">Super Admin</p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 bg-purple-100 text-purple-800 border-purple-200">
                  System Control
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Registration Form Card */}
        <Card className="border-slate-200 shadow-xl overflow-hidden">
          {/* Subtle Tiranga strip on card header */}
          <div className="h-1 w-full flex">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-[#FFFFFF]" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          <CardHeader className="pb-3 pt-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                {selectedRole === "CITIZEN" && "Public Citizen Portal Account"}
                {selectedRole === "OFFICER" && "Official Field Officer Account"}
                {selectedRole === "SENIOR_OFFICER" && "Executive Government Officer Account"}
                {selectedRole === "ADMIN" && "Super Administrator Account"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              {t("common.appName") || "PROJECT SETU"} • {t("common.govtOfIndia") || "GOVERNMENT OF INDIA"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Officer / Senior Officer / Admin Department & Designation Section */}
              {selectedRole !== "CITIZEN" && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    selectedRole === "ADMIN"
                      ? "bg-purple-50/60 border-purple-200/80"
                      : selectedRole === "SENIOR_OFFICER"
                      ? "bg-indigo-50/60 border-indigo-200/80"
                      : "bg-blue-50/60 border-blue-200/80"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    {selectedRole === "ADMIN" ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-950">Administrative Governance & Designation:</span>
                      </>
                    ) : selectedRole === "SENIOR_OFFICER" ? (
                      <>
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span className="text-indigo-950">Senior Executive Directorate & Jurisdiction:</span>
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-950">Official Department & Jurisdiction:</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800">
                        {selectedRole === "ADMIN" ? "Primary Department (Optional)" : "Government Department *"}
                      </label>
                      <select
                        required={selectedRole !== "ADMIN"}
                        disabled={isLoadingDepts}
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {selectedRole === "ADMIN" && (
                          <option value="">Platform-wide Administration (General Administration)</option>
                        )}
                        {selectedRole !== "ADMIN" && (
                          <option value="" disabled>
                            {isLoadingDepts ? "Loading departments catalog..." : "Select Department"}
                          </option>
                        )}
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label={
                        selectedRole === "ADMIN"
                          ? "Administrative Designation *"
                          : selectedRole === "SENIOR_OFFICER"
                          ? "Executive Designation *"
                          : "Official Designation *"
                      }
                      required
                      placeholder={
                        selectedRole === "ADMIN"
                          ? "e.g. Platform Super Administrator"
                          : selectedRole === "SENIOR_OFFICER"
                          ? "e.g. Chief Engineer / Department HOD"
                          : "e.g. Assistant Engineer / Field Inspector"
                      }
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Badge / Officer ID (Optional)"
                      placeholder={
                        selectedRole === "ADMIN"
                          ? "e.g. ADM-ROOT-001 (Auto-assigned if blank)"
                          : selectedRole === "SENIOR_OFFICER"
                          ? "e.g. HOD-ELC-005 (Auto-assigned if blank)"
                          : "e.g. WTR-OF-105 (Auto-assigned if blank)"
                      }
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                    />

                    <Input
                      label={
                        selectedRole === "ADMIN"
                          ? "Command Secretariat / Apex Office"
                          : selectedRole === "SENIOR_OFFICER"
                          ? "Command Office / Jurisdiction"
                          : "Assigned Ward / Jurisdiction"
                      }
                      placeholder={
                        selectedRole === "ADMIN"
                          ? "e.g. National Operations Command / Apex Level"
                          : selectedRole === "SENIOR_OFFICER"
                          ? "e.g. State Headquarters / District Center"
                          : "e.g. Ward 04 - West Zone / Sector 12"
                      }
                      value={jurisdictionWard}
                      onChange={(e) => setJurisdictionWard(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Full Name & Official Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("auth.fullName") || "Full Name *"}
                  required
                  placeholder={
                    selectedRole === "CITIZEN"
                      ? (t("auth.fullNamePlaceholder") || "Full Legal Name as per Aadhaar")
                      : "Official Full Name (e.g. Er. Rajiv Sharma)"
                  }
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label={selectedRole === "CITIZEN" ? (t("auth.email") || "Email Address *") : "Official Email Address *"}
                  type="email"
                  required
                  placeholder={
                    selectedRole === "CITIZEN"
                      ? (t("auth.emailPlaceholder") || "citizen@domain.gov.in")
                      : "officer.name@setu.gov.in"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Mobile Phone & (Gender or Jurisdiction details) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("auth.phone") || "Mobile Number *"}
                  type="tel"
                  required
                  placeholder={t("auth.phonePlaceholder") || "9876543210"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                />

                {selectedRole === "CITIZEN" ? (
                  <Select
                    label={t("auth.gender") || "Gender *"}
                    options={[
                      { value: "MALE", label: t("auth.genderMale") || "Male" },
                      { value: "FEMALE", label: t("auth.genderFemale") || "Female" },
                      { value: "OTHER", label: t("auth.genderOther") || "Other" },
                      { value: "PREFER_NOT_TO_SAY", label: t("auth.genderPreferNot") || "Prefer not to say" },
                    ]}
                    placeholder="Select Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                  />
                ) : (
                  <Input
                    label="Postal PIN Code *"
                    required
                    placeholder="e.g. 110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                  />
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("auth.passwordLabel") || "Password * (Min 8 chars, letters & numbers)"}
                  type="password"
                  required
                  placeholder={t("auth.passwordPlaceholder") || "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label={t("auth.confirmPassword") || "Confirm Password *"}
                  type="password"
                  required
                  placeholder={t("auth.confirmPasswordPlaceholder") || "••••••••"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Citizen specific Date of Birth & Pincode */}
              {selectedRole === "CITIZEN" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("auth.dob") || "Date of Birth"}
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  <Input
                    label={t("auth.pincode") || "Postal PIN Code *"}
                    required
                    placeholder={t("auth.pincodePlaceholder") || "e.g. 110001"}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                  />
                </div>
              )}

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={selectedRole === "CITIZEN" ? (t("auth.city") || "City / District") : "Headquarters District / City"}
                  placeholder={selectedRole === "CITIZEN" ? (t("auth.cityPlaceholder") || "District Name") : "e.g. New Delhi / Central District"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label={selectedRole === "CITIZEN" ? (t("auth.state") || "State / UT") : "State / Union Territory"}
                  placeholder={selectedRole === "CITIZEN" ? (t("auth.statePlaceholder") || "State Name") : "e.g. Delhi NCT / Maharashtra"}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  leftIcon={<Compass className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Citizen Address and Occupation */}
              {selectedRole === "CITIZEN" && (
                <>
                  <Input
                    label={t("auth.address") || "Residential Address"}
                    placeholder={t("auth.addressPlaceholder") || "House / Flat / Street Name"}
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />

                  <Input
                    label={t("auth.occupation") || "Occupation / Trade (Optional)"}
                    placeholder={t("auth.occupationPlaceholder") || "e.g. Farmer / Healthcare / Student"}
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </>
              )}

              {/* Declaration Checkbox */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="declaration" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                  {selectedRole === "CITIZEN" &&
                    (t("auth.declaration") ||
                      "I declare that all details provided are accurate and agree to the citizen terms of service.")}
                  {selectedRole === "OFFICER" &&
                    "I declare that I am an authorized Departmental Field Officer and undertake to uphold statutory public service delivery standards, on-ground inspections, and grievance redressal SLAs."}
                  {selectedRole === "SENIOR_OFFICER" &&
                    "I declare that I am an authorized Senior Executive / Department HOD and undertake to supervise grievance redressal, SLA governance, escalation reviews, and administrative duties."}
                  {selectedRole === "ADMIN" &&
                    "I declare that I am an authorized Super Administrator and undertake to manage platform governance, department taxonomies, and administrative security."}
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md text-sm mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {selectedRole === "CITIZEN" && (t("auth.createAccountButton") || "Create Citizen Account")}
                {selectedRole === "OFFICER" && "Register as Department Field Officer"}
                {selectedRole === "SENIOR_OFFICER" && "Register as Government Officer (HOD)"}
                {selectedRole === "ADMIN" && "Register as Super Administrator"}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <span>{t("auth.alreadyHaveAccount") || "Already have an official account?"}</span>
              <Link to="/login" className="font-bold text-blue-700 hover:text-blue-800 transition underline underline-offset-2">
                {t("common.signIn") || "Sign In"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
