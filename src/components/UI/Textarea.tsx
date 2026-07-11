import React from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className = "", containerClassName = "", id, ...props }, ref) => {
    const areaId = id || props.name;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label htmlFor={areaId} className="input-label">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn("input-field", error && "border-red-500", className)}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
