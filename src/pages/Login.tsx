import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { BsClock } from "react-icons/bs";
import { LuScanLine } from "react-icons/lu";
import { useFormik } from "formik";
import { Button } from "../components/UI/Button";

import { useAuth } from "../hooks/useAuth";

const countryCodes = [
  { code: "+91", name: "India", flag: "🇮🇳" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [selectedCountry] = useState(countryCodes[0]);
  const [showOtpFlow, setShowOtpFlow] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtp, verifyOtp } = useAuth();


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
      alert(error.message || "Something went wrong");
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
    alert(err.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50  secondary-font">
      <main className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">
       <div id="recaptcha-container"></div>

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
            <div className="bg-white border shadow-sm p-5 rounded-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <FiShield className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Military Grade Security</h3>
              <p className="text-sm text-gray-600">End-to-end encryption with zero-trust policies</p>
            </div>
            <div className="bg-white border shadow-sm p-5 rounded-2xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <BsClock className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Lightning Fast Login</h3>
              <p className="text-sm text-gray-600">Access your dashboard in seconds</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-2xl border max-w-md w-full mx-auto">
          <form onSubmit={formik.handleSubmit}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {showOtpFlow ? "Verify Number" : "Login with OTP"}
              </h2>
              <p className="text-sm text-gray-600">
                {showOtpFlow ? `OTP sent to ${selectedCountry.code} ${formik.values.mobile}` : "Enter mobile to get started"}
              </p>
            </div>

            {!showOtpFlow ? (
              <>
                <label htmlFor="mobile" className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number</label>
                <div className="flex border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative">
                    <button
                      onClick={() => setShowCountryCodes(!showCountryCodes)}
                      type="button"
                      className="px-4 py-3 border-r bg-gray-100 text-sm font-medium"
                    >
                      {selectedCountry.flag} {selectedCountry.code}
                    </button>
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
                  disabled={!formik.values.mobile || formik.values.mobile.length < 6 || isLoading}
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
                  onClick={() => console.log("QR Code login clicked")}
                  className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900"
                >
                  <LuScanLine className="w-5 h-5" />
                  <span>Login by scanning QR Code</span>
                </Button>
              </>
            ) : (
              <>
                <label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-1 block">OTP Code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formik.values.otp}
                  onChange={(e) => formik.setFieldValue("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full text-center text-xl font-mono px-4 py-3 border rounded-lg tracking-widest"
                />

                <div className="mt-2 flex justify-between text-sm text-gray-600">
                  {otpTimer > 0 ? (
                    <span><BsClock className="inline mr-1" /> Resend in {otpTimer}s</span>
                  ) : (
                    <Button
                      type="button"
                      
                      onClick={handleResendOtp}
                      className="text-blue-600 p-0 h-auto text-sm"
                    >
                      Resend OTP
                    </Button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={formik.values.otp.length < 6 || isLoading}
                  className="mt-5 w-full bg-green-600 hover:bg-green-700"
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
