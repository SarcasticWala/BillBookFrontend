import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type Auth,
  initializeAuth,
  browserLocalPersistence,
} from "firebase/auth";
import { app } from "../config/firebase";

interface WindowWithRecaptcha extends Window {
  recaptchaVerifier?: RecaptchaVerifier;
}

let confirmationResult: ConfirmationResult | null = null;
let auth: Auth | null = null;

// Initialize auth with persistence
const getAuth = (): Auth => {
  if (!auth) {
    auth = initializeAuth(app, {
      persistence: [browserLocalPersistence],
    });
  }
  return auth;
};

export const sendOtpFirebase = async (
  mobile: string,
  containerId: string = "recaptcha-container"
): Promise<void> => {
  if (!mobile || mobile.length < 10) {
    throw new Error("Invalid mobile number");
  }

  try {
    const authInstance = getAuth();
    const windowObj = window as unknown as WindowWithRecaptcha;

    if (!windowObj.recaptchaVerifier) {
      const recaptchaVerifier = new RecaptchaVerifier(
        authInstance,
        containerId,
        {
          size: "invisible",
        }
      );

      try {
        await recaptchaVerifier.render();
        windowObj.recaptchaVerifier = recaptchaVerifier;
      } catch (error) {
        console.error("Recaptcha render error:", error);
        throw new Error("Failed to initialize reCAPTCHA");
      }
    }

    const appVerifier = windowObj.recaptchaVerifier;
    if (!appVerifier) {
      throw new Error("reCAPTCHA verifier not initialized");
    }

    confirmationResult = await signInWithPhoneNumber(
      authInstance,
      `+91${mobile}`,
      appVerifier
    );

    if (!confirmationResult) {
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    // Clean up recaptcha on error
    const windowObj = window as unknown as WindowWithRecaptcha;
    if (windowObj.recaptchaVerifier) {
      try {
        windowObj.recaptchaVerifier.clear();
        windowObj.recaptchaVerifier = undefined;
      } catch (e) {
        console.error("Error clearing recaptcha:", e);
      }
    }
    throw error;
  }
};

export const verifyOtpFirebase = async (otp: string): Promise<any> => {
  if (!otp || otp.length < 4) {
    throw new Error("Invalid OTP");
  }

  if (!confirmationResult) {
    throw new Error("OTP not sent. Please request OTP first.");
  }

  try {
    const userCredential = await confirmationResult.confirm(otp);
    confirmationResult = null; // Clear after verification
    return userCredential;
  } catch (error) {
    throw new Error("Invalid OTP. Please try again.");
  }
};

export const signOutFirebase = async (): Promise<void> => {
  try {
    const authInstance = getAuth();
    await authInstance.signOut();
    confirmationResult = null;
    const windowObj = window as unknown as WindowWithRecaptcha;
    if (windowObj.recaptchaVerifier) {
      windowObj.recaptchaVerifier.clear();
      windowObj.recaptchaVerifier = undefined;
    }
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};
