import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Opt into the shared hover-lift for clickable cards/tiles. */
  interactive?: boolean;
}

/** Standard surface: white, padded, rounded, soft layered shadow + hairline border.
 *  Matches the dominant card pattern used across the app. */
export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-xl border border-slate-200/80 shadow-[var(--shadow-card)]",
        interactive ? "card-interactive cursor-pointer" : undefined,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
