// `armory init` — wire the Armory MCP server into a coding harness in one line, so the agent inside it
// can search and pull from the registry at runtime. Reuses the type×CLI matrix and the MCP merge from
// targets.ts; nothing here knows how a config file is shaped.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import { CLIS, LAYOUTS, detectCli, isCli, mergeMcpServer, resolveMcpPath, type Cli, type McpMergeResult } from "./targets.js";

export interface McpEntry {
  command: string;
  args: string[];
}

// The published stdio server. The same entry PLUGIN.md documents for every harness.
export const ARMORY_MCP: McpEntry = { command: "npx", args: ["-y", "armory-mcp"] };
// The same server installed on this machine (npm install -g of its packed tarball, or npm link in a clone).
export const ARMORY_MCP_LOCAL: McpEntry = { command: "armory-mcp", args: [] };

const onPath = (bin: string): boolean =>
  (process.env.PATH ?? "").split(delimiter).some((dir) => dir !== "" && existsSync(join(dir, bin)));

function onNpm(pkg: string): boolean {
  try {
    execFileSync("npm", ["view", pkg, "version"], { stdio: "ignore", timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * The entry that starts the Armory MCP server here. `armory-mcp` is not on npm yet, and `npx -y armory-mcp`
 * answered E404 (CP138 T50), so the npx line is written only once the registry has the package; an installed
 * server wins, and with neither there is nothing that would start.
 */
export function armoryMcpEntry(
  installed: () => boolean = () => onPath("armory-mcp"),
  published: () => boolean = () => onNpm("armory-mcp"),
): McpEntry | null {
  if (installed()) return ARMORY_MCP_LOCAL;
  if (published()) return ARMORY_MCP;
  return null;
}

export const NOT_INSTALLED =
  "armory-mcp is not installed here, and it is not on npm yet. Install it from the repository " +
  "(cd armory-mcp && npm install && npm pack, then npm install -g armory-mcp-*.tgz), then run armory init again.";

export interface InitOptions {
  cli?: string;
  to?: string;
  force: boolean;
  dryRun: boolean;
  /** The server entry to write; when left out, armoryMcpEntry() decides. */
  mcp?: McpEntry;
}

export interface InitReport {
  cli: Cli;
  root: string;
  result: McpMergeResult;
}

// Harness flags (`--claude`, `--cursor`, …) are sugar for `--cli <name>`; the first one set wins.
export function harnessFromFlags(flags: Record<string, unknown>): string | undefined {
  return CLIS.find((c) => flags[c] === true);
}

export function runInit(opts: InitOptions): InitReport {
  const root = opts.to ? opts.to : process.cwd();
  let cli: Cli;
  if (opts.cli) {
    if (!isCli(opts.cli)) throw new Error(`unknown harness "${opts.cli}" (expected ${CLIS.join("|")}).`);
    cli = opts.cli;
  } else {
    cli = detectCli(root) ?? "claude";
  }
  const entry = opts.mcp ?? armoryMcpEntry();
  if (!entry) throw new Error(NOT_INSTALLED);
  const spec = LAYOUTS[cli].mcp;
  const file = resolveMcpPath(root, spec);
  const result = mergeMcpServer(file, spec, "armory", entry, opts.force, opts.dryRun);
  return { cli, root, result };
}
