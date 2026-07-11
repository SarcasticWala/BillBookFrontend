import React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "info" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-700",
};

/** Small status pill/chip. Replaces ad-hoc `bg-*-100 text-*-800 rounded-full` markup. */
export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
