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
  FiMessageSquare,
  FiCheck,
} from "react-icons/fi";
import { BsClock } from "react-icons/bs";
import { toast } from "react-toastify";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { OtpInput } from "../components/UI/OtpInput";
import { useAuth } from "../hooks/useAuth";

/** Mask an email for display: keep the first 2 chars of the local part. */
function maskEmail(email: string): string {
  const [local, domain] = String(email).split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}${"•".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

/** Seconds → m:ss (e.g. 26 → "00:26"). */
function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Mode = "login" | "signup" | "forgot";
type Step = "details" | "verify" | "reset" | "done";

const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v);
// Minimum acceptable password: 8+ chars with lower, upper and a number.
const strongEnough = (v: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
const WEAK_MSG = "Use 8+ characters with upper, lower and a number";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, sendOtp, verifyOtp, resetPassword, logout } = useAuth();

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
    confirmPassword: "",
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
    setOtpTimer(0);
    // Clear transient credentials, but keep the email prefilled for convenience.
    setForm((f) => ({
      ...f,
      otp: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    }));
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
      navigate("/dashboard");
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
    else if (!strongEnough(form.password)) next.password = WEAK_MSG;
    if (form.mobile.length !== 10) next.mobile = "Enter a valid 10-digit mobile number";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      const { devCode } = await sendOtp(form.email.trim());
      setStep("verify");
      setOtpTimer(30);
      showDevCode(devCode);
    } catch (err: any) {
      toast.error(err?.message || "Could not send code");
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
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Verification failed";
      setErrors({ otp: /otp/i.test(msg) ? msg : "" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---- Forgot step 1: validate email, then send OTP ----
  const handleForgotDetails = async () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Enter your email";
    else if (!emailOk(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      const { devCode } = await sendOtp(form.email.trim());
      setStep("verify");
      setOtpTimer(30);
      showDevCode(devCode);
    } catch (err: any) {
      toast.error(err?.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  // ---- Forgot step 2: verify the OTP (non-consuming), then advance ----
  const handleForgotVerify = async () => {
    if (form.otp.length < 6) {
      setErrors({ otp: "Enter the 6-digit code" });
      return;
    }
    try {
      setLoading(true);
      await verifyOtp(form.email.trim(), form.otp);
      setErrors({});
      setStep("reset");
    } catch (err: any) {
      const msg = err?.message || "Invalid code";
      setErrors({ otp: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---- Forgot step 3: set the new password, then show the success screen ----
  const handleResetSubmit = async () => {
    const next: Record<string, string> = {};
    if (!strongEnough(form.newPassword)) next.newPassword = WEAK_MSG;
    if (form.confirmPassword !== form.newPassword)
      next.confirmPassword = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setLoading(true);
      await resetPassword({
        email: form.email.trim(),
        otp: form.otp,
        newPassword: form.newPassword,
      });
      // Don't auto-login — the user asked to land on login and sign in fresh.
      logout();
      setStep("done");
    } catch (err: any) {
      const msg = err?.message || "Reset failed";
      // A consumed/expired OTP means they must restart the flow.
      setErrors({ newPassword: /otp|code/i.test(msg) ? "" : msg });
      toast.error(msg);
      if (/otp|code|expire/i.test(msg)) setStep("verify");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const { devCode } = await sendOtp(form.email.trim());
      setOtpTimer(30);
      toast.success("Code resent");
      showDevCode(devCode);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-br from-blue-50 via-white to-indigo-50 secondary-font">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
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
            place, secured with email verification.
          </p>
          <Card>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FiShield className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-lg primary-font text-gray-800 mb-1">
              Secure by design
            </h3>
            <p className="text-sm light-font text-gray-600">
              Password-protected accounts with email verification.
            </p>
          </Card>
        </section>

        {/* Auth card */}
        <section className="bg-white rounded-2xl shadow-[var(--shadow-overlay)] border border-slate-200/80 max-w-md w-full min-w-0 mx-auto overflow-hidden">
          {/* Tabs — only on the first step; hidden mid-flow (OTP / reset /
              success) so a stray click can't blow away the process. */}
          {step === "details" && (
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
          )}

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
                  subtitle="We'll email you a verification code next."
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
                <PasswordStrength value={form.password} />
                <div>
                  <label className="input-label">Mobile Number</label>
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 bg-white transition-all focus-within:ring-2 ${
                      errors.mobile
                        ? "border-red-400 focus-within:ring-red-500/15"
                        : "border-gray-300 focus-within:border-primary focus-within:ring-primary/15"
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
                  {loading ? "Sending code..." : (<>Continue <FiArrowRight /></>)}
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
                className="space-y-5"
              >
                <VerifyHero
                  title="Verify OTP"
                  email={form.email}
                  onChangeEmail={() => {
                    setStep("details");
                    set("otp")("");
                    setOtpTimer(0);
                  }}
                />

                <OtpInput
                  value={form.otp}
                  onChange={set("otp")}
                  hasError={!!errors.otp}
                  autoFocus
                />
                {errors.otp && (
                  <p className="text-center text-sm text-red-500">{errors.otp}</p>
                )}

                <ResendControl
                  seconds={otpTimer}
                  onResend={handleResend}
                  disabled={loading}
                />

                <Button type="submit" fullWidth disabled={loading || form.otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & continue"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    set("otp")("");
                    setOtpTimer(0);
                  }}
                  className="mx-auto flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
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
                  subtitle="We'll email you a code to reset your password."
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
                <Button type="submit" fullWidth disabled={loading} className="mt-1">
                  {loading ? "Sending code..." : (<>Send code <FiArrowRight /></>)}
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
                className="space-y-5"
              >
                <VerifyHero
                  title="Verify OTP"
                  email={form.email}
                  onChangeEmail={() => {
                    setStep("details");
                    set("otp")("");
                    setOtpTimer(0);
                  }}
                />

                <OtpInput
                  value={form.otp}
                  onChange={set("otp")}
                  hasError={!!errors.otp}
                  autoFocus
                />
                {errors.otp && (
                  <p className="text-center text-sm text-red-500">{errors.otp}</p>
                )}

                <ResendControl
                  seconds={otpTimer}
                  onResend={handleResend}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  disabled={loading || form.otp.length < 6}
                >
                  {loading ? "Verifying..." : "Verify & continue"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    set("otp")("");
                    setOtpTimer(0);
                  }}
                  className="mx-auto flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <FiArrowLeft /> Back
                </button>
              </form>
            )}

            {/* ---------- FORGOT: set new password ---------- */}
            {mode === "forgot" && step === "reset" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleResetSubmit();
                }}
                className="space-y-4"
              >
                <div className="flex flex-col items-center text-center gap-2 mb-1">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-primary text-2xl">
                    <FiLock />
                  </div>
                  <h1 className="text-xl primary-font text-gray-900">
                    Set a new password
                  </h1>
                  <p className="text-sm light-font text-gray-500">
                    Choose a strong password for your account.
                  </p>
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
                <PasswordStrength value={form.newPassword} />
                <PasswordField
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  error={errors.confirmPassword}
                  show={showPassword}
                  toggle={() => setShowPassword((s) => !s)}
                  autoComplete="new-password"
                />

                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("verify")}
                  className="mx-auto flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <FiArrowLeft /> Back
                </button>
              </form>
            )}

            {/* ---------- FORGOT: success ---------- */}
            {mode === "forgot" && step === "done" && (
              <div className="flex flex-col items-center text-center gap-5 py-6">
                {/* Layered check badge with a soft halo */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-24 w-24 rounded-full bg-green-100/70" />
                  <span className="absolute inline-flex h-[4.5rem] w-[4.5rem] rounded-full bg-green-200/70" />
                  <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white text-3xl shadow-lg shadow-green-500/30">
                    <FiCheck strokeWidth={3} />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-2xl primary-font text-gray-900">
                    Password updated
                  </h1>
                  <p className="text-sm light-font text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Your password has been changed successfully. Use your new
                    password to sign in.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-1">
                  <Button fullWidth onClick={() => switchMode("login")}>
                    Continue to login <FiArrowRight />
                  </Button>
                  <p className="text-xs light-font text-gray-400">
                    You can safely close this tab.
                  </p>
                </div>
              </div>
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

/** Centered icon + heading + masked email + info banner for the verify step. */
function VerifyHero({
  title,
  email,
  onChangeEmail,
}: {
  title: string;
  email: string;
  onChangeEmail?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-primary text-2xl">
          <FiMessageSquare />
        </div>
        <h1 className="text-xl primary-font text-gray-900">{title}</h1>
        <p className="text-sm light-font text-gray-500">
          Enter the 6-digit code we sent to your email.
        </p>
        <p className="text-sm primary-font text-gray-900 tracking-wide">
          {maskEmail(email)}
        </p>
        {onChangeEmail && (
          <button
            type="button"
            onClick={onChangeEmail}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium cursor-pointer"
          >
            <FiArrowLeft className="text-[0.7rem]" /> Wrong email? Change it
          </button>
        )}
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm text-gray-600">
        <FiMail className="mt-0.5 shrink-0 text-gray-400" />
        <span>
          The code usually arrives within a minute. If not, wait for the timer
          and tap Resend OTP.
        </span>
      </div>
    </div>
  );
}

/** Resend-cooldown pill / resend button, centered. */
function ResendControl({
  seconds,
  onResend,
  disabled,
}: {
  seconds: number;
  onResend: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-center">
      {seconds > 0 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-500">
          <BsClock /> Resend in {formatTimer(seconds)}
        </span>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 px-4 py-1.5 text-sm text-primary font-medium cursor-pointer disabled:opacity-50 transition-colors"
        >
          Resend OTP
        </button>
      )}
    </div>
  );
}

/** Live password strength meter + requirement checklist (shown while typing). */
function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const checks = [
    { label: "8+ characters", ok: value.length >= 8 },
    { label: "Upper & lowercase", ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "A number", ok: /\d/.test(value) },
    { label: "A symbol", ok: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = checks.filter((c) => c.ok).length; // 0–4
  const meta = [
    { label: "Very weak", bar: "bg-red-500", text: "text-red-600" },
    { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
    { label: "Fair", bar: "bg-orange-500", text: "text-orange-600" },
    { label: "Good", bar: "bg-yellow-500", text: "text-yellow-600" },
    { label: "Strong", bar: "bg-green-500", text: "text-green-600" },
  ][score];

  return (
    <div className="-mt-1">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? meta.bar : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs secondary-font ${meta.text}`}>
        Password strength: {meta.label}
      </p>
      <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`text-[11px] flex items-center gap-1 ${
              c.ok ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span>{c.ok ? "✓" : "○"}</span>
            {c.label}
          </li>
        ))}
      </ul>
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
        className={`flex items-center gap-2 rounded-xl border px-3 bg-white transition-all ${
          error
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-500/15"
            : "border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
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
        className={`flex items-center gap-2 rounded-xl border px-3 bg-white transition-all ${
          error
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-500/15"
            : "border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
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
