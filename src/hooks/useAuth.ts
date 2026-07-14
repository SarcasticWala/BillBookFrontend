import { API_BASE_URL, setToken, clearToken } from "../config/api";

async function postJson(path: string, body: unknown) {
  // Abort if the server doesn't respond in time (e.g. a cold-started or
  // unreachable backend) so the UI shows an error instead of spinning forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      throw new Error("The server took too long to respond. Please try again.");
    }
    // Network/CORS failures surface as a generic TypeError.
    throw new Error("Can't reach the server. Please check your connection and try again.");
  }
  clearTimeout(timeout);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json;
}

export const useAuth = () => {
  /** Email + password login against our backend. */
  const login = async (email: string, password: string) => {
    const { token, data: user } = await postJson("/api/auth/login", {
      email,
      password,
    });
    setToken(token);
    return user;
  };

  /**
   * Request an email verification code from our backend. In development, if no
   * SMTP is configured, the backend returns the code (`devCode`) so signup/reset
   * can be tested without sending real email.
   */
  const sendOtp = async (email: string): Promise<{ devCode?: string }> => {
    const res = await postJson("/api/auth/send-otp", { email });
    return { devCode: res.devCode };
  };

  /** Create the account after the email OTP is verified server-side. */
  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    otp: string;
  }) => {
    const { token, data: user } = await postJson("/api/auth/register", payload);
    setToken(token);
    return user;
  };

  /** Reset password after verifying the account's email via OTP. */
  const resetPassword = async (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const { token, data: user } = await postJson(
      "/api/auth/reset-password",
      payload
    );
    setToken(token);
    return user;
  };

  const logout = () => {
    clearToken();
  };

  return { login, sendOtp, register, resetPassword, logout };
};
