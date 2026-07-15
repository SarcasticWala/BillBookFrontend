import React from "react";

/**
 * Subtle dotted-grid background layer (Aceternity-style) with a soft radial
 * fade so the dots dissolve toward the edges. Render inside a `relative`
 * container; place actual content in a sibling with `relative z-10`.
 */
export const DotBackground: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      // Uniform indigo dot grid across the entire page (subtle).
      backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.22) 1.4px, transparent 1.4px)",
      backgroundSize: "24px 24px",
    }}
  />
);

export default DotBackground;
