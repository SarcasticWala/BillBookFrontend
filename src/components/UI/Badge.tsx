import React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "info" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Show a leading status dot in the variant color. */
  dot?: boolean;
  children: React.ReactNode;
}

// Soft tinted fill + a same-hue ring (1px inset) reads more refined than a flat
// block of color — the Stripe/Linear status-pill look.
const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-blue-50 text-blue-700 ring-blue-600/15",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/15",
  neutral: "bg-gray-100 text-gray-600 ring-gray-500/15",
};

const dotStyles: Record<BadgeVariant, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-gray-400",
};

/** Small status pill/chip. Replaces ad-hoc `bg-*-100 text-*-800 rounded-full` markup. */
export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  dot = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
