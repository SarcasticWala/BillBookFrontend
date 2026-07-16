import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

/**
 * Compact three-dot row menu. Stops row-click propagation so opening the menu
 * (or picking an action) never triggers the row's navigation. Closes on
 * outside click / Escape.
 */
export const RowActionsMenu = ({ actions }: { actions: RowAction[] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Row actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
      >
        <BsThreeDotsVertical />
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-30 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg secondary-font"
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                a.onClick();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 cursor-pointer ${
                a.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
              }`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RowActionsMenu;
