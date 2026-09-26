"use client";

/*
  The Stack Builder's three client pieces (CP143 upgrade 12). The builder itself is a plain GET form
  rendered on the server, so a share URL (/stack?memory=getzep-zep) reproduces the picks for anyone,
  agents included; these only add conveniences on top.
    PickSelect   — submits the form the moment a pick changes (the Build button covers no-JS)
    StackCommand — the chosen picks as ONE shell command, following the page's harness selector
    CopyText     — copies a line of text (the share link)
*/
import { useCallback, useState } from "react";
import { installCommand } from "@/lib/install-targets";
import { CommandText } from "./command-text";
import { CheckIcon, CopyIcon } from "./icons";
import { useHarness } from "./install-snippet";

export interface PickOption {
  value: string;
  label: string;
  /** The option's role ("The pick", "Runners-up"); consecutive options share one group. "" = no group. */
  group: string;
}

/** Consecutive options with the same group, in order. */
function grouped(options: readonly PickOption[]): { group: string; options: PickOption[] }[] {
  const out: { group: string; options: PickOption[] }[] = [];
  for (const o of options) {
    const last = out[out.length - 1];
    if (last && last.group === o.group) last.options.push(o);
    else out.push({ group: o.group, options: [o] });
  }
  return out;
}

export function PickSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: readonly PickOption[];
}) {
  return (
    <select
      name={name}
      aria-label={`${label} pick`}
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="w-full max-w-full cursor-pointer truncate rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 text-[13px] font-medium text-ink-hi transition-colors duration-150 ease-state hover:border-accent-line"
    >
      {grouped(options).map((g) => {
        const items = g.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ));
        return g.group ? (
          <optgroup key={g.group} label={g.group}>
            {items}
          </optgroup>
        ) : (
          items
        );
      })}
    </select>
  );
}

function useCopy(text: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      })
      .catch((err: unknown) => console.warn("[stack-builder] copy failed:", String(err)));
  }, [text]);
  return [copied, copy];
}

function CopyButton({ copied, onCopy, label }: { copied: boolean; onCopy: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : label}
      className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink-muted transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
    >
      {copied ? <CheckIcon size={13} className="text-ok" /> : <CopyIcon size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export interface StackPick {
  name: string;
  /** Whether `armory install` places it (src/lib/installable.ts). */
  installable: boolean;
  source: string | null;
}

/**
 * One command that installs every chosen pick Armory can install: one `armory install` per line,
 * joined with `&& \`, so it pastes as a single command and stops at the first failure. The CLI takes
 * one name per call. Picks with no one-command install are listed under it with their source (CP143).
 */
export function StackCommand({ picks }: { picks: readonly StackPick[] }) {
  const harness = useHarness();
  const names = picks.filter((p) => p.installable).map((p) => p.name);
  const manual = picks.filter((p) => !p.installable);
  const lines = names.map((n) => installCommand(n, harness));
  const text = lines.join(" && \\\n");
  const [copied, copy] = useCopy(text);
  if (picks.length === 0) {
    return <p className="text-[13px] text-ink-muted">No picks selected</p>;
  }
  return (
    <>
      {names.length > 0 && (
        <CommandBlock picks={picks.length} names={names} lines={lines} copied={copied} onCopy={copy} />
      )}
      {manual.length > 0 && (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
          {names.length > 0 ? "Not in the command" : "None of these picks installs with one command"}, set{" "}
          {manual.length === 1 ? "it" : "them"} up from the source:{" "}
          {manual.map((p, i) => (
            <span key={p.name}>
              {i > 0 && ", "}
              {p.source ? (
                <a
                  href={p.source}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="cursor-pointer text-accent-hover underline underline-offset-4"
                >
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </span>
          ))}
        </p>
      )}
    </>
  );
}

function CommandBlock({
  picks,
  names,
  lines,
  copied,
  onCopy,
}: {
  picks: number;
  names: readonly string[];
  lines: readonly string[];
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-line-subtle bg-raise-1 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[12.5px] text-ink-muted">
          {/* The heading above already says "one command"; the caption counts (CP138 T51). */}
          {picks} {picks === 1 ? "pick" : "picks"} · {names.length} in this command
        </span>
        <CopyButton copied={copied} onCopy={onCopy} label="Copy the command" />
      </div>
      {/* One line per install; on a phone a line wraps at its spaces, never out of view and
          never between "--" and "cli" (CP143 upgrade 6). Copy takes `text` itself. */}
      <pre className="whitespace-normal break-words font-mono text-[12px] leading-[1.6] text-ink-body [font-variant-ligatures:none]">
        <code>
          {lines.map((line, i) => (
            <span key={line} className="block">
              <CommandText command={line} />
              {i < lines.length - 1 && (
                <>
                  {" "}
                  <span className="whitespace-nowrap">&amp;&amp; \</span>
                </>
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function CopyText({ text, label }: { text: string; label: string }) {
  const [copied, copy] = useCopy(text);
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <code className="min-w-0 break-all font-mono text-[12px] text-ink-body">{text}</code>
      <CopyButton copied={copied} onCopy={copy} label={label} />
    </span>
  );
}
