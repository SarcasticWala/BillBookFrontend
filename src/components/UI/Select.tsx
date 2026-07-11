import React from "react";
import { cn } from "../../lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

/** Standard select built on the app's `.input-field` / `.input-label` tokens.
 *  Pass `options`, or `children` for full control over <option>s. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, required, options, placeholder, className = "", containerClassName = "", id, children, ...props },
    ref
  ) => {
    const selectId = id || props.name;
    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn("input-field bg-white", error && "border-red-500", className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
