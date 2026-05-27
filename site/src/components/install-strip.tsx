"use client";

import { useState } from "react";
import type { Engram } from "@/lib/types";
import {
  HARNESSES,
  HARNESS_LABEL,
  CLI_NATIVE,
  buildSnippet,
  followUpNote,
  type Harness,
} from "@/lib/install-targets";
import { CopyCommand } from "./copy-command";
import { CheckIcon, CopyIcon } from "./icons";

/*
  THE headline feature: one-click install, per harness. A selector row across all
  six target harnesses (Claude Code · Cursor · Codex · OpenCode · Gemini · Hermes)
  drives a derived view:
    (a) the exact `armory install <name> --cli <harness>` command (copyable),
    (b) the raw config/snippet that command writes — the .mcp.json entry for an
        MCP, the fetch-and-place path for a skill/subagent/rule/command — derived
        per type×harness exactly like the CLI's targets.ts/install.ts,
    (c) a copy-to-clipboard button on each block.

  Works for all 12 component types. Harnesses listed in the engram's cli_compat
  are marked "verified"; the rest still resolve to a valid path (universal).
*/
export function InstallStrip({ engram }: { engram: Engram }) {
  // Default to the first harness the engram is verified-compatible with, else
  // Claude Code.
  const compat = new Set(engram.cli_compat);
  const initial: Harness =
    (HARNESSES.find((h) => compat.has(h)) as Harness | undefined) ?? "claude";
  const [active, setActive] = useState<Harness>(initial);

  const snippet = buildSnippet(engram, active);
  const followUp = followUpNote(engram, active);

  return (
    <div className="rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
      <div className="rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-4 sm:p-5">
        {/* Header + harness selector */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            install into your harness
          </span>
          <div
            role="tablist"
            aria-label="Target harness"
            className="flex flex-wrap gap-1"
          >
            {HARNESSES.map((h) => {
              const isActive = active === h;
              const verified = compat.has(h);
              return (
                <button
                  key={h}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(h)}
                  title={
                    verified
                      ? `${HARNESS_LABEL[h]} — verified compatible`
                      : `${HARNESS_LABEL[h]} — universal target`
                  }
                  className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                    isActive
                      ? "bg-accent-quiet text-accent-hover ring-1 ring-accent-line"
                      : "text-ink-muted hover:bg-raise-3 hover:text-ink-body"
                  }`}
                >
                  {verified && (
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-accent" : "bg-line-strong"
                      }`}
                    />
                  )}
                  {HARNESS_LABEL[h]}
                </button>
              );
            })}
          </div>
        </div>

        {/* (a) The exact CLI command */}
        <CopyCommand
          command={snippet.command}
          label={`Copy install command for ${HARNESS_LABEL[active]}`}
        />

        {/* Where it lands + verified/universal note */}
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-ink-muted">
          <span>{snippet.verb}</span>
          <span className="text-accent-hover">{snippet.file}</span>
          {!CLI_NATIVE.has(active) && (
            <span className="text-ink-muted">· universal drop target</span>
          )}
        </p>

        {/* (b)+(c) The raw config/snippet that command writes, with its own copy */}
        {snippet.config && (
          <ConfigBlock
            title={
              snippet.configLang === "json" || snippet.configLang === "toml"
                ? `what lands in ${snippet.file}`
                : "what happens"
            }
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
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          {title}
          {manual && (
            <span className="ml-2 rounded border border-line-subtle px-1.5 py-0.5 text-[9px] tracking-normal text-warn">
              manual
            </span>
          )}
          {!manual && lang !== "text" && (
            <span className="ml-2 font-mono text-[9px] tracking-normal text-ink-muted">
              {lang}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied config" : "Copy config snippet"}
          className="flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2 text-[11px] font-medium text-ink-muted transition-colors hover:border-accent-line hover:text-accent-hover active:scale-95"
        >
          {copied ? (
            <>
              <CheckIcon size={12} className="text-ok" />
              copied
            </>
          ) : (
            <>
              <CopyIcon size={12} />
              copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-line-default bg-[oklch(13%_0.006_72)] p-3.5 font-mono text-[12.5px] leading-relaxed text-ink-body [font-variant-ligatures:none]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
