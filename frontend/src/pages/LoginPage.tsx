import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../api/authApi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Landmark, User, Lock, ShieldCheck, ArrowRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Field-level inline validation errors
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect");

  const validateForm = (): boolean => {
    let isValid = true;
    setIdentifierError(null);
    setPasswordError(null);
    setErrorMsg(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setIdentifierError("Email or mobile number is required.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate required fields before making network request
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await authApi.login({
        identifier: identifier.trim(),
        email: identifier.trim(),
        password,
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        login(token, user);
        toast.success(`Welcome back, ${user.fullName}!`, "Authentication Successful");

        // Role-based redirection
        if (redirectUrl && redirectUrl.startsWith("/")) {
          navigate(redirectUrl, { replace: true });
        } else {
          switch (user.role) {
            case "CITIZEN":
              navigate("/citizen", { replace: true });
              break;
            case "OFFICER":
              navigate("/officer", { replace: true });
              break;
            case "SENIOR_OFFICER":
              navigate("/senior-officer", { replace: true });
              break;
            case "ADMIN":
              navigate("/admin", { replace: true });
              break;
            default:
              navigate("/", { replace: true });
          }
        }
      } else {
        setErrorMsg(response.message || "Invalid credentials.");
      }
    } catch (err: any) {
      if (!err.response) {
        // Network or server unreachable error
        const netMessage = "Unable to connect to the server. Please try again.";
        setErrorMsg(netMessage);
        toast.error(netMessage, "Connection Error");
      } else if (err.response.status === 401 || err.response.status === 400) {
        const authMessage = err.response?.data?.message || "Invalid credentials.";
        setErrorMsg(authMessage);
        toast.error(authMessage, "Sign In Error");
      } else if (err.response.status === 403) {
        const forbiddenMsg = err.response?.data?.message || "Account access is restricted or deactivated.";
        setErrorMsg(forbiddenMsg);
        toast.error(forbiddenMsg, "Access Forbidden");
      } else {
        const genericMessage = "An error occurred during authentication. Please try again.";
        setErrorMsg(genericMessage);
        toast.error(genericMessage, "Authentication Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset helper for development and verification testing
  const setDemoCredentials = (demoIdentifier: string, demoPass: string) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setIdentifierError(null);
    setPasswordError(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
            Sign In to SETU
          </h2>
          <p className="text-xs text-slate-500">
            AI-Powered Government Services & Grievance Management Platform
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Authentication Portal</CardTitle>
            <CardDescription>
              Enter your registered citizen email or 10-digit mobile number
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Input
                  label="Email or Mobile Number *"
                  type="text"
                  required
                  placeholder="name@domain.gov.in or 9876543210"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (identifierError) setIdentifierError(null);
                  }}
                  leftIcon={<User className="w-4 h-4" />}
                  autoComplete="username"
                  error={identifierError || undefined}
                />
              </div>

              <div>
                <Input
                  label="Password *"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  autoComplete="current-password"
                  error={passwordError || undefined}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Credentials Toolbar */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Demo Accounts Quick-Fill:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDemoCredentials("citizen@setu.gov.in", "Password@123")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-left transition"
                >
                  <p className="font-bold text-[11px] text-blue-900">👤 Citizen</p>
                  <p className="text-[10px] text-slate-400">citizen@setu.gov.in</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials("officer.water@setu.gov.in", "Password@123")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-left transition"
                >
                  <p className="font-bold text-[11px] text-blue-900">👮 Field Officer</p>
                  <p className="text-[10px] text-slate-400">officer.water</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials("senior.officer@setu.gov.in", "Password@123")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-left transition"
                >
                  <p className="font-bold text-[11px] text-indigo-900">🏛️ Senior Officer</p>
                  <p className="text-[10px] text-slate-400">senior.officer</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials("admin@setu.gov.in", "Password@123")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-left transition"
                >
                  <p className="font-bold text-[11px] text-purple-900">👑 Super Admin</p>
                  <p className="text-[10px] text-slate-400">admin@setu.gov.in</p>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 py-4 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Don't have a citizen account?{" "}
              <Link to="/register" className="font-bold text-blue-700 hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secured with 256-bit TLS encryption & JWT session validation</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
