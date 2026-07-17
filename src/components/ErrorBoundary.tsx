import React from "react";
import { Button } from "./UI/Button";

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Top-level render-crash guard. Wraps the routed app so an unexpected error in
 * one screen shows a recoverable fallback instead of a blank white page.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : undefined,
    };
  }

  componentDidCatch(error: unknown) {
    // Kept lightweight; a monitoring hook (e.g. Sentry) can plug in here later.
    // eslint-disable-next-line no-console
    console.error("Unhandled render error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center secondary-font bg-white">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div>
          <h1 className="text-lg primary-font text-gray-900">Something went wrong</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            An unexpected error occurred while rendering this page. You can reload
            to continue.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}

export default ErrorBoundary;
