// Central API configuration + auth token storage.
// Override the base URL per environment with VITE_API_BASE_URL.
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TOKEN_KEY = "billbook_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

/** Attach the backend JWT (if present) to an outgoing Headers object. */
export const withAuth = (headers: Headers): Headers => {
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
};

/** Plain object form for raw fetch() calls (multipart uploads). */
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
