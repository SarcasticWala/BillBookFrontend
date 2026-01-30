import { sendOtpFirebase, verifyOtpFirebase } from "../services/auth.service";

export const useAuth = () => {
  const sendOtp = async (mobile: string) => {
    await sendOtpFirebase(mobile);
  };

  const verifyOtp = async (otp: string) => {
    try {
      const result = await verifyOtpFirebase(otp);
      
      // Null/undefined check on result and user property
      if (!result || !result.user) {
        throw new Error("User verification failed: Invalid response from authentication service");
      }
      
      return result.user;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  return { sendOtp, verifyOtp };
};
