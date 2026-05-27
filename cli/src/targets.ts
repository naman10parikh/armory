// Per-CLI target model for `armory install`. Each supported coding harness
// (Claude Code, Cursor, Codex, OpenCode, Gemini CLI) lays its components out in
// a different place. This module is the single source of truth for "where does
// a component of type X go for CLI Y", plus cwd auto-detection and the MCP
// config merge (the one install path that edits JSON instead of dropping files).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export const CLIS = ["claude", "cursor", "codex", "opencode", "gemini"] as const;
export type Cli = (typeof CLIS)[number];

export function isCli(value: string): value is Cli {
  return (CLIS as readonly string[]).includes(value);
}

// File-based component types share one shape: a directory under the CLI's base
// dir and a file extension. `null` means "this CLI has no home for this type".
export interface DirSpec {
  dir: string;
  ext: string;
}

// MCP config is special — it merges into a JSON/TOML file under a top-level key.
export interface McpSpec {
  // Path relative to the target base dir, OR absolute (~ expanded) for global.
  file: string;
  // Top-level object key that holds the server map.
  key: string;
  format: "json" | "toml";
}

export interface CliLayout {
  // Base directory that holds the CLI's component folders (e.g. ".claude").
  base: string;
  mcp: McpSpec;
  skills: DirSpec | null;
  subagents: DirSpec | null;
  "claudemd-rules": DirSpec | null;
  workflows: DirSpec | null;
  hooks: DirSpec | null;
}

// The type×CLI matrix. Paths are relative to the install root (cwd or --to).
// Cursor uses `.mdc` for rules; Claude/Codex/OpenCode/Gemini use plain `.md`.
export const LAYOUTS: Record<Cli, CliLayout> = {
  claude: {
    base: ".claude",
    mcp: { file: ".mcp.json", key: "mcpServers", format: "json" },
    skills: { dir: ".claude/skills", ext: "" },
    subagents: { dir: ".claude/agents", ext: ".md" },
    "claudemd-rules": { dir: ".claude/rules", ext: ".md" },
    workflows: { dir: ".claude/commands", ext: ".md" },
    hooks: { dir: ".claude/hooks", ext: "" },
  },
  cursor: {
    base: ".cursor",
    mcp: { file: ".cursor/mcp.json", key: "mcpServers", format: "json" },
    skills: { dir: ".cursor/skills", ext: "" },
    subagents: { dir: ".cursor/agents", ext: ".md" },
    "claudemd-rules": { dir: ".cursor/rules", ext: ".mdc" },
    workflows: { dir: ".cursor/commands", ext: ".md" },
    hooks: { dir: ".cursor/hooks", ext: "" },
  },
  codex: {
    base: ".codex",
    mcp: { file: ".codex/config.toml", key: "mcp_servers", format: "toml" },
    skills: { dir: ".codex/skills", ext: "" },
    subagents: { dir: ".codex/agents", ext: ".md" },
    "claudemd-rules": { dir: ".codex/rules", ext: ".md" },
    workflows: { dir: ".codex/prompts", ext: ".md" },
    hooks: { dir: ".codex/hooks", ext: "" },
  },
  opencode: {
    base: ".opencode",
    mcp: { file: "opencode.json", key: "mcp", format: "json" },
    skills: { dir: ".opencode/skills", ext: "" },
    subagents: { dir: ".opencode/agent", ext: ".md" },
    "claudemd-rules": { dir: ".opencode/rules", ext: ".md" },
    workflows: { dir: ".opencode/command", ext: ".md" },
    hooks: { dir: ".opencode/hooks", ext: "" },
  },
  gemini: {
    base: ".gemini",
    mcp: { file: ".gemini/settings.json", key: "mcpServers", format: "json" },
    skills: { dir: ".gemini/skills", ext: "" },
    subagents: { dir: ".gemini/agents", ext: ".md" },
    "claudemd-rules": { dir: ".gemini/rules", ext: ".md" },
    workflows: { dir: ".gemini/commands", ext: ".md" },
    hooks: { dir: ".gemini/hooks", ext: "" },
  },
};

