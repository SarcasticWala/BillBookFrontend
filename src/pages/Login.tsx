import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShield,
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import { BsClock } from "react-icons/bs";
import { toast } from "react-toastify";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { useAuth } from "../hooks/useAuth";

type Mode = "login" | "signup" | "forgot";
type Step = "details" | "verify";

const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v);

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, sendOtp, resetPassword } = useAuth();

  // In dev the backend returns the OTP (no SMS provider); surface it so the
  // flow is testable, and prefill the field for convenience.
  const showDevCode = (devCode?: string) => {
    if (!devCode) return;
    setForm((f) => ({ ...f, otp: devCode }));
    toast.info(`Dev OTP: ${devCode}`, { autoClose: 8000 });
  };

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    otp: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  // Resend cooldown countdown once we're on the verify step.
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("details");
    setErrors({});
  };

  // ---- Login (email + password) ----
  const handleLogin = async () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Enter your email";
    else if (!emailOk(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      await login(form.email.trim(), form.password);
      navigate("/parties");
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---- Signup step 1: validate details, then send OTP ----
  const handleDetailsSubmit = async () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your name";
    if (!form.email.trim()) next.email = "Enter your email";
    else if (!emailOk(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Enter a password";
    else if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.mobile.length !== 10) next.mobile = "Enter a valid 10-digit mobile number";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      const { devCode } = await sendOtp(form.mobile);
      setStep("verify");
      setOtpTimer(30);
      showDevCode(devCode);
    } catch (err: any) {
      toast.error(err?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ---- Signup step 2: verify OTP (server-side) + create the account ----
  const handleVerifySubmit = async () => {
    if (form.otp.length < 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }
    try {
      setLoading(true);
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.mobile,
        otp: form.otp,
      });
      toast.success("Account created");
      navigate("/parties");
    } catch (err: any) {
      const msg = err?.message || "Verification failed";
      setErrors({ otp: /otp/i.test(msg) ? msg : "" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---- Forgot step 1: validate email+phone, then send OTP ----
  const handleForgotDetails = async () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Enter your email";
    else if (!emailOk(form.email)) next.email = "Enter a valid email";
    if (form.mobile.length !== 10) next.mobile = "Enter your registered 10-digit mobile";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      const { devCode } = await sendOtp(form.mobile);
      setStep("verify");
      setOtpTimer(30);
      showDevCode(devCode);
    } catch (err: any) {
      toast.error(err?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ---- Forgot step 2: verify OTP + set the new password ----
  const handleForgotVerify = async () => {
    const next: Record<string, string> = {};
    if (form.otp.length < 6) next.otp = "Enter the 6-digit OTP";
    if (form.newPassword.length < 8) next.newPassword = "Use at least 8 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      await resetPassword({
        email: form.email.trim(),
        phone: form.mobile,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success("Password updated");
      navigate("/parties");
    } catch (err: any) {
      const msg = err?.message || "Reset failed";
      setErrors({ otp: /otp/i.test(msg) ? msg : "" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const { devCode } = await sendOtp(form.mobile);
      setOtpTimer(30);
      toast.success("OTP resent");
      showDevCode(devCode);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 secondary-font">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12 grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        {/* Marketing panel */}
        <section className="space-y-6 sm:space-y-10 hidden lg:block">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl primary-font text-gray-900 leading-tight">
            Power Your{" "}
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Billing Workflow
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-md">
            Create invoices, track parties, and manage inventory — all in one
            place, secured with mobile-number verification.
          </p>
          <Card>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FiShield className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-lg primary-font text-gray-800 mb-1">
              Secure by design
            </h3>
            <p className="text-sm light-font text-gray-600">
              Password-protected accounts with verified phone numbers.
            </p>
          </Card>
        </section>

        {/* Auth card */}
        <section className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full mx-auto overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-gray-200">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`relative py-3.5 text-sm secondary-font transition-colors cursor-pointer ${
                  mode === m
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {m === "login" ? "Sign in" : "Create account"}
                {mode === m && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {/* ---------- LOGIN ---------- */}
            {mode === "login" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-4"
              >
                <Header
                  title="Welcome back"
                  subtitle="Sign in to manage your invoices."
                />
                <Field
                  label="Email"
                  icon={<FiMail />}
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email")(v)}
                  error={errors.email}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <PasswordField
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  show={showPassword}
                  toggle={() => setShowPassword((s) => !s)}
                  autoComplete="current-password"
                />
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" fullWidth disabled={loading} className="mt-1">
                  {loading ? "Signing in..." : (<>Sign in <FiArrowRight /></>)}
                </Button>
                <SwitchHint
                  text="Don't have an account?"
                  action="Create one"
                  onClick={() => switchMode("signup")}
                />
              </form>
            )}

            {/* ---------- SIGNUP: details ---------- */}
            {mode === "signup" && step === "details" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDetailsSubmit();
                }}
                className="space-y-4"
              >
                <Header
                  title="Set up your account"
                  subtitle="We'll verify your mobile number next."
                />
                <Field
                  label="Full name"
                  icon={<FiUser />}
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  error={errors.name}
                  placeholder="Ayan Das"
                />
                <Field
                  label="Email"
                  icon={<FiMail />}
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  error={errors.email}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <PasswordField
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  show={showPassword}
                  toggle={() => setShowPassword((s) => !s)}
                  autoComplete="new-password"
                />
                <div>
                  <label className="input-label">Mobile Number</label>
                  <div
                    className={`flex items-center gap-2 rounded-lg border px-3 bg-white ${
                      errors.mobile ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    <span className="text-sm text-gray-500 shrink-0">🇮🇳 +91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.mobile}
                      onChange={(e) =>
                        set("mobile")(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="Mobile number"
                      className="w-full py-2.5 text-sm outline-none bg-transparent"
                    />
                  </div>
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                  )}
                </div>
                <Button type="submit" fullWidth disabled={loading} className="mt-1">
                  {loading ? "Sending OTP..." : (<>Continue <FiArrowRight /></>)}
                </Button>
                <SwitchHint
                  text="Already have an account?"
                  action="Sign in"
                  onClick={() => switchMode("login")}
                />
              </form>
            )}

            {/* ---------- SIGNUP: verify ---------- */}
            {mode === "signup" && step === "verify" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifySubmit();
                }}
                className="space-y-4"
              >
                <Header
                  title="Verify your number"
                  subtitle={`Enter the OTP sent to +91 ${form.mobile}`}
                />
                <div>
                  <label className="input-label">OTP Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.otp}
                    onChange={(e) =>
                      set("otp")(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit code"
                    className={`input-field text-center text-xl font-mono tracking-widest ${
                      errors.otp ? "border-red-500" : ""
                    }`}
                    autoFocus
                  />
                  {errors.otp && (
                    <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
                  )}
                  <div className="mt-2 flex justify-between items-center text-sm light-font text-gray-600">
                    {otpTimer > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <BsClock /> Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-primary hover:text-primary-hover font-medium cursor-pointer disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
                <Button type="submit" fullWidth disabled={loading || form.otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & Create account"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    set("otp")("");
                    setOtpTimer(0);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <FiArrowLeft /> Change details
                </button>
              </form>
            )}

            {/* ---------- FORGOT: details ---------- */}
            {mode === "forgot" && step === "details" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleForgotDetails();
                }}
                className="space-y-4"
              >
                <Header
                  title="Reset password"
                  subtitle="Verify your registered mobile number to continue."
                />
                <Field
                  label="Email"
                  icon={<FiMail />}
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  error={errors.email}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <div>
                  <label className="input-label">Registered Mobile</label>
                  <div
                    className={`flex items-center gap-2 rounded-lg border px-3 bg-white ${
                      errors.mobile ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    <span className="text-sm text-gray-500 shrink-0">🇮🇳 +91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.mobile}
                      onChange={(e) =>
                        set("mobile")(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="Mobile number"
                      className="w-full py-2.5 text-sm outline-none bg-transparent"
                    />
                  </div>
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                  )}
                </div>
                <Button type="submit" fullWidth disabled={loading} className="mt-1">
                  {loading ? "Sending OTP..." : (<>Send OTP <FiArrowRight /></>)}
                </Button>
                <SwitchHint
                  text="Remembered it?"
                  action="Back to sign in"
                  onClick={() => switchMode("login")}
                />
              </form>
            )}

            {/* ---------- FORGOT: verify + new password ---------- */}
            {mode === "forgot" && step === "verify" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleForgotVerify();
                }}
                className="space-y-4"
              >
                <Header
                  title="Set a new password"
                  subtitle={`Enter the OTP sent to +91 ${form.mobile}`}
                />
                <div>
                  <label className="input-label">OTP Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.otp}
                    onChange={(e) =>
                      set("otp")(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit code"
                    className={`input-field text-center text-xl font-mono tracking-widest ${
                      errors.otp ? "border-red-500" : ""
                    }`}
                    autoFocus
                  />
                  {errors.otp && (
                    <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
                  )}
                  <div className="mt-2 flex justify-between items-center text-sm light-font text-gray-600">
                    {otpTimer > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <BsClock /> Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-primary hover:text-primary-hover font-medium cursor-pointer disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
                <PasswordField
                  label="New Password"
                  value={form.newPassword}
                  onChange={set("newPassword")}
                  error={errors.newPassword}
                  show={showPassword}
                  toggle={() => setShowPassword((s) => !s)}
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading || form.otp.length < 6}
                >
                  {loading ? "Updating..." : "Update password"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    set("otp")("");
                    set("newPassword")("");
                    setOtpTimer(0);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <FiArrowLeft /> Back
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-lg primary-font text-gray-900">{title}</h1>
      <p className="text-sm light-font text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function SwitchHint({
  text,
  action,
  onClick,
}: {
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p className="text-center text-xs text-gray-400 pt-1">
      {text}{" "}
      <button
        type="button"
        onClick={onClick}
        className="text-primary font-medium hover:underline cursor-pointer"
      >
        {action}
      </button>
    </p>
  );
}

function Field({
  label,
  icon,
  error,
  onChange,
  ...inputProps
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 bg-white transition-colors ${
          error
            ? "border-red-400"
            : "border-gray-300 focus-within:border-primary"
        }`}
      >
        <span className="text-gray-400">{icon}</span>
        <input
          {...inputProps}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  error,
  show,
  toggle,
  autoComplete,
  label = "Password",
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  show: boolean;
  toggle: () => void;
  autoComplete?: string;
  label?: string;
}) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 bg-white transition-colors ${
          error ? "border-red-400" : "border-gray-300 focus-within:border-primary"
        }`}
      >
        <span className="text-gray-400">
          <FiLock />
        </span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className="w-full py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={toggle}
          tabIndex={-1}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
