import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "../config/firebase";

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const sendOtpFirebase = async (mobile: string) => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
  }

  confirmationResult = await signInWithPhoneNumber(
    auth,
    `+91${mobile}`,
    recaptchaVerifier
  );
};

export const verifyOtpFirebase = async (otp: string) => {
  if (!confirmationResult) {
    throw new Error("OTP not sent");
  }
  return confirmationResult.confirm(otp);
};
