"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";

/*
  Scroll reveal via IntersectionObserver — fade-up + bounded blur, staggered by
  `index`. Unobserves after first fire (no continuous scroll listeners). The
  reduced-motion fallback is handled in CSS (.reveal snaps to final). `as` picks
  the rendered tag; createElement keeps the ref typing simple (one HTMLElement).
*/
export function Reveal({
  children,
  index = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `reveal ${className}`,
      style: { ["--i" as string]: index } as React.CSSProperties,
    },
    children,
  );
}
