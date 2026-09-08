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
import {
  Landmark,
  User,
  Lock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Layers,
  Zap,
} from "lucide-react";

interface RolePreset {
  id: "CITIZEN" | "OFFICER" | "SENIOR_OFFICER" | "ADMIN";
  titleKey: string;
  badgeKey: string;
  descKey: string;
  defaultName: string;
  email: string;
  password: string;
  portalPath: string;
  colorTheme: {
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
  };
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<string>("CITIZEN");
  const [identifier, setIdentifier] = useState("citizen@setu.gov.in");
  const [password, setPassword] = useState("Password@123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Field-level inline validation errors
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect");

  const ROLE_PRESETS: RolePreset[] = [
    {
      id: "CITIZEN",
      titleKey: "auth.roleCitizen",
      badgeKey: "auth.roleCitizenBadge",
      descKey: "auth.roleCitizenDesc",
      defaultName: "Aarav Sharma (Public Citizen)",
      email: "citizen@setu.gov.in",
      password: "Password@123",
      portalPath: "/citizen",
      colorTheme: {
        activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20",
        activeBg: "bg-emerald-50/70",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        badgeText: "text-emerald-700",
        iconBg: "bg-emerald-600 text-white",
      },
    },
    {
      id: "OFFICER",
      titleKey: "auth.roleOfficer",
      badgeKey: "auth.roleOfficerBadge",
      descKey: "auth.roleOfficerDesc",
      defaultName: "Rajesh Verma (Water & Sanitation)",
      email: "officer.water@setu.gov.in",
      password: "Password@123",
      portalPath: "/officer",
      colorTheme: {
        activeBorder: "border-blue-500 ring-2 ring-blue-500/20",
        activeBg: "bg-blue-50/70",
        badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
        badgeText: "text-blue-700",
        iconBg: "bg-blue-600 text-white",
      },
    },
    {
      id: "SENIOR_OFFICER",
      titleKey: "auth.roleSeniorOfficer",
      badgeKey: "auth.roleSeniorOfficerBadge",
      descKey: "auth.roleSeniorOfficerDesc",
      defaultName: "Dr. Sunita Deshmukh (Dept HOD)",
      email: "senior.officer@setu.gov.in",
      password: "Password@123",
      portalPath: "/senior-officer",
      colorTheme: {
        activeBorder: "border-indigo-500 ring-2 ring-indigo-500/20",
        activeBg: "bg-indigo-50/70",
        badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
        badgeText: "text-indigo-700",
        iconBg: "bg-indigo-600 text-white",
      },
    },
    {
      id: "ADMIN",
      titleKey: "auth.roleAdmin",
      badgeKey: "auth.roleAdminBadge",
      descKey: "auth.roleAdminDesc",
      defaultName: "Super Administrator (Master)",
      email: "admin@setu.gov.in",
      password: "Password@123",
      portalPath: "/admin",
      colorTheme: {
        activeBorder: "border-purple-500 ring-2 ring-purple-500/20",
        activeBg: "bg-purple-50/70",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        badgeText: "text-purple-700",
        iconBg: "bg-purple-600 text-white",
      },
    },
  ];

  const handleSelectRolePreset = (preset: RolePreset, autoSubmit: boolean = false) => {
    setSelectedRole(preset.id);
    setIdentifier(preset.email);
    setPassword(preset.password);
    setIdentifierError(null);
    setPasswordError(null);
    setErrorMsg(null);

    if (autoSubmit) {
      executeLogin(preset.email, preset.password, preset.portalPath);
    }
  };

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

  const executeLogin = async (ident: string, pass: string, targetPortalFallback?: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await authApi.login({
        identifier: ident.trim(),
        email: ident.trim(),
        password: pass,
      });

      if (response.success && response.data) {
        const { token, user } = response.data;
        login(token, user);
        toast.success(`${t("auth.welcomeBack")}, ${user.fullName}!`, t("auth.authSuccess"));

        if (redirectUrl && redirectUrl.startsWith("/")) {
          navigate(redirectUrl, { replace: true });
        } else if (targetPortalFallback) {
          navigate(targetPortalFallback, { replace: true });
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
      let message = t("auth.invalidCredentials");
      if (!err.response) {
        message = t("errors.networkError");
      } else {
        message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || t("auth.invalidCredentials");
      }
      setErrorMsg(message);
      toast.error(message, t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const currentPreset = ROLE_PRESETS.find((p) => p.email.toLowerCase() === identifier.trim().toLowerCase());
    await executeLogin(identifier, password, currentPreset?.portalPath);
  };

  const activePreset = ROLE_PRESETS.find((p) => p.id === selectedRole) || ROLE_PRESETS[0];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 text-amber-400 shadow-lg mb-1 ring-4 ring-blue-600/20">
            <Landmark className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
            {t("auth.loginTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t("auth.roleSelectorSubtitle")}
          </p>
        </div>

        {/* 1. Interactive 4-Role Selector Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t("auth.roleSelectorTitle")}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {t("auth.testingCredentialsPrompt")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ROLE_PRESETS.map((preset) => {
              const isSelected = selectedRole === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectRolePreset(preset, false)}
                  className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between h-28 shadow-2xs hover:shadow-sm ${
                    isSelected
                      ? `${preset.colorTheme.activeBorder} ${preset.colorTheme.activeBg}`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${preset.colorTheme.iconBg}`}
                    >
                      {preset.id === "CITIZEN" && <User className="w-4 h-4" />}
                      {preset.id === "OFFICER" && <Briefcase className="w-4 h-4" />}
                      {preset.id === "SENIOR_OFFICER" && <Layers className="w-4 h-4" />}
                      {preset.id === "ADMIN" && <ShieldCheck className="w-4 h-4" />}
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {t(preset.titleKey)}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 ${preset.colorTheme.badgeBg}`}
                    >
                      {t(preset.badgeKey)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Login Form Card */}
        <Card className="border-slate-200 shadow-xl overflow-hidden">
          {/* Subtle Tiranga strip on card header */}
          <div className="h-1 w-full flex">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-[#FFFFFF]" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          <CardHeader className="pb-3 pt-5 flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  {t("common.signIn")} • {t(activePreset.titleKey)}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                {activePreset.defaultName} • {activePreset.email}
              </CardDescription>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectRolePreset(activePreset, true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t("auth.instantSignIn")}</span>
            </button>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
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

              <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1 font-bold shadow-md text-sm"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t("auth.signInButton")} ({t(activePreset.titleKey)})
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="pt-3 pb-5 flex flex-wrap items-center justify-between text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50">
            <div>
              {t("auth.noAccount")}{" "}
              <Link to="/register" className="font-bold text-blue-700 hover:text-blue-800 hover:underline">
                {t("auth.registerHere")}
              </Link>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              PROJECT SETU • GOVT OF INDIA
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
