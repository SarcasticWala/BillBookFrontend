import React from "react";
import { Card } from "./Card";
import { Shimmer } from "./Shimmer";
import { cn } from "../../lib/utils";

type Tone = "primary" | "success" | "danger" | "warning" | "neutral" | "info";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** Color accent for the icon chip + (optionally) the value. */
  tone?: Tone;
  /** Tint the value text with the tone color (default: neutral gray-900). */
  colorValue?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const toneChip: Record<Tone, string> = {
  primary: "bg-blue-50 text-blue-600 ring-blue-600/10",
  success: "bg-emerald-50 text-emerald-600 ring-emerald-600/10",
  danger: "bg-red-50 text-red-600 ring-red-600/10",
  warning: "bg-amber-50 text-amber-600 ring-amber-600/10",
  info: "bg-indigo-50 text-indigo-600 ring-indigo-600/10",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

const toneValue: Record<Tone, string> = {
  primary: "text-blue-600",
  success: "text-emerald-600",
  danger: "text-red-600",
  warning: "text-amber-600",
  info: "text-indigo-600",
  neutral: "text-gray-900",
};

/** Premium KPI tile — icon chip + label + big value. Used across every list page. */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  tone = "primary",
  colorValue = false,
  loading = false,
  onClick,
  className = "",
}) => {
  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={cn("flex items-start gap-3.5", className)}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-xl ring-1 ring-inset",
            toneChip[tone]
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">{label}</p>
        {loading ? (
          <Shimmer className="h-7 w-24 rounded mt-1.5" />
        ) : (
          <p
            className={cn(
              "text-2xl primary-font leading-tight mt-0.5",
              colorValue ? toneValue[tone] : "text-gray-900"
            )}
          >
            {value}
          </p>
        )}
      </div>
    </Card>
  );
};
