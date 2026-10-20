#!/usr/bin/env node
// Makes `npx -y -p github:naman10parikh/armory armory --help` (and `armory-mcp`) work straight from GitHub.
// npm runs this `prepare` script after installing a git dependency. It builds the CLI and the MCP server when
// their dist/ folders are missing, and writes catalog.json.gz beside catalog.json, so the installed package
// (see "files" in package.json) carries everything both bins read. In a clone that is already built it does
// nothing. It never fails an install: a problem prints a warning instead.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function build(pkg) {
  if (existsSync(join(ROOT, pkg, "dist", "index.js"))) return;
  const tsc = require.resolve("typescript/bin/tsc");
  execFileSync(process.execPath, [tsc, "-p", join(ROOT, pkg, "tsconfig.json")], { stdio: "inherit" });
}

try {
  build("cli");
  build("armory-mcp");
  const catalog = join(ROOT, "catalog.json");
  const gz = join(ROOT, "catalog.json.gz");
  if (existsSync(catalog) && !existsSync(gz)) writeFileSync(gz, gzipSync(readFileSync(catalog)));
} catch (err) {
  console.warn(`armory prepare: skipped (${err instanceof Error ? err.message : err}). In a clone, run pnpm build.`);
}
