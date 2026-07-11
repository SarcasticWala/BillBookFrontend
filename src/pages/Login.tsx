import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { BsClock } from "react-icons/bs";
import { LuScanLine } from "react-icons/lu";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";

import { useAuth } from "../hooks/useAuth";

const countryCodes = [
  { code: "+91", name: "India", flag: "🇮🇳" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [selectedCountry] = useState(countryCodes[0]);
  const [showOtpFlow, setShowOtpFlow] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtp, verifyOtp } = useAuth();

  // Count the resend timer down once the OTP step is shown.
  useEffect(() => {
    if (!showOtpFlow || otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [showOtpFlow, otpTimer]);


  const formik = useFormik({
  initialValues: {
    mobile: "",
    otp: "",
  },
  onSubmit: async (values) => {
    try {
      setIsLoading(true);

      if (!showOtpFlow) {
        // SEND OTP
        await sendOtp(values.mobile);
        setShowOtpFlow(true);
        setOtpTimer(30);
      } else {
        // VERIFY OTP
        const user = await verifyOtp(values.otp);
        console.log("Logged in user:", user);
        navigate("/parties");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  },
});


const handleResendOtp = async () => {
  try {
    setIsLoading(true);
    await sendOtp(formik.values.mobile);
    setOtpTimer(30);
  } catch (err: any) {
    toast.error(err?.message || "Failed to resend OTP");
  } finally {
    setIsLoading(false);
  }
};


  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50  secondary-font">
      <div id="recaptcha-container"></div>

      <main className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
       
        <section className="space-y-10">
          <h2 className="text-5xl primary-font text-gray-900 leading-tight">
            Power Your{" "}
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Billing Workflow
            </span>
          </h2>
          <p className="text-lg text-gray-700 max-w-md">
            Secure your access. Simplify your operations. Built for modern billing environments.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <FiShield className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-lg primary-font text-gray-800 mb-1">Military Grade Security</h3>
              <p className="text-sm light-font text-gray-600">End-to-end encryption with zero-trust policies</p>
            </Card>
            <Card>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <BsClock className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-lg primary-font text-gray-800 mb-1">Lightning Fast Login</h3>
              <p className="text-sm light-font text-gray-600">Access your dashboard in seconds</p>
            </Card>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md w-full mx-auto">
          <form onSubmit={formik.handleSubmit}>
            <div className="text-center mb-6">
              <h2 className="text-2xl primary-font text-gray-900">
                {showOtpFlow ? "Verify Number" : "Login with OTP"}
              </h2>
              <p className="text-sm light-font text-gray-600 mt-1">
                {showOtpFlow ? `OTP sent to ${selectedCountry.code} ${formik.values.mobile}` : "Enter mobile to get started"}
              </p>
            </div>

            {!showOtpFlow ? (
              <>
                <label htmlFor="mobile" className="input-label">Mobile Number</label>
                <div className="flex border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative">
                    {/* Only +91 is supported today; shown as a static prefix. */}
                    <span className="flex items-center px-4 py-3 border-r bg-gray-100 text-sm font-medium">
                      {selectedCountry.flag} {selectedCountry.code}
                    </span>
                  </div>

                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Mobile number"
                    value={formik.values.mobile}
                    onChange={(e) => formik.setFieldValue("mobile", e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="flex-1 px-4 py-3 focus:outline-none text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={formik.values.mobile.length !== 10 || isLoading}
                  className="mt-5 w-full"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm text-gray-500">
                    <span className="bg-white px-4">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => toast.info("QR code login is coming soon")}
                >
                  <LuScanLine className="w-5 h-5" />
                  <span>Login by scanning QR Code</span>
                </Button>
              </>
            ) : (
              <>
                <label htmlFor="otp" className="input-label">OTP Code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formik.values.otp}
                  onChange={(e) => formik.setFieldValue("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="input-field text-center text-xl font-mono tracking-widest"
                />

                <div className="mt-2 flex justify-between items-center text-sm light-font text-gray-600">
                  {otpTimer > 0 ? (
                    <span className="inline-flex items-center gap-1"><BsClock /> Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:text-primary-hover font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={formik.values.otp.length < 6 || isLoading}
                  className="mt-5"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOtpFlow(false);
                    formik.setFieldValue("otp", "");
                    setOtpTimer(30);
                  }}
                  className="mt-3 text-xs text-gray-600 hover:text-gray-800"
                >
                  ← Change number
                </button>
              </>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
