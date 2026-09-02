#!/usr/bin/env node
// fix-placeholder-descriptions.mjs — replace "<category> tool" placeholder descriptions with the
// repo's own one-liner from GitHub. These 20 rows are the Quartermaster-tested tools, i.e. the most
// visible rows on the site (the whole top-20), and they shipped with the worst descriptions.
//
// Writes to brain/components/**/*.md (the source of truth). catalog.json is derived — rebuild after.
//
//   node scripts/fix-placeholder-descriptions.mjs            # dry run
//   node scripts/fix-placeholder-descriptions.mjs --apply
//
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const PLACEHOLDER = /^[a-z0-9-]+ tool$/i;

// Rows whose source is not a GitHub repo — the one-liner comes from the product's own site.
// Also overrides for GitHub one-liners that are a tagline, an emoji, or "tmux source code" — a
// description says what the thing does, in one plain line.
const HAND = {
  mailtm: "Disposable email inboxes with a free REST API — receive mail without an account.",
  "pipedream-mcp": "Pipedream Connect exposed as MCP — 2,800+ APIs with managed auth, one server.",
  "zapier-mcp": "Zapier's 8,000+ app actions exposed to an agent as MCP tools.",
  bb: "Browse CLI (`bb`) — Stagehand-powered browser automation from the terminal.",
  anon: "Delegated account access for agents — a user grants access without sharing credentials.",
  tmux: "Terminal multiplexer — persistent sessions, split panes, detach and reattach.",
  "cli-anything": "Generates an agent-native CLI for any piece of software; CLI-Hub collects them.",
  opentelemetry: "OpenTelemetry JavaScript SDK — traces, metrics and logs for Node and the browser.",
  "printing-press": "Finds the CLI hidden inside any API and generates it.",
  "stripe-link-cli": "Lets an agent pay with Stripe Link on your behalf — you approve, credentials stay hidden.",
  wrangler: "Wrangler — the CLI for Cloudflare Workers.",
  resend: "Resend's official Node.js SDK — transactional email from code.",
  "coinbase-agentkit": "Coinbase AgentKit — gives an agent an onchain wallet and the actions to use it.",
  arcade: "Arcade — MCP server framework and tool library with managed auth for agent tools.",
};
// Rows whose URL pointed at a parent monorepo and borrowed its stars. `playwright-cli` has its own repo.
// Keyed by path: the skill of the same name points at its own repo and is correct.
const RELINK = { "components/clis-tools/playwright-cli.md": "https://github.com/microsoft/playwright-cli" };

const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8"));
const rows = cat.components.filter((c) => PLACEHOLDER.test(String(c.description || "").trim()) || RELINK[c.path]);

const repoKey = (u) => {
  const m = String(u || "").match(/github\.com\/([^/\s#?]+)\/([^/\s#?)]+)/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/, "")}` : null;
};
const keys = [...new Set(rows.map((c) => repoKey(RELINK[c.path] || c.source_url || c.source_repo)).filter(Boolean))];
const q = `{\n${keys.map((k, i) => { const [o, n] = k.split("/"); return `a${i}: repository(owner:${JSON.stringify(o)}, name:${JSON.stringify(n)}) { nameWithOwner description }`; }).join("\n")}\n}`;
let data = {};
try { data = JSON.parse(execFileSync("gh", ["api", "graphql", "-f", `query=${q}`], { encoding: "utf-8" })).data || {}; }
catch (e) { data = e && e.stdout ? (JSON.parse(e.stdout).data || {}) : {}; }
const desc = new Map(keys.map((k, i) => [k, data[`a${i}`]?.description || null]));

let changed = 0;
for (const c of rows) {
  const file = join(ROOT, "brain", c.path);
  let src = readFileSync(file, "utf-8");
  const orig = src;
  const k = repoKey(RELINK[c.path] || c.source_url || c.source_repo);
  const d = HAND[c.name] || (k && desc.get(k)) || null;
  if (d && PLACEHOLDER.test(String(c.description || "").trim())) {
    src = src.replace(/^description:.*$/m, `description: ${JSON.stringify(d.trim())}`);
  }
  if (RELINK[c.path]) src = src.replace(/^source_url:.*$/m, `source_url: ${JSON.stringify(RELINK[c.path])}`);
  const status = src !== orig ? "fix" : "skip";
  console.log(`${status.padEnd(5)} ${c.name.padEnd(22)} ${d ? d.slice(0, 90) : "(no description found)"}`);
  if (src !== orig) { changed++; if (apply) writeFileSync(file, src); }
}
console.log(`\n${changed} of ${rows.length} rows ${apply ? "WRITTEN — now: node ingest/catalog.mjs" : "would change (dry run; --apply to write)"}`);
