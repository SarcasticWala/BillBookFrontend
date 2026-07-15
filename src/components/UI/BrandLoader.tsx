import React, { useEffect, useState } from "react";

interface BrandLoaderProps {
  /** When false, the loader fades + scales out, then unmounts. */
  visible: boolean;
}

/**
 * Full-screen branded loader. Shows the "BillBook" wordmark (Bill = slate,
 * Book = indigo→purple gradient, matching the navbar) with a thin
 * indeterminate gradient progress bar and a staggered 3-dot bouncer.
 * Fades + scales out over 250ms when `visible` becomes false, then unmounts.
 */
export const BrandLoader: React.FC<BrandLoaderProps> = ({ visible }) => {
  const [render, setRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRender(true);
    } else {
      const t = setTimeout(() => setRender(false), 260); // match exit transition
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!render) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 transition-all ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      }`}
      style={{ transitionDuration: "250ms" }}
      role="status"
      aria-live="polite"
      aria-label="Loading BillBook"
    >
      {/* Wordmark */}
      <div className="text-3xl sm:text-4xl font-bold tracking-tight [animation:fadeUpPrice_.5s_ease-out]">
        <span className="text-slate-900">Bill</span>
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Book
        </span>
      </div>

      {/* Thin indeterminate progress bar with moving gradient sheen */}
      <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-indigo-100">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-indeterminate" />
      </div>

      {/* Staggered 3-dot bouncer */}
      <div className="mt-4 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandLoader;
