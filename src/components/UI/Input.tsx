import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Muted helper text shown below the field (hidden while an error is showing). */
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

/** Standard text input built on the app's `.input-field` / `.input-label` tokens. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = "", containerClassName = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("input-field", error && "border-red-500", className)}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs light-font text-gray-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
