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
import { CheckIcon, CopyIcon } from "./icons";
import { useHarness } from "./install-snippet";

export interface PickOption {
  value: string;
  label: string;
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
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
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

/**
 * One command that installs every chosen pick: one `armory install` per line, joined with `&& \`,
 * so it pastes as a single command and stops at the first failure. The CLI takes one name per call.
 */
export function StackCommand({ names }: { names: readonly string[] }) {
  const harness = useHarness();
  const lines = names.map((n) => installCommand(n, harness));
  const text = lines.join(" && \\\n");
  const [copied, copy] = useCopy(text);
  if (names.length === 0) {
    return <p className="text-[13px] text-ink-muted">No picks selected</p>;
  }
  return (
    <div className="rounded-xl border border-line-subtle bg-raise-1 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[12.5px] text-ink-muted">
          {names.length} {names.length === 1 ? "install" : "installs"}, one command
        </span>
        <CopyButton copied={copied} onCopy={copy} label="Copy the command" />
      </div>
      {/* Wraps on a phone rather than scrolling a line out of view (CP143 upgrade 6). */}
      <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.6] text-ink-body [font-variant-ligatures:none]">
        <code>{text}</code>
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
