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
import { Landmark, Mail, Lock, User, Phone, MapPin, Calendar, Building, Map, ArrowRight } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  // Compulsory Citizen Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Optional Fields
  const [occupation, setOccupation] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    setErrorMsg(null);

    // 1. Full Name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.fullName = "Full name is required.";
    } else if (trimmedName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    // 2. Email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address format.";
    }

    // 3. Mobile Number
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      errors.phone = "Mobile number is required.";
    } else if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(trimmedPhone)) {
      errors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    // 4. Password
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      errors.password = "Password must contain both letters and numbers.";
    }

    // 5. Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    // 6. Date of Birth
    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const dobDate = new Date(dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        errors.dateOfBirth = "Please enter a valid date of birth.";
      } else if (dobDate > new Date()) {
        errors.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }

    // 7. Gender
    if (!gender) {
      errors.gender = "Gender is required.";
    }

    // 8. Address Line 1
    const trimmedAddress = addressLine1.trim();
    if (!trimmedAddress) {
      errors.addressLine1 = "Residential address is required.";
    } else if (trimmedAddress.length < 3) {
      errors.addressLine1 = "Address must be at least 3 characters.";
    }

    // 9. City
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      errors.city = "City is required.";
    } else if (trimmedCity.length < 2) {
      errors.city = "City must be at least 2 characters.";
    }

    // 10. State
    const trimmedState = state.trim();
    if (!trimmedState) {
      errors.state = "State is required.";
    } else if (trimmedState.length < 2) {
      errors.state = "State must be at least 2 characters.";
    }

    // 11. Pincode
    const trimmedPincode = pincode.trim();
    if (!trimmedPincode) {
      errors.pincode = "Pincode is required.";
    } else if (!/^[1-9][0-9]{5}$/.test(trimmedPincode)) {
      errors.pincode = "Please enter a valid 6-digit Indian PIN code.";
    }

    // Terms
    if (!agreeTerms) {
      errors.agreeTerms = "You must agree to the declarations and Terms of Service.";
    }

    setFieldErrors(errors);
    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      setErrorMsg("Please fill in all compulsory fields marked with * correctly.");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        dateOfBirth,
        gender: gender as Gender,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        occupation: occupation.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        login(token, user);
        toast.success(`Welcome to PROJECT SETU, ${user.fullName}!`, "Citizen Account Created");
        navigate("/citizen", { replace: true });
      } else {
        setErrorMsg(response.message || "Registration could not be completed.");
      }
    } catch (err: any) {
      if (!err.response) {
        const netErr = "Unable to connect to the server. Please check your connection and try again.";
        setErrorMsg(netErr);
        toast.error(netErr, "Connection Error");
      } else if (err.response.status === 409) {
        const conflictMsg = err.response?.data?.message || "An account with this email or mobile number already exists.";
        setErrorMsg(conflictMsg);
        toast.error(conflictMsg, "Registration Conflict");
      } else {
        const message = err.response?.data?.message || "Registration failed. Please verify your details.";
        setErrorMsg(message);
        toast.error(message, "Registration Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
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
            <CardTitle className="text-base">Citizen Enrollment Portal</CardTitle>
            <CardDescription>
              Fields marked with <span className="text-rose-600 font-bold">*</span> are compulsory. Data is protected under Government Standards.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  requiredMarker
                  placeholder="e.g. Ramesh Chandra"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  leftIcon={<User className="w-4 h-4" />}
                  error={fieldErrors.fullName}
                  autoComplete="name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  requiredMarker
                  placeholder="citizen@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={fieldErrors.email}
                  autoComplete="email"
                />
              </div>

              {/* Row 2: Mobile Number & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number"
                  type="tel"
                  required
                  requiredMarker
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError("phone");
                  }}
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={fieldErrors.phone}
                  autoComplete="tel"
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  requiredMarker
                  value={dateOfBirth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    clearFieldError("dateOfBirth");
                  }}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  error={fieldErrors.dateOfBirth}
                />
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  required
                  requiredMarker
                  placeholder="Min 8 chars (letters + numbers)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={fieldErrors.password}
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  requiredMarker
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={fieldErrors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              {/* Row 4: Gender & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Gender"
                  required
                  requiredMarker
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
                  ]}
                  placeholder="Select Gender *"
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value as Gender);
                    clearFieldError("gender");
                  }}
                  error={fieldErrors.gender}
                />

                <Input
                  label="Postal PIN Code"
                  required
                  requiredMarker
                  placeholder="e.g. 110001"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    clearFieldError("pincode");
                  }}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={fieldErrors.pincode}
                  autoComplete="postal-code"
                />
              </div>

              {/* Row 5: Residential Address */}
              <Input
                label="Residential Address"
                required
                requiredMarker
                placeholder="House / Flat No., Building, Street Name, Locality"
                value={addressLine1}
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  clearFieldError("addressLine1");
                }}
                leftIcon={<Building className="w-4 h-4" />}
                error={fieldErrors.addressLine1}
                autoComplete="street-address"
              />

              {/* Row 6: City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City / District"
                  required
                  requiredMarker
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    clearFieldError("city");
                  }}
                  leftIcon={<Map className="w-4 h-4" />}
                  error={fieldErrors.city}
                  autoComplete="address-level2"
                />

                <Input
                  label="State / Union Territory"
                  required
                  requiredMarker
                  placeholder="e.g. Delhi NCT"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    clearFieldError("state");
                  }}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={fieldErrors.state}
                  autoComplete="address-level1"
                />
              </div>

              {/* Row 7: Optional Fields: Occupation & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Occupation / Trade (Optional)"
                  placeholder="e.g. Engineer / Teacher / Business"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />

                <Input
                  label="Emergency Contact (Optional)"
                  placeholder="e.g. +91 9876500000"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              {/* Citizen Declaration Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      clearFieldError("agreeTerms");
                    }}
                    className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>
                    I declare that all details provided are accurate and I agree to the platform's{" "}
                    <a href="#" className="font-semibold text-blue-700 underline">
                      Terms of Service
                    </a>{" "}
                    and grievance submission guidelines. <span className="text-rose-600 font-bold">*</span>
                  </span>
                </label>
                {fieldErrors.agreeTerms && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.agreeTerms}</p>
                )}
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
