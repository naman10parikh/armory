"use client";

import { useEffect, useRef, useState } from "react";

/*
  Count up to `value` on first in-view. tabular-nums so it doesn't reflow.
  Reduced-motion / no-IntersectionObserver / value<=0: render the final value
  immediately. The rAF loop is owned by the effect and cancelled on unmount.
*/
export function CountUp({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => 0);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!el || reduce || value <= 0) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const dur = 1200;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 4); // ease-out-quart
        setDisplay(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDisplay(value); // guarantee exact final value
      };
      raf = requestAnimationFrame(tick);
    };

    // If the element is already in the viewport at mount, start immediately —
    // IntersectionObserver does not reliably re-fire for already-visible
    // elements (esp. under React StrictMode double-invoke). Otherwise observe.
    const rect = el.getBoundingClientRect();
    const visible = rect.top < window.innerHeight && rect.bottom > 0;
    if (visible) {
      run();
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display.toLocaleString()}
    </span>
  );
}
