import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/** True when the value is an RTK Query fetchBaseQuery error. */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

/**
 * Unwrap RTK Query / thrown errors into a single user-facing message.
 * Handles the common billing-app cases (429 rate-limit, 401 session expiry,
 * network failures) so components don't hand-roll `error?.data?.message`.
 */
export function getErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    const status = error.status;
    const data = error.data as { message?: string; retryAfter?: string | number } | undefined;

    if (status === 429) {
      const retryAfter = data?.retryAfter ?? "a moment";
      return `Too many requests — please try again in ${retryAfter}.`;
    }
    if (status === 401) return "Session expired. Please log in again.";
    if (status === "FETCH_ERROR")
      return "Can't reach the server. Check your connection and try again.";
    if (status === "TIMEOUT_ERROR")
      return "The server took too long to respond. Please try again.";

    return data?.message ?? "Something went wrong. Please try again.";
  }

  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}
