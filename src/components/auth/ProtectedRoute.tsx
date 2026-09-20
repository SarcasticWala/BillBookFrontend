import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, clearToken } from "../../config/api";
import { useGetMeQuery } from "../../features/auth/authApiSlice";
import { BrandLoader } from "../UI/BrandLoader";

/**
 * Layout-route gate for authenticated areas — used as `<Route element={<ProtectedRoute />}>`
 * wrapping real child routes (never a wildcard), so a URL that doesn't match any
 * child never reaches this gate at all and instead falls through to the app's
 * top-level 404 route. Requires a stored JWT AND validates it against
 * `/api/auth/me` on load:
 *  - no token, or token rejected (401/403) -> clear it and send to "/login".
 *  - transient errors (network/5xx) are tolerated so an outage doesn't log users out.
 * A matched child route is never rendered unless the session is valid.
 */
export const ProtectedRoute = () => {
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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    // Use the same branded loader as boot/Suspense so only one loader style
    // is ever shown (no plain "Loading…" text flashing alongside it).
    return <BrandLoader visible />;
  }

  return <Outlet />;
};
