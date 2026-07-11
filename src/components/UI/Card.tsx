import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Standard surface: white, padded, rounded-lg, subtle border + shadow.
 *  Matches the dominant card pattern used across the app. */
export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
