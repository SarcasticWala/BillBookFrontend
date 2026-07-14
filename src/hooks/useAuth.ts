import { API_BASE_URL, setToken, clearToken } from "../config/api";

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
   * Request a phone OTP from our backend. In development the backend returns
   * the code (`devCode`) since no SMS provider is wired yet, so signup/reset
   * can be tested end-to-end.
   */
  const sendOtp = async (mobile: string): Promise<{ devCode?: string }> => {
    const res = await postJson("/api/auth/send-otp", { phone: mobile });
    return { devCode: res.devCode };
  };

  /** Create the account after the phone OTP is verified server-side. */
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

  /** Reset password after verifying the account's phone via OTP. */
  const resetPassword = async (payload: {
    email: string;
    phone: string;
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
