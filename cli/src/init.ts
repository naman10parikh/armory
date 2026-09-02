// `armory init` — wire the Armory MCP server into a coding harness in one line, so the agent inside it
// can search and pull from the registry at runtime. Reuses the type×CLI matrix and the MCP merge from
// targets.ts; nothing here knows how a config file is shaped.
import { CLIS, LAYOUTS, detectCli, isCli, mergeMcpServer, resolveMcpPath, type Cli, type McpMergeResult } from "./targets.js";

// The published stdio server. The same entry PLUGIN.md documents for every harness.
export const ARMORY_MCP = { command: "npx", args: ["-y", "armory-mcp"] };

export interface InitOptions {
  cli?: string;
  to?: string;
  force: boolean;
  dryRun: boolean;
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
  const spec = LAYOUTS[cli].mcp;
  const file = resolveMcpPath(root, spec);
  const result = mergeMcpServer(file, spec, "armory", ARMORY_MCP, opts.force, opts.dryRun);
  return { cli, root, result };
}
