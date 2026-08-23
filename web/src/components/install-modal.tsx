"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Component } from "@/lib/types";
import { InstallStrip } from "./install-strip";
import { TerminalIcon, TypeIcon } from "./icons";

/*
  Install, in a focused popup — not leaking down the page. A filled-amber trigger
  ("Install") opens a centered dialog over a blurred, dimmed warm-black backdrop.
  The dialog body is the SAME per-harness install UI as the inline strip, reused
  wholesale — one source of truth for the six-harness
  `armory install <name> --cli <harness>` view, its derived config, and copy.

  Modal contract: Esc closes · backdrop press closes · body scroll locked while
  open · focus moves into the dialog on open and returns to the trigger on close ·
  Tab is trapped inside. Rendered through a portal onto <body> so it overlays the
  whole screen regardless of the detail page's stacking / transform context.
*/
export function InstallModal({ component }: { component: Component }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Body scroll-lock while open. Preserve + restore the prior overflow value so we
  // never clobber an overflow set by something else.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close + a lightweight Tab focus-trap. Move focus into the dialog on
  // open (next frame, after the portal paints); restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const opener = triggerRef.current;
    const raf = requestAnimationFrame(() => dialogRef.current?.focus());

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
      opener?.focus();
    };
  }, [open, close]);

  return (
    <>
      {/* Trigger — the headline action, compact so it no longer fills the page. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-accent py-3 pl-3 pr-6 text-sm font-semibold text-base shadow-[0_0_0_1px_var(--accent-line),0_18px_40px_-24px_oklch(80%_0.135_75/0.4)] transition-[transform,background-color] duration-200 ease-out-quart hover:bg-accent-hover active:scale-[0.98]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-base/15 transition-transform duration-200 ease-out-quart group-hover:-translate-y-0.5">
            <TerminalIcon size={16} />
          </span>
          Install into your harness
        </button>
        <code className="min-w-0 truncate font-mono text-[13px] text-ink-muted [font-variant-ligatures:none]">
          armory install {component.name}
        </code>
      </div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
            {/* Backdrop — a real button so click AND keyboard both close it; kept
                out of the tab order (Esc + the header ✕ are the keyboard paths). */}
            <button
              type="button"
              aria-label="Close install dialog"
              tabIndex={-1}
              onClick={close}
              className="fixed inset-0 -z-10 cursor-default bg-base/70 backdrop-blur-md"
            />

            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="animate-fade-up my-auto w-full max-w-2xl rounded-2xl bg-base outline-none ring-1 ring-line-default shadow-[0_1px_0_0_var(--line-subtle)_inset,0_40px_90px_-40px_oklch(0%_0_0/0.72)]"
            >
              {/* Header — what you're installing + close. */}
              <div className="flex items-start justify-between gap-4 border-b border-line-subtle p-5 sm:p-6">
                <div className="min-w-0">
                  <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
                    <TypeIcon type={component.type} size={14} />
                    install
                  </span>
                  <h2
                    id={titleId}
                    className="mt-1.5 truncate font-serif text-[1.75rem] leading-tight tracking-[-0.01em] text-ink-hi"
                  >
                    {component.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close install dialog"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-accent-line hover:text-accent-hover active:scale-95"
                >
                  <svg
                    aria-hidden
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              {/* Body — the SAME six-harness install UI as the inline strip. */}
              <div className="p-5 sm:p-6">
                <InstallStrip component={component} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
