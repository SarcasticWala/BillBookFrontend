import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, clearToken } from "../../config/api";
import { useGetMeQuery } from "../../features/auth/authApiSlice";

/**
 * Gate for authenticated areas. Requires a stored JWT AND validates it against
 * `/api/auth/me` on load:
 *  - no token, or token rejected (401/403) -> clear it and send to "/" (landing).
 *  - transient errors (network/5xx) are tolerated so an outage doesn't log users out.
 * The protected path is never rendered unless the session is valid.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token = getToken();

  const { isLoading, isError, error } = useGetMeQuery(undefined, { skip: !token });

  // Only an auth rejection (numeric 401/403) means the token is invalid/expired.
  const status = (error as { status?: number | string } | undefined)?.status;
  const authRejected =
    isError && typeof status === "number" && (status === 401 || status === 403);

  useEffect(() => {
    if (authRejected) clearToken();
  }, [authRejected]);

  if (!token || authRejected) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 secondary-font text-gray-500">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
};
