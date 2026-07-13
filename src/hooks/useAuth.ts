import { sendOtpFirebase, verifyOtpFirebase } from "../services/auth.service";
import { API_BASE_URL, setToken, clearToken } from "../config/api";

export const useAuth = () => {
  const sendOtp = async (mobile: string) => {
    await sendOtpFirebase(mobile);
  };

  const verifyOtp = async (otp: string) => {
    try {
      const result = await verifyOtpFirebase(otp);

      // Null/undefined check on result and user property
      if (!result || !result.user) {
        throw new Error(
          "User verification failed: Invalid response from authentication service"
        );
      }

      // Exchange the Firebase ID token for our backend-issued JWT.
      const idToken = await result.user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Backend login failed");
      }

      const { token, data: user } = await res.json();
      setToken(token);
      return user;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  const logout = () => {
    clearToken();
  };

  return { sendOtp, verifyOtp, logout };
};
