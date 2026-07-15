import React, { useEffect, useMemo, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Subtle scroll-triggered entrance: fades + slides up when it enters the
 * viewport (once). Uses IntersectionObserver + CSS transition — no deps.
 * Respects prefers-reduced-motion.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  const style = useMemo(() => {
    return { transitionDelay: `${delay}ms` };
  }, [delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Avoid JSX namespace typing issues in strict TS builds by staying in runtime
  // createElement while using React.JSX types for the `as` prop.
  return React.createElement(
    Tag,
    {
      ref,
      style,
      className: `transition-all duration-700 ease-out will-change-transform ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`,
    } as React.HTMLAttributes<HTMLElement>,
    children
  );
};

export default Reveal;

