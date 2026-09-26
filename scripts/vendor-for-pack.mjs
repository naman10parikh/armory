#!/usr/bin/env node
// Copy the ranking engine and a gzipped catalog into a package's vendor/ folder, so the packed CLI and MCP
// server work outside a clone of this repository (CP138 T50: installed from `npm pack`, both failed to find
// catalog.json and lib/rank.mjs). Each package runs it as `prepack`, so `npm pack` and `npm publish` both do.
//
//   node ../scripts/vendor-for-pack.mjs .     (from cli/ or armory-mcp/)
//
// The gzip is made from the committed catalog.json every time, so a packed catalog is never older than the
// repository it was packed from. The packed data is as of the pack: a newer catalog needs a new release.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = resolve(process.argv[2] ?? process.cwd());
const out = join(pkg, "vendor");

mkdirSync(join(out, "lib"), { recursive: true });
copyFileSync(join(ROOT, "lib", "rank.mjs"), join(out, "lib", "rank.mjs"));
const gz = gzipSync(readFileSync(join(ROOT, "catalog.json")), { level: 9 });
writeFileSync(join(out, "catalog.json.gz"), gz);
// stderr, so `npm pack --json` stays parseable.
console.error(`vendored lib/rank.mjs and catalog.json.gz (${(gz.length / 1e6).toFixed(1)} MB) into ${relative(ROOT, out)}/`);
