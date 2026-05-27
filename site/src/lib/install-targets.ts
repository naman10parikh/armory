// Client-safe mirror of the CLI's install model (cli/src/targets.ts +
// install.ts). The CLI does the real fetch-and-place; here we DERIVE the exact
// command + the raw config/snippet it writes, from catalog fields ONLY. No
// node:fs, no network. LAYOUTS is kept identical to cli/src/targets.ts.
import type { Engram, EngramType } from "./types";

// The six target harnesses the UI offers. The first five are CLI-native (they
// appear in cli_compat and the CLI installs to them directly). Hermes is offered
// as a universal target — markdown components drop into its convention dir.
export const HARNESSES = [
  "claude",
  "cursor",
  "codex",
  "opencode",
  "gemini",
  "hermes",
] as const;
export type Harness = (typeof HARNESSES)[number];

export const HARNESS_LABEL: Record<Harness, string> = {
  claude: "Claude Code",
  cursor: "Cursor",
  codex: "Codex",
  opencode: "OpenCode",
  gemini: "Gemini",
  hermes: "Hermes",
};

// The five CLI-native harnesses the `armory` CLI installs to directly. Hermes is
// supported by the UI as a universal drop target but is not a CLI `--cli` value.
export const CLI_NATIVE: ReadonlySet<Harness> = new Set([
  "claude",
  "cursor",
  "codex",
  "opencode",
  "gemini",
]);

interface DirSpec {
  dir: string;
  ext: string;
}

interface McpSpec {
  file: string;
  key: string;
  format: "json" | "toml";
}

interface HarnessLayout {
  base: string;
  mcp: McpSpec;
  skills: DirSpec | null;
  subagents: DirSpec | null;
  "claudemd-rules": DirSpec | null;
  workflows: DirSpec | null;
  hooks: DirSpec | null;
}

// IDENTICAL to cli/src/targets.ts LAYOUTS, plus a Hermes row (generic .hermes/
// convention — Claude-compatible markdown layout, JSON mcp config).
const md = (dir: string, ext = ".md"): DirSpec => ({ dir, ext });
const jsonMcp = (file: string, key = "mcpServers"): McpSpec => ({ file, key, format: "json" });

export const LAYOUTS: Record<Harness, HarnessLayout> = {
  claude: {
    base: ".claude",
    mcp: jsonMcp(".mcp.json"),
    skills: md(".claude/skills", ""),
    subagents: md(".claude/agents"),
    "claudemd-rules": md(".claude/rules"),
    workflows: md(".claude/commands"),
    hooks: md(".claude/hooks", ""),
  },
  cursor: {
    base: ".cursor",
    mcp: jsonMcp(".cursor/mcp.json"),
    skills: md(".cursor/skills", ""),
    subagents: md(".cursor/agents"),
    "claudemd-rules": md(".cursor/rules", ".mdc"),
    workflows: md(".cursor/commands"),
    hooks: md(".cursor/hooks", ""),
  },
  codex: {
    base: ".codex",
    mcp: { file: ".codex/config.toml", key: "mcp_servers", format: "toml" },
    skills: md(".codex/skills", ""),
    subagents: md(".codex/agents"),
    "claudemd-rules": md(".codex/rules"),
    workflows: md(".codex/prompts"),
    hooks: md(".codex/hooks", ""),
  },
  opencode: {
    base: ".opencode",
    mcp: jsonMcp("opencode.json", "mcp"),
    skills: md(".opencode/skills", ""),
    subagents: md(".opencode/agent"),
    "claudemd-rules": md(".opencode/rules"),
    workflows: md(".opencode/command"),
    hooks: md(".opencode/hooks", ""),
  },
  gemini: {
    base: ".gemini",
    mcp: jsonMcp(".gemini/settings.json"),
    skills: md(".gemini/skills", ""),
    subagents: md(".gemini/agents"),
    "claudemd-rules": md(".gemini/rules"),
    workflows: md(".gemini/commands"),
    hooks: md(".gemini/hooks", ""),
  },
  hermes: {
    base: ".hermes",
    mcp: jsonMcp(".hermes/mcp.json"),
    skills: md(".hermes/skills", ""),
    subagents: md(".hermes/agents"),
    "claudemd-rules": md(".hermes/rules"),
    workflows: md(".hermes/commands"),
    hooks: md(".hermes/hooks", ""),
  },
};

// --- run-command derivation (client-safe port of fetch.ts parseRunCommand) ----

export interface RunCommand {
  command: string;
  args: string[];
}

const LAUNCHERS = [
  "npx",
  "uvx",
  "uv",
  "docker",
  "bunx",
  "pnpm",
  "deno",
  "node",
  "python",
  "python3",
];

// Scan free text (a description) for the first plausible MCP run-command, the
// same heuristic the CLI uses. Many migrated MCP descriptions embed
// `Install: \`npx -y <pkg>\``, so we can surface the real command client-side.
export function parseRunCommand(text: string): RunCommand | null {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/`/g, "").replace(/^\s*\$\s*/, "").trim();
    const tokens = line.split(/\s+/).filter(Boolean);
    const startIdx = tokens.findIndex((t) => LAUNCHERS.includes(t));
    if (startIdx === -1) continue;
    const slice = tokens
      .slice(startIdx)
      .filter((t) => t !== "&&" && !t.startsWith("#"))
      .map((t) => t.replace(/^["'`]+/, "").replace(/["'`.,;)]+$/, ""));
    const command = slice[0];
    const args = slice.slice(1).filter((a) => a.length > 0 && !a.includes("&&"));
    if (args.length === 0 && command !== "docker") continue;
    return { command, args };
  }
  return null;
}

