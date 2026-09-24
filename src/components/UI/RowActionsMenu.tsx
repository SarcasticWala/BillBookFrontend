import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BsThreeDotsVertical } from "react-icons/bs";

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

const MENU_WIDTH = 160; // matches w-40

/**
 * Compact three-dot row menu. Stops row-click propagation so opening the menu
 * (or picking an action) never triggers the row's navigation. Closes on
 * outside click / Escape / scroll / resize.
 *
 * The dropdown panel is rendered into a portal on `document.body` with fixed
 * positioning computed from the button's own screen position — every table
 * that uses this needs `overflow-x-auto` for small screens, which forces the
 * container's `overflow-y` to clip too (a CSS rule: overflow-x non-visible
 * makes overflow-y compute to auto if left visible). An `absolute` menu
 * would get silently clipped by that ancestor and never actually show up,
 * even though the click still registers.
 */
export const RowActionsMenu = ({ actions }: { actions: RowAction[] }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const openMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Closing on scroll (rather than repositioning) avoids the menu drifting
    // away from the button as the table's own container scrolls.
    const onScrollOrResize = () => setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <div className="relative flex justify-end">
      <button
        ref={btnRef}
        type="button"
        aria-label="Row actions"
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            setOpen(false);
          } else {
            openMenu();
          }
        }}
        className="w-11 h-11 xl:w-8 xl:h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
      >
        <BsThreeDotsVertical />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: MENU_WIDTH }}
            className="z-50 rounded-lg border border-gray-200 bg-white py-1 shadow-lg secondary-font"
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default RowActionsMenu;
