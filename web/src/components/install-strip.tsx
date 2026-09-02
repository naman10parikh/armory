"use client";

import { useState } from "react";
import type { Component } from "@/lib/types";
import { HARNESS_LABEL, buildSnippet, followUpNote } from "@/lib/install-targets";
import { useHarness } from "./install-snippet";
import { CopyCommand } from "./copy-command";
import { CheckIcon, CopyIcon } from "./icons";

/*
  The per-harness install detail — design/BRIEF.md §2 J3, §9. Reads the SAME
  harness the page's <InstallSnippet>/<HarnessSelector> already chose (ONE
  selector per page, design/BRIEF.md §9 — this no longer keeps its own,
  independent tab list) and renders exactly what THAT harness's install
  writes:
    (a) the exact `armory install <name> --cli <harness>` command (copyable),
    (b) the raw config/snippet that command writes — the .mcp.json entry for
        an MCP, the fetch-and-place path for a skill/subagent/rule/command —
        derived per type×harness exactly like the CLI's targets.ts/install.ts,
    (c) a copy-to-clipboard button on the config block.

  Works for all 12 component types. A harness listed in the component's
  cli_compat is VERIFIED; any other harness still resolves to a valid
  universal path — that fact is real text below, never a title= tooltip.
*/
export function InstallStrip({ component }: { component: Component }) {
  const harness = useHarness();
  const verified = new Set(component.cli_compat).has(harness);

  const snippet = buildSnippet(component, harness);
  const followUp = followUpNote(component, harness);

  return (
    <div className="rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
      <div className="rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-4 sm:p-5">
        {/* (a) The exact CLI command for the currently selected harness */}
        <CopyCommand
          command={snippet.command}
          label={`Copy install command for ${HARNESS_LABEL[harness]}`}
        />

        {/* Where it lands + verified/universal — real text, never a title=
            tooltip (design/BRIEF.md §1.1). */}
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-ink-muted">
          <span>{snippet.verb}</span>
          <span className="text-accent-hover">{snippet.file}</span>
          <span aria-hidden>·</span>
          <span className={verified ? "text-ok" : "text-ink-muted"}>
            {verified ? "Verified" : "Universal"}
          </span>
        </p>

        {/* (b)+(c) The raw config/snippet that command writes, with its own copy */}
        {snippet.config && (
          <ConfigBlock
            title="Configuration"
            code={snippet.config}
            lang={snippet.configLang ?? "text"}
            manual={snippet.manual}
          />
        )}

        {followUp && (
          <p className="mt-3 text-[12px] leading-snug text-ink-muted">
            <span className="text-accent-hover">↳</span> {followUp}
          </p>
        )}
      </div>
    </div>
  );
}

// A copyable raw-config panel. Monospace, scrollable, Double-Bezel inner core.
function ConfigBlock({
  title,
  code,
  lang,
  manual,
}: {
  title: string;
  code: string;
  lang: "json" | "toml" | "text";
  manual: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.warn("[install-strip] copy failed:", String(err));
    }
  }

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {title}
          {manual && (
            <span className="ml-2 rounded border border-line-subtle px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-warn">
              Manual
            </span>
          )}
          {!manual && lang !== "text" && (
            <span className="ml-2 font-mono text-[9px] normal-case tracking-normal text-ink-muted">
              {lang}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy"}
          className="flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2 text-[11px] font-medium text-ink-muted transition-colors hover:border-accent-line hover:text-accent-hover active:scale-95"
        >
          {copied ? (
            <>
              <CheckIcon size={12} className="text-ok" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-line-default bg-canvas p-3.5 font-mono text-[12.5px] leading-relaxed text-ink-body [font-variant-ligatures:none]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
