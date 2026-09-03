import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Gender } from "../types";
import { Landmark, Mail, Lock, User, Phone, MapPin, ArrowRight } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [addressLine1, setAddressLine1] = useState("");
  const [pincode, setPincode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please agree to the Citizen Declarations & Terms of Service.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        fullName,
        email,
        password,
        phone: phone || null,
        gender: (gender as Gender) || null,
        addressLine1: addressLine1 || null,
        pincode: pincode || null,
        occupation: occupation || null,
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        login(token, user);
        toast.success(`Welcome to SETU, ${user.fullName}!`, "Account Registered");
        navigate("/citizen", { replace: true });
      } else {
        setErrorMsg(response.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Registration could not be completed. An account with this email or phone may already exist.";
      setErrorMsg(message);
      toast.error(message, "Registration Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
            Citizen Registration
          </h2>
          <p className="text-xs text-slate-500">
            Create your verified Citizen account on PROJECT SETU
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Citizen Enrollment Form</CardTitle>
            <CardDescription>
              All submissions are encrypted and routed under Government Data Protection Standards
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  label="Residential Address"
                  placeholder="House/Street/Locality"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />

                <Input
                  label="Occupation / Trade"
                  placeholder="e.g. Farmer / Student / Engineer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>

              {/* Citizen Declaration Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>
                    I declare that all details provided are accurate and I agree to the platform's{" "}
                    <a href="#" className="font-semibold text-blue-700 underline">
                      Terms of Service
                    </a>{" "}
                    and grievance submission guidelines.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Citizen Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-blue-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