// Auto-detect the target CLI by scanning the install root for a CLI's base dir.
// Order is deterministic; Claude wins ties. Returns null if nothing is found
// (callers then default to claude).
export function detectCli(root: string): Cli | null {
  for (const cli of CLIS) {
    if (existsSync(join(root, LAYOUTS[cli].base))) return cli;
  }
  return null;
}

function expandHome(p: string): string {
  return p.startsWith("~") ? join(homedir(), p.slice(1)) : p;
}

// Resolve an MCP config path: absolute/`~` paths are used as-is, otherwise it
// joins under the install root.
export function resolveMcpPath(root: string, spec: McpSpec): string {
  const f = expandHome(spec.file);
  return f.startsWith("/") ? f : join(root, f);
}

export interface McpServerEntry {
  command: string;
  args: string[];
  // env is optional; only written when the source declares one.
  env?: Record<string, string>;
}

export interface McpMergeResult {
  file: string;
  created: boolean;
  alreadyPresent: boolean;
}

// Minimal TOML emitter for the codex `[mcp_servers.<name>]` table shape. We only
// emit the keys we control (command, args, env) so a hand-rolled writer is safe.
function serverToToml(name: string, key: string, entry: McpServerEntry): string {
  const lines = [`[${key}.${name}]`, `command = ${JSON.stringify(entry.command)}`];
  lines.push(`args = [${entry.args.map((a) => JSON.stringify(a)).join(", ")}]`);
  if (entry.env && Object.keys(entry.env).length > 0) {
    const env = Object.entries(entry.env)
      .map(([k, v]) => `${JSON.stringify(k)} = ${JSON.stringify(v)}`)
      .join(", ");
    lines.push(`env = { ${env} }`);
  }
  return `${lines.join("\n")}\n`;
}

// Merge one MCP server entry into the target CLI's config WITHOUT clobbering
// other servers. JSON configs are parsed-merged-rewritten; the TOML (codex)
// path appends a table when absent. `force` overwrites an existing same-name
// entry; otherwise it is left untouched and `alreadyPresent` is reported.
export function mergeMcpServer(
  filePath: string,
  spec: McpSpec,
  name: string,
  entry: McpServerEntry,
  force: boolean,
  dryRun: boolean,
): McpMergeResult {
  const created = !existsSync(filePath);

  if (spec.format === "toml") {
    const existing = created ? "" : readFileSync(filePath, "utf8");
    const tablePresent = new RegExp(`(^|\\n)\\[${spec.key}\\.${name}\\]`).test(existing);
    if (tablePresent && !force) {
      return { file: filePath, created: false, alreadyPresent: true };
    }
    if (!dryRun) {
      mkdirSync(dirname(filePath), { recursive: true });
      const block = serverToToml(name, spec.key, entry);
      // When forcing over an existing table we append a fresh one rather than
      // trying to splice TOML in place; codex reads the last definition.
      const next = existing.trim().length > 0 ? `${existing.trimEnd()}\n\n${block}` : block;
      writeFileSync(filePath, next, "utf8");
    }
    return { file: filePath, created, alreadyPresent: false };
  }

  // JSON path (claude / cursor / opencode / gemini).
  let config: Record<string, unknown> = {};
  if (!created) {
    const raw = readFileSync(filePath, "utf8").trim();
    if (raw.length > 0) {
      try {
        config = JSON.parse(raw) as Record<string, unknown>;
      } catch (err) {
        throw new Error(`existing ${filePath} is not valid JSON: ${(err as Error).message}`);
      }
    }
  }
  const servers = (config[spec.key] as Record<string, unknown> | undefined) ?? {};
  if (servers[name] !== undefined && !force) {
    return { file: filePath, created: false, alreadyPresent: true };
  }
  servers[name] = entry as unknown;
  config[spec.key] = servers;
  if (!dryRun) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }
  return { file: filePath, created, alreadyPresent: false };
}
