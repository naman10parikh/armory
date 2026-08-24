#!/usr/bin/env node
// adopt-orphan-components.mjs — give catalog-only components a real markdown home.
//
// A few components (the Quartermaster-measured tools: gh, tmux, duckdb, zellij, twilio, …) were
// injected straight into catalog.json and never written as brain/components/**/*.md. Since
// `ingest/catalog.mjs` rebuilds the catalog FROM the markdown, those rows do not merely lose their
// scores on a rebuild — the entire row disappears. They are also the most valuable rows we have,
// because a measured test is the heaviest signal in the ranking.
//
// This writes each orphan out as a proper component file so it survives every future rebuild.
//
//   node scripts/adopt-orphan-components.mjs --from <catalog with the orphans>            # dry run
//   node scripts/adopt-orphan-components.mjs --from <catalog with the orphans> --apply
//
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const from = val("--from", "");
if (!from || has("--help")) {
  console.log("usage: node scripts/adopt-orphan-components.mjs --from <catalog.json> [--apply]");
  process.exit(has("--help") ? 0 : 1);
}

const source = JSON.parse(readFileSync(from, "utf-8")).components || [];
const current = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8")).components || [];
const present = new Set(current.map((c) => `${c.type} ${c.name}`));

// An orphan: it exists in the source catalog, carries real signal, and is NOT in the rebuilt one.
const orphans = source.filter(
  (c) => !present.has(`${c.type} ${c.name}`) && (typeof c.eval_score === "number" || typeof c.mentions === "number"),
);

const yamlStr = (s) => (s == null ? "" : String(s).replace(/\r?\n/g, " ").trim());
const list = (a) => `[${(Array.isArray(a) ? a : []).join(", ")}]`;

// The orphans carry loose types (cli, sdk, api, plugin) that are NOT catalog categories, so writing
// them verbatim creates directories `ingest/catalog.mjs` ignores — the row would vanish all over
// again, just more quietly. Map onto the real 12-category taxonomy.
const CATEGORY = {
  mcp: "mcps", mcps: "mcps",
  cli: "clis-tools", sdk: "clis-tools", api: "clis-tools", plugin: "clis-tools", tool: "clis-tools",
  observability: "observability", eval: "evals", evals: "evals",
  skill: "skills", hook: "hooks", subagent: "subagents", workflow: "workflows",
  memory: "memory", identity: "identity", infrastructure: "infrastructure",
};
const categoryOf = (t) => CATEGORY[String(t || "").toLowerCase()] || "clis-tools";

let written = 0, skipped = 0;
for (const c of orphans) {
  const cat = categoryOf(c.type);
  const dir = join(ROOT, "brain", "components", cat);
  const file = join(dir, `${c.name}.md`);
  if (existsSync(file)) { skipped++; continue; }
  const fm = [
    "---",
    `name: ${c.name}`,
    `type: ${cat}`,
    "description: >",
    `  ${yamlStr(c.description) || `${c.name} — verified by measurement.`}`,
    `source_repo: ${yamlStr(c.source_repo)}`,
    `source_url: ${yamlStr(c.source_url)}`,
    `license: ${yamlStr(c.license) || "unknown"}`,
    `cli_compat: ${list(c.cli_compat)}`,
    `maturity: ${yamlStr(c.maturity) || "stable"}`,
    `stars: ${typeof c.stars === "number" ? c.stars : "null"}`,
    `eval_score: ${typeof c.eval_score === "number" ? c.eval_score : "null"}`,
    `mentions: ${typeof c.mentions === "number" ? c.mentions : "null"}`,
    `verified_at: ${yamlStr(c.verified_at)}`,
    `related: ${list(c.related)}`,
    `tags: ${list(c.tags)}`,
    "---",
    "",
    `# ${c.name}`,
    "",
    yamlStr(c.description) || `${c.name} — installed and verified by measurement.`,
    "",
  ].join("\n");
  if (has("--apply")) { mkdirSync(dir, { recursive: true }); writeFileSync(file, fm); }
  written++;
  console.log(`  ${has("--apply") ? "wrote" : "would write"}  brain/components/${cat}/${c.name}.md  (was type=${c.type}, eval_score=${c.eval_score ?? "-"})`);
}

console.log(`\norphans adopted : ${written}`);
if (skipped) console.log(`already existed : ${skipped}`);
console.log(has("--apply") ? "\nAPPLIED — re-run `node ingest/catalog.mjs`." : "\nDRY RUN — nothing written.");
