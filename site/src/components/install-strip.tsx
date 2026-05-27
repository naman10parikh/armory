"use client";

import { useState } from "react";
import { CopyCommand } from "./copy-command";

/*
  Per-CLI install strip. A tab switcher across the engram's compatible agents
  shows where the engram lands in each harness, plus the copy-able install
  command. Only renders CLIs the engram actually supports (cli_compat).
*/
const CLI_DEST: Record<string, string> = {
  claude: ".claude/",
  codex: ".codex/",
  cursor: ".cursor/",
  gemini: ".gemini/",
  opencode: ".opencode/",
};

export function InstallStrip({
  slug,
  cliCompat,
}: {
  slug: string;
  cliCompat: string[];
}) {
  const clis = cliCompat.filter((c) => c in CLI_DEST);
  const [active, setActive] = useState(clis[0] ?? "claude");
  const dest = CLI_DEST[active] ?? ".claude/";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          install
        </span>
        {clis.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {clis.map((cli) => (
              <button
                key={cli}
                type="button"
                aria-pressed={active === cli}
                onClick={() => setActive(cli)}
                className={`cursor-pointer rounded-md px-2 py-1 font-mono text-[11px] transition-colors ${
                  active === cli
                    ? "bg-accent-quiet text-accent-hover"
                    : "text-ink-muted hover:text-ink-body"
                }`}
              >
                {cli}
              </button>
            ))}
          </div>
        )}
      </div>
      <CopyCommand command={`npx engram install ${slug} --agent ${active}`} />
      <p className="mt-2 font-mono text-[11px] text-ink-muted">
        lands in{" "}
        <span className="text-accent-hover">
          {dest}
          {slug}
        </span>
      </p>
    </div>
  );
}
