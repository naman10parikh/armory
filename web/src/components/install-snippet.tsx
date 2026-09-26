"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { installCommand } from "@/lib/install-targets";
import { CommandText } from "./command-text";
import { CheckIcon, CopyIcon } from "./icons";

/*
  Install snippet — design/BRIEF.md §2 J3, §9, Decision 2.

  Find and trust exist to serve INSTALL. The command lives in the row, is real
  selectable text in the DOM (an agent reads it without clicking), and the
  target harness is chosen once and remembered.

  The harness is a single app-wide value held in a module store, so one
  <HarnessSelector/> in the toolbar retargets every <InstallSnippet/> on the
  page. localStorage is read AFTER mount (never during render) so the server
  and client agree on the first paint.
*/

export const INSTALL_HARNESSES = ["claude", "cursor", "codex", "gemini", "opencode"] as const;
export type InstallHarness = (typeof INSTALL_HARNESSES)[number];

/** COPY.md §2 — `Harness`, not "Target harness". */
export const HARNESS_LABEL: Record<InstallHarness, string> = {
  claude: "Claude Code",
  cursor: "Cursor",
  codex: "Codex",
  gemini: "Gemini",
  opencode: "OpenCode",
};

const STORAGE_KEY = "armory.harness";
const DEFAULT_HARNESS: InstallHarness = "claude";

// ── module store ────────────────────────────────────────────────────────────
let current: InstallHarness = DEFAULT_HARNESS;
let restored = false;
const listeners = new Set<() => void>();

const isHarness = (v: unknown): v is InstallHarness =>
  typeof v === "string" && (INSTALL_HARNESSES as readonly string[]).includes(v);

function emit(): void {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const getSnapshot = (): InstallHarness => current;
const getServerSnapshot = (): InstallHarness => DEFAULT_HARNESS;

/** Read the remembered harness once, after hydration. */
function restore(): void {
  if (restored) return;
  restored = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isHarness(saved) && saved !== current) {
      current = saved;
      emit();
    }
  } catch (err) {
    console.warn("[install-snippet] localStorage unavailable:", String(err));
  }
}

function setHarness(next: InstallHarness): void {
  if (next === current) return;
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch (err) {
    console.warn("[install-snippet] could not persist harness:", String(err));
  }
  emit();
}

/** The active harness, shared by every snippet + selector on the page. */
export function useHarness(): InstallHarness {
  const harness = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(restore, []);
  return harness;
}

// ── components ──────────────────────────────────────────────────────────────

/** Render ONCE per page (toolbar / band). Retargets every snippet below it. */
export function HarnessSelector({ className = "" }: { className?: string }) {
  const harness = useHarness();
  return (
    <label className={`inline-flex items-center gap-2 text-[12px] ${className}`}>
      <span className="font-semibold uppercase tracking-[0.08em] text-ink-muted">Harness</span>
      <select
        value={harness}
        onChange={(e) => setHarness(e.target.value as InstallHarness)}
        className="cursor-pointer rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 text-[12px] text-ink-hi transition-colors duration-150 ease-state hover:border-accent-line"
      >
        {INSTALL_HARNESSES.map((h) => (
          <option key={h} value={h}>
            {HARNESS_LABEL[h]}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * The in-row command. Always in the DOM, always selectable, and never cut (CP143): it wraps rather
 * than ending in an ellipsis. The harness flag is one unbreakable unit, so a line break can fall after
 * the name but never inside "--cli claude"; the text a reader selects is the command exactly.
 */
export function InstallSnippet({ name }: { name: string }) {
  const harness = useHarness();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const command = installCommand(name, harness);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.warn("[install-snippet] copy failed:", String(err));
    }
  }, [command]);

  return (
    <span className="inline-flex max-w-full items-start gap-1.5 rounded-lg border border-line-subtle bg-raise-1 py-1 pl-2 pr-1 transition-colors duration-150 ease-state hover:border-line">
      <code className="min-w-0 select-text break-words py-0.5 font-mono text-[11.5px] leading-[1.45] text-ink-body [font-variant-ligatures:none]">
        <CommandText command={command} />
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-state hover:bg-raise-3 hover:text-accent-hover"
      >
        {copied ? <CheckIcon size={12} className="text-ok" /> : <CopyIcon size={12} />}
      </button>
    </span>
  );
}

/**
 * In place of the command, for a row `armory install` cannot place (src/lib/installable.ts): it says
 * so plainly and links the source, rather than offering a command that installs nothing (CP143).
 */
export function NoInstall({ source }: { source: string | null }) {
  return (
    <span className="text-[12px] leading-snug text-ink-muted">
      No one-command install
      {source && (
        <>
          {" · "}
          <a
            href={source}
            target="_blank"
            rel="noreferrer noopener"
            className="cursor-pointer text-accent-hover underline underline-offset-4"
          >
            Source
          </a>
        </>
      )}
    </span>
  );
}

/**
 * Where `armory` comes from (CP138 T51): the CLI is not on npm yet, so every page that prints an
 * `armory install …` command says how to get it, beside the Harness selector.
 */
export function CliNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[12px] leading-snug text-ink-muted ${className}`}>
      Needs the armory CLI · not on npm yet, build it from{" "}
      <a
        href="https://github.com/naman10parikh/armory/tree/main/cli"
        target="_blank"
        rel="noreferrer noopener"
        className="cursor-pointer font-mono text-accent-hover underline underline-offset-4"
      >
        cli/
      </a>{" "}
      in the repository
    </p>
  );
}
