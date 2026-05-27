"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

/*
  A Double-Bezel terminal card with a copy button. Inline "copied" confirm (not a
  toast — anti-slop). The prompt glyph is amber; the command is mono. Used for the
  landing quickstart and the detail-page install strip.

  `dense` tightens padding for in-card use (browse cards). `label` overrides the
  default accessible label.
*/
export function CopyCommand({
  command,
  dense = false,
  label,
}: {
  command: string;
  dense?: boolean;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      // Fallback for non-secure contexts / older browsers where the async
      // Clipboard API is unavailable — never silently fail a primary action.
      try {
        const ta = document.createElement("textarea");
        ta.value = command;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch (err2) {
        console.warn("[copy-command] clipboard write failed:", String(err), String(err2));
      }
    }
  }

  return (
    <div className="rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
      <div
        className={`flex items-center gap-3 rounded-[calc(1.25rem-0.375rem)] bg-base/60 shadow-[inset_0_1px_0_oklch(100%_0_0/0.06)] ${
          dense ? "px-3 py-2" : "px-4 py-3.5"
        }`}
      >
        <span aria-hidden className="select-none font-mono text-sm text-accent">
          $
        </span>
        <code
          className={`flex-1 overflow-x-auto whitespace-nowrap font-mono text-ink-body [font-variant-ligatures:none] ${
            dense ? "text-[13px]" : "text-sm"
          }`}
        >
          {command}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={label ?? (copied ? "Copied" : "Copy command")}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 text-[11px] font-medium text-ink-muted transition-colors hover:border-accent-line hover:text-accent-hover active:scale-95"
        >
          {copied ? (
            <>
              <CheckIcon size={13} className="text-ok" />
              copied
            </>
          ) : (
            <>
              <CopyIcon size={13} />
              copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
