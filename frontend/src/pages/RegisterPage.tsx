import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { authApi } from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Landmark, User, Mail, Phone, Lock, MapPin, ShieldCheck, ArrowRight, Building, Compass } from "lucide-react";
import { Gender } from "../types";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [declaration, setDeclaration] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Mandatory Fields Check
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !pincode.trim()) {
      setErrorMsg(t("validation.requiredField") || "Please fill in all mandatory fields.");
      return;
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

    // 6. Citizen Declaration
    if (!declaration) {
      setErrorMsg(t("validation.acceptDeclaration") || "You must accept the declaration undertaking to proceed.");
      return;
    }

    setIsLoading(true);
    try {
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-amber-400 shadow-md mb-2">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
            {t("auth.registerTitle") || "Citizen Registration"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t("auth.registerSubtitle") || "Create your verified Citizen account on PROJECT SETU"}
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base">{t("common.register") || "Register"}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {t("common.appName") || "PROJECT SETU"} • {t("common.govtOfIndia") || "GOVERNMENT OF INDIA"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("auth.fullName") || "Full Name *"}
                  required
                  placeholder={t("auth.fullNamePlaceholder") || "Full Legal Name as per Aadhaar"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label={t("auth.email") || "Email Address *"}
                  type="email"
                  required
                  placeholder={t("auth.emailPlaceholder") || "citizen@domain.gov.in"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              {/* Mobile Phone & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("auth.phone") || "Mobile Number *"}
                  type="tel"
                  required
                  placeholder={t("auth.phonePlaceholder") || "9876543210"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
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
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label={t("auth.confirmPassword") || "Confirm Password *"}
                  type="password"
                  required
                  placeholder={t("auth.confirmPasswordPlaceholder") || "••••••••"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              {/* Date of Birth & Pincode */}
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
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("auth.city") || "City / District"}
                  placeholder={t("auth.cityPlaceholder") || "District Name"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                />
                <Input
                  label={t("auth.state") || "State / UT"}
                  placeholder={t("auth.statePlaceholder") || "State Name"}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  leftIcon={<Compass className="w-4 h-4" />}
                />
              </div>

              {/* Address */}
              <Input
                label={t("auth.address") || "Residential Address"}
                placeholder={t("auth.addressPlaceholder") || "House / Flat / Street Name"}
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />

              {/* Occupation */}
              <Input
                label={t("auth.occupation") || "Occupation / Trade (Optional)"}
                placeholder={t("auth.occupationPlaceholder") || "e.g. Farmer / Healthcare / Student"}
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />

              {/* Declaration Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="declaration" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                  {t("auth.declaration") || "I declare that all details provided are accurate and agree to the Terms of Service."}
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
                {t("auth.createAccountButton") || "Create Citizen Account"}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>{t("auth.alreadyHaveAccount") || "Already have an account?"} </span>
              <Link to="/login" className="font-bold text-blue-700 hover:text-blue-800 transition">
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
