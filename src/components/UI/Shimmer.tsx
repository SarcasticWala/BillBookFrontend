import React from "react";

/**
 * Reusable shimmer/skeleton placeholder. Uses the CSS `.shimmer` keyframe
 * (GPU-friendly background-position sweep, not JS-driven). Pass rounding/size
 * via className so the skeleton matches the real content it replaces — e.g.
 * <Shimmer className="h-4 w-24 rounded" />. Respects prefers-reduced-motion
 * (falls back to a static slate-200 block).
 */
export const Shimmer: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`shimmer ${className}`} aria-hidden="true" />
);

export default Shimmer;
