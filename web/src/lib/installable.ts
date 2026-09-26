// Can `armory install <name>` place this component? (CP143)
//
// The site used to print `armory install <name>` beside every row, and for most rows the command
// installs nothing: a memory system or a CLI installs with its own tool, and a skills repository is
// many files, not one. This mirrors what cli/src/install.ts actually does, so a row promises the
// command only when the CLI will place something:
//   · an MCP server whose note names a command that downloads a package checked against its registry
//   · a skill that points at a file or a folder inside a repository
//   · a subagent, rule, command or hook that points at one file
//   · either of the last two pointing at a whole repository whose note links a file (or, for a skill,
//     a folder) in it from its "How to install" section
// The MCP check and the linked files come from src/data/install-check.json (scripts/check-installs.mjs),
// so this reads no files. Everything else says, in plain words, that there is no one-command install.
import checks from "@/data/install-check.json";

interface InstallCheck {
  rows: Record<string, { match: boolean }>;
  named_files: Record<string, { path: string; file: boolean }>;
}

const { rows: CHECKED, named_files: NAMED } = checks as InstallCheck;
const GITHUB = /^https?:\/\/(?:www\.)?github\.com\/[^/\s]+\/[^/\s#?]+(?:\/(blob|tree)\/)?/i;
const ONE_FILE = new Set(["subagents", "claudemd-rules", "workflows", "hooks"]);

/** True when `armory install` places this component. */
export function isInstallable(type: string, name: string, url: string | null): boolean {
  if (type === "mcps") return CHECKED[`mcps/${name}`]?.match === true;
  const m = GITHUB.exec(url ?? "");
  if (!m) return false;
  const kind = m[1]?.toLowerCase();
  const named = NAMED[`${type}/${name}`];
  if (type === "skills") return Boolean(kind) || Boolean(named);
  if (ONE_FILE.has(type)) return kind === "blob" || (!kind && named?.file === true);
  return false;
}
