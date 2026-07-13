import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back button; provide onBack to handle the click. */
  onBack?: () => void;
  /** Right-aligned action buttons (Cancel / Save etc.). */
  actions?: React.ReactNode;
  /** Sticks to the top of the scroll container. Default true. */
  sticky?: boolean;
  className?: string;
}

/**
 * Standard page header bar — back button + title/subtitle on the left,
 * action buttons on the right. Mirrors the top action bar used across
 * professional billing UIs. Sticky by default so actions stay in reach.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  actions,
  sticky = true,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 -mx-4 sm:-mx-6 -mt-4 mb-6",
        sticky ? "sticky top-0 z-20" : undefined,
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <FaArrowLeft />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg primary-font text-gray-900 truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs light-font text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0">{actions}</div>}
    </div>
  );
};
