import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
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
  const { t } = useLanguage();

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
      setIdentifierError(t("validation.requiredField"));
      isValid = false;
    }

    if (!password) {
      setPasswordError(t("validation.requiredField"));
      isValid = false;
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
      const response = await authApi.login({
        identifier: identifier.trim(),
        email: identifier.trim(),
        password,
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        login(token, user);
        toast.success(`${t("auth.welcomeBack")}, ${user.fullName}!`, t("auth.authSuccess"));

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
        setErrorMsg(response.message || t("auth.invalidCredentials"));
      }
    } catch (err: any) {
      if (!err.response) {
        setErrorMsg(t("errors.networkError"));
      } else {
        const message = err.response?.data?.message || t("auth.invalidCredentials");
        setErrorMsg(message);
      }
      toast.error(errorMsg || t("auth.invalidCredentials"), t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-amber-400 shadow-md mb-2">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
            {t("auth.loginTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            {t("auth.loginSubtitle")}
          </p>
        </div>

        {/* Login Card Form */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base">{t("common.signIn")}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {t("common.appName")} • {t("common.govtOfIndia")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg(null)}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label={t("auth.identifierLabel")}
                type="text"
                name="identifier"
                required
                autoComplete="username"
                placeholder={t("auth.identifierPlaceholder")}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (identifierError) setIdentifierError(null);
                }}
                error={identifierError || undefined}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label={t("auth.passwordLabel")}
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError || undefined}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md text-sm mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t("auth.signInButton")}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex flex-col gap-3 text-center border-t border-slate-100">
            <div className="text-xs text-slate-600">
              {t("auth.noAccount")}{" "}
              <Link to="/register" className="font-bold text-blue-700 hover:text-blue-800 hover:underline">
                {t("auth.registerHere")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
