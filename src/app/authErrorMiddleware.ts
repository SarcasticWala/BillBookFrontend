import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { clearToken, getToken } from "../config/api";

/**
 * Global session-expiry handler: if any authenticated RTK Query request is
 * rejected with a 401 (token expired/invalid mid-session), clear the token and
 * bounce to the landing page. Login/register/reset use raw fetch (not RTK
 * Query), so their 401s (e.g. wrong password) never reach this.
 */
export const authErrorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const status = (action.payload as { status?: number | string } | undefined)?.status;
    if (status === 401 && getToken()) {
      clearToken();
      // Hard redirect so all in-memory state is dropped with the dead session.
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
  }
  return next(action);
};
