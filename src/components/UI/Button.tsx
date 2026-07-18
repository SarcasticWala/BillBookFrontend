import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Shows an inline spinner and disables the button while true. */
  loading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // Filled brand button — the primary call to action.
  primary:
    "bg-primary text-white shadow-[var(--shadow-btn-primary)] hover:bg-primary-hover " +
    "active:bg-primary-hover",
  // Quiet filled neutral — for the secondary action next to a primary.
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-200 shadow-[var(--shadow-btn)]",
  // Bordered white — the default "Cancel"/toolbar affordance.
  outline:
    "bg-white border border-gray-300 text-gray-700 shadow-[var(--shadow-btn)] " +
    "hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
  // Chromeless — icon/tertiary actions inside toolbars and rows.
  ghost:
    "bg-transparent text-gray-600 shadow-none hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
  // Destructive.
  danger:
    "bg-red-600 text-white shadow-[var(--shadow-btn)] hover:bg-red-700 active:bg-red-700",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-[10px] gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyle =
    "relative inline-flex items-center justify-center font-medium whitespace-nowrap select-none " +
    "transition-[background-color,border-color,box-shadow,transform,color] duration-150 ease-out " +
    "active:scale-[0.985] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:active:scale-100";

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0 -ml-0.5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