// Best-effort npm package guess for an MCP whose description has no explicit
// command: the CLI reads the repo's package.json at runtime; client-side we fall
// back to the repo name (the common npm-name === repo-name convention).
function guessNpmName(engram: Engram): string | null {
  if (engram.source_repo.includes("/")) {
    const repo = engram.source_repo.split("/")[1]?.replace(/\.git$/, "");
    if (repo) return repo;
  }
  return null;
}

// Resolve the run-command shown for an MCP, mirroring installMcp's order:
// explicit command in the description → npm-name fallback → null (manual).
export function deriveRunCommand(engram: Engram): RunCommand | null {
  const fromDesc = parseRunCommand(engram.description);
  if (fromDesc) return fromDesc;
  const npm = guessNpmName(engram);
  if (npm) return { command: "npx", args: ["-y", npm] };
  return null;
}

// --- snippet rendering --------------------------------------------------------

export interface InstallSnippet {
  command: string; // the shell command the user runs (the headline)
  file: string; // the file the install touches, relative to project root
  verb: string; // short label for what `command` does ("merges into", "writes")
  config: string | null; // raw config/snippet written (JSON/TOML/path note) or null
  configLang: "json" | "toml" | "text" | null;
  // True when the run-command could not be derived (manual setup needed).
  manual: boolean;
}

// The `armory install` invocation. CLI-native harnesses get a `--cli` flag; the
// universal Hermes target is shown with `--to .hermes` so the command is real.
export function installCommand(name: string, harness: Harness): string {
  if (CLI_NATIVE.has(harness)) return `armory install ${name} --cli ${harness}`;
  return `armory install ${name} --to .`; // Hermes: dropped via --to root, lands in .hermes/
}

// Render the MCP server-config block exactly as mergeMcpServer would write it.
function mcpConfig(
  engram: Engram,
  layout: HarnessLayout,
): { config: string | null; lang: "json" | "toml"; manual: boolean } {
  const run = deriveRunCommand(engram);
  if (!run) return { config: null, lang: layout.mcp.format, manual: true };

  if (layout.mcp.format === "toml") {
    const args = run.args.map((a) => JSON.stringify(a)).join(", ");
    const block = `[${layout.mcp.key}.${engram.name}]\ncommand = ${JSON.stringify(
      run.command,
    )}\nargs = [${args}]`;
    return { config: block, lang: "toml", manual: false };
  }

  const json = {
    [layout.mcp.key]: {
      [engram.name]: { command: run.command, args: run.args },
    },
  };
  return { config: JSON.stringify(json, null, 2), lang: "json", manual: false };
}

// Build the full install snippet for one engram × harness. Pure — deterministic
// from catalog fields. Mirrors the switch in runInstall().
export function buildSnippet(engram: Engram, harness: Harness): InstallSnippet {
  const layout = LAYOUTS[harness];
  const command = installCommand(engram.name, harness);
  const type = engram.type as EngramType;

  if (type === "mcps") {
    const { config, lang, manual } = mcpConfig(engram, layout);
    return {
      command,
      file: layout.mcp.file,
      verb: manual ? "configure manually in" : "merges a server entry into",
      config,
      configLang: lang,
      manual,
    };
  }

  // File-based types: skills (dir), subagents/rules/workflows (single file),
  // hooks (file + settings registration).
  const fileSpec =
    type === "skills" ? layout.skills
    : type === "subagents" ? layout.subagents
    : type === "claudemd-rules" ? layout["claudemd-rules"]
    : type === "workflows" ? layout.workflows
    : type === "hooks" ? layout.hooks
    : null;

  if (fileSpec) {
    const dest =
      type === "skills"
        ? `${fileSpec.dir}/${engram.name}/SKILL.md`
        : `${fileSpec.dir}/${engram.name}${fileSpec.ext}`;
    const note =
      type === "hooks"
        ? `# fetches the hook script into:\n${dest}\n# then register it in your settings.json "hooks" block.`
        : `# fetches the source and writes it to:\n${dest}`;
    return {
      command,
      file: dest,
      verb: type === "skills" ? "writes the skill into" : "writes the file to",
      config: note,
      configLang: "text",
      manual: false,
    };
  }

  // Types with no install mechanism (identity, memory, clis-tools, evals,
  // observability, infrastructure): print-only, like installPrintOnly.
  return {
    command,
    file: layout.base,
    verb: "installs via its own command — see source",
    config: engram.source_url
      ? `# no auto-install for ${type} components.\n# follow the setup at:\n${engram.source_url}`
      : null,
    configLang: "text",
    manual: true,
  };
}

// A follow-up note for the active harness, mirroring the CLI's followUp[].
export function followUpNote(engram: Engram, harness: Harness): string | null {
  if (engram.type === "mcps")
    return `Restart ${HARNESS_LABEL[harness]} to load the MCP server.`;
  if (engram.type === "hooks")
    return "Add the hook entry to settings.json, then restart the harness.";
  return null;
}
