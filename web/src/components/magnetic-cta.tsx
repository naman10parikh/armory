"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/*
  Primary CTA with a magnetic pull toward the cursor. Uses a direct ref transform
  (not React state) so the pull is jank-free and never triggers re-renders, per
  the taste brief. Disabled under reduced-motion / coarse pointers. The trailing
  icon lives in its own circle (button-in-button) and nudges on hover.
*/
export function MagneticCta({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    )
      return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }
  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-accent py-3 pl-5 pr-2.5 text-sm font-semibold text-base shadow-[0_0_0_1px_var(--accent-line),0_18px_40px_-24px_oklch(80%_0.135_75/0.4)] transition-[transform,background-color] duration-200 ease-out-quart will-change-transform hover:bg-accent-hover"
    >
      {children}
      {icon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-base/15 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </Link>
  );
}
