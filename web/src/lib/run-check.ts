// The MCP command the detail page may show, checked against the registry (CP143).
//
// A config that runs `npx -y <name>` or `uvx <name>` downloads whatever the public registry holds under
// that name, so the page shows one only when scripts/check-installs.mjs found the package published
// from the component's own GitHub repository (a ghcr.io image: its owner). The command is read from the
// component's note in the order `armory install` reads it: the install section, then the description,
// then the rest. A command that runs local files (node, python, uv run) needs no registry and is shown
// as written, as before.
import "server-only";
import checks from "@/data/install-check.json";
import { DOWNLOADING, parseRunCommand, type RunCommand } from "./install-targets";

interface CheckRow {
  command: string;
  package: string | null;
  match: boolean;
}

const ROWS = (checks as { rows: Record<string, CheckRow> }).rows;

// The "How to install" section, or the whole body when a note has none (cli/src/catalog.ts
// extractInstallSnippet), so the page and `armory install` pick the same command.
function installSection(body: string): string {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{1,6}\s+how to install/i.test(l));
  if (start === -1) return body;
  const out: string[] = [];
  for (let i = start + 1; i < lines.length && !/^#{1,6}\s+\S/.test(lines[i]); i += 1) out.push(lines[i]);
  return out.join("\n");
}

// The package or image a downloading command fetches, as scripts/check-installs.mjs names it.
function packageOf(run: RunCommand): string | null {
  const first = (flags: string[]): string | null => {
    for (let i = 0; i < run.args.length; i += 1) {
      const a = run.args[i];
      if (flags.includes(a)) return run.args[i + 1] ?? null;
      const eq = flags.find((f) => a.startsWith(`${f}=`));
      if (eq) return a.slice(eq.length + 1);
      if (!a.startsWith("-")) return a;
    }
    return null;
  };
  if (run.command === "npx") {
    const raw = first(["-p", "--package"]);
    return raw && (raw.startsWith("@") ? raw.replace(/^(@[^/@]+\/[^@]+)@.*$/, "$1") : raw.replace(/@.*$/, ""));
  }
  if (run.command === "uvx") {
    const raw = first(["--from"]);
    return raw && raw.replace(/\[.*$/, "").replace(/[=<>!~@].*$/, "");
  }
  if (run.command === "docker") return run.args.find((a) => /^ghcr\.io\/[^/\s]+\/\S+$/i.test(a)) ?? null;
  return null;
}

/**
 * The command to show for an MCP row, or null when there is none the page can stand behind. A checked
 * package is shown in its plain form (`npx -y <pkg>`, `uvx <pkg>`, the docker line up to its image), so
 * prose that followed the command in a note never lands in a config.
 */
export function checkedRun(type: string, name: string, description: string, body: string): RunCommand | null {
  const run = parseRunCommand(installSection(body)) ?? parseRunCommand(description) ?? parseRunCommand(body);
  if (!run) return null;
  if (!DOWNLOADING.has(run.command)) return run;
  const pkg = packageOf(run);
  const row = ROWS[`${type}/${name}`];
  // A note edited after the last check names a package the check never saw: not shown until re-checked.
  if (!pkg || !row?.match || row.package !== pkg || row.command !== run.command) return null;
  if (run.command === "npx") return { command: "npx", args: ["-y", pkg] };
  if (run.command === "uvx") return { command: "uvx", args: [pkg] };
  return { command: run.command, args: run.args.slice(0, run.args.indexOf(pkg) + 1) };
}
