"use client";

import { useState } from "react";
import type { Component } from "@/lib/types";
import {
  HARNESSES,
  HARNESS_LABEL,
  buildSnippet,
  type Harness,
} from "@/lib/install-targets";
import { CheckIcon, CopyIcon, TerminalIcon } from "./icons";

/*
  Compact one-click install for the browse cards. A small "Install" toggle opens
  an inline tray (no navigation, no modal) with the six-harness selector and the
  copyable `armory install` command for the chosen harness. Sits above the card's
  whole-card link overlay (relative z-10) so interacting with it never navigates.
*/
export function QuickInstall({ component }: { component: Component }) {
  const [open, setOpen] = useState(false);
  const compat = new Set(component.cli_compat);
  const initial: Harness =
    (HARNESSES.find((h) => compat.has(h)) as Harness | undefined) ?? "claude";
  const [active, setActive] = useState<Harness>(initial);
  const [copied, setCopied] = useState(false);

  const snippet = buildSnippet(component, active);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.warn("[quick-install] copy failed:", String(err));
    }
  }

  return (
    <div className="relative z-10">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${
          open
            ? "border-accent-line bg-accent-quiet text-accent-hover"
            : "border-line text-ink-muted hover:border-accent-line hover:text-accent-hover"
        }`}
      >
        <TerminalIcon size={12} />
        Install
      </button>

      {open && (
        <div className="mt-2.5 rounded-xl border border-line-default bg-canvas p-2.5">
          {/* Harness selector */}
          <div
            role="tablist"
            aria-label="Harness"
            className="mb-2 flex flex-wrap gap-1"
          >
            {HARNESSES.map((h) => {
              const isActive = active === h;
              return (
                <button
                  key={h}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(h)}
                  className={`cursor-pointer rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "bg-accent-quiet text-accent-hover"
                      : "text-ink-muted hover:bg-raise-3 hover:text-ink-body"
                  }`}
                >
                  {HARNESS_LABEL[h]}
                </button>
              );
            })}
          </div>

          {/* Command + copy */}
          <div className="flex items-center gap-2 rounded-lg bg-canvas/60 px-2.5 py-1.5">
            <span aria-hidden className="select-none font-mono text-xs text-accent">
              $
            </span>
            <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[11.5px] text-ink-body [font-variant-ligatures:none]">
              {snippet.command}
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy"}
              className="flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-line px-1.5 text-[10px] font-medium text-ink-muted transition-colors hover:border-accent-line hover:text-accent-hover active:scale-95"
            >
              {copied ? (
                <CheckIcon size={11} className="text-ok" />
              ) : (
                <CopyIcon size={11} />
              )}
            </button>
          </div>
          <p className="mt-1.5 truncate font-mono text-[10px] text-ink-muted">
            → {snippet.file}
          </p>
        </div>
      )}
    </div>
  );
}
