import React from "react";
import { cn } from "../../lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  /** Optional element rendered on the right of the section header. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Body layout. "grid" gives a responsive 2-col field grid; "plain" leaves it to the caller. */
  layout?: "grid" | "plain";
}

/**
 * A titled form section on a white card — the building block for every
 * create/edit form. Consistent header, spacing, and an optional responsive
 * field grid so forms line up the same way across the app.
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  aside,
  children,
  className = "",
  layout = "grid",
}) => {
  return (
    <section
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm primary-font text-gray-900 uppercase tracking-wide">{title}</h2>
          {description && (
            <p className="text-xs light-font text-gray-500 mt-0.5 normal-case tracking-normal">
              {description}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
      ) : (
        children
      )}
    </section>
  );
};
