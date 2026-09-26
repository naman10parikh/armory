// Armory test pyramid — L1 unit + contract + chaos, zero-dep (node:test).
// Run: node --test ingest/  (also runs in CI via .github/workflows/ci.yml and is a
// pre-promote gate). Complements ingest/test-gate.mjs (full-catalog behavioral gate)
// and armory-mcp's vitest. Nothing ships unless these pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, TYPES } from "./catalog.mjs";
import { gradeComponent, stackPickGaps } from "./test-gate.mjs";
import { SHELF_FIT, SHELF_MOVES, SHELVES, componentsOf, computeRows, facetsOf, fitsShelf, rankRows } from "../lib/rank.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// A valid component stub (mirrors a real promoted brain entry).
const GOOD = `---
name: kaggle-mcp-server
type: mcps
description: >
  Enables AI assistants to interact with Kaggle competitions — list, download, submit.
source_url: https://github.com/Dishant27/kaggle-MCP
license: unknown
tags: [glama, mcp]
---
## What it is
Enables AI assistants to interact with Kaggle competitions, including submissions.
`;

// ── L1 unit: parseFrontmatter ────────────────────────────────────────────────
test("parseFrontmatter extracts the contract fields", () => {
  const fm = parseFrontmatter(GOOD);
  assert.equal(fm.name, "kaggle-mcp-server");
  assert.equal(fm.type, "mcps");
  assert.ok(String(fm.description).length > 12, "description parsed");
});

// ── L1 unit: TYPES is the 12 canonical types ─────────────────────────────────
test("TYPES is the 12 canonical component types", () => {
  assert.ok(Array.isArray(TYPES));
  assert.equal(TYPES.length, 12, "exactly 12 types");
  for (const t of ["mcps", "skills", "subagents", "hooks", "claudemd-rules", "workflows"]) {
    assert.ok(TYPES.includes(t), `TYPES includes ${t}`);
  }
});

// ── L1 unit: gradeComponent (the Hamel gate logic) ───────────────────────────
test("gradeComponent passes a well-formed component (no L1/L2 failures)", () => {
  const { l1, l2 } = gradeComponent(GOOD);
  assert.deepEqual(l1, [], "no functional failures");
  assert.deepEqual(l2, [], "no behavioral failures");
});

test("gradeComponent (L1) rejects an invalid type", () => {
  const bad = GOOD.replace("type: mcps", "type: not-a-real-type");
  const { l1 } = gradeComponent(bad);
  assert.ok(l1.some((f) => /type/.test(f)), "flags bad type");
});

test("gradeComponent (L1) rejects a non-slug name", () => {
  const bad = GOOD.replace("name: kaggle-mcp-server", "name: Not A Slug!");
  const { l1 } = gradeComponent(bad);
  assert.ok(l1.some((f) => /slug/.test(f)), "flags bad slug");
});

test("gradeComponent (L2) flags a husk (thin description)", () => {
  const husk = GOOD.replace(/description: >[\s\S]*?\n(?=\w)/, "description: x\n");
  const { l2 } = gradeComponent(husk);
  assert.ok(l2.length > 0, "flags behavioral drift / husk");
});

// ── Chaos: garbage input must not throw ──────────────────────────────────────
test("gradeComponent does not throw on garbage / empty input", () => {
  for (const junk of ["", "no frontmatter here", "---\nbroken", "{}"]) {
    assert.doesNotThrow(() => gradeComponent(junk));
    const r = gradeComponent(junk);
    assert.ok(Array.isArray(r.l1) && Array.isArray(r.l2), "returns the {l1,l2} shape");
  }
});

// ── Contract: catalog.json is the shape armory-mcp + web depend on ───────────
test("catalog.json honors the generator↔consumer contract", () => {
  const p = join(ROOT, "catalog.json");
  if (!existsSync(p)) return; // catalog is generated; skip if absent in a bare checkout
  const c = JSON.parse(readFileSync(p, "utf8"));
  assert.equal(typeof c.counts?.total, "number", "counts.total is a number");
  assert.ok(Array.isArray(c.components), "components[] array exists (NOT the legacy 'engrams' key)");
  assert.ok(!("engrams" in c), "the legacy 'engrams' key is gone");
  assert.equal(c.counts.total, c.components.length, "counts.total matches components length");
  for (const item of c.components.slice(0, 200)) {
    assert.ok(item.name && item.type && item.path, "each component has name+type+path");
    assert.ok(TYPES.includes(item.type), `type ${item.type} is one of the 12`);
  }
});

// ── Shelf fit: Sandbox, Tools and Dispatch list only the rows made for their job ─
const fit = (name, component, description) => fitsShelf({ name, component, description });

test("fitsShelf keeps each gated shelf's own kind and drops the strangers filed beside it", () => {
  assert.ok(fit("e2b-sandbox", "infra", "Firecracker microVMs for untrusted code"), "a sandbox is a sandbox");
  assert.ok(!fit("browser-use", "infra", "Python library that makes web browsers accessible to AI agents"), "a browser library is not");
  assert.ok(!fit("browser-use", "infrastructure", "Python library for browsers"), "raw folder names resolve like rankRows");
  assert.ok(fit("gh", "cli", "GitHub's official command line tool"), "a command-line tool is a tool");
  assert.ok(!fit("openai-codex", "cli", "Lightweight coding agent that runs in your terminal"), "a whole coding agent is not");
  assert.ok(fit("agent-reach", "cli", "Give your AI agent eyes to see the internet. One CLI."), "'your AI agent' is an audience, not a kind");
  assert.ok(fit("n8n-io-n8n", "workflow", "Fair-code workflow automation platform"), "an orchestrator is dispatch");
  assert.ok(!fit("the-ralph-playbook", "workflow", "A detailed guide to the Ralph Wiggum technique for autonomous coding loops"), "a guide is not");
  assert.ok(!fit("approvals", "workflow", "Adds a human-in-the-loop approval step"), "human-in-the-loop is not a loop");
  assert.ok(fit("anything", "memory", ""), "a component with no rule lists every row");
});

test("fitsShelf: the allow-list admits rows the words miss; the deny-list drops rows they let in", () => {
  assert.ok(fit("pocketflow", "workflow", "100-line LLM framework that lets agents build agents"));
  assert.ok(fit("crawl4ai", "cli", "Open-source async web crawling library"));
  assert.ok(!fit("system-dynamics-modeler", "workflow", "Model complex system dynamics with feedback loops"));
});

test("every allow- and deny-listed name is a row of its component in catalog.json", () => {
  const p = join(ROOT, "catalog.json");
  if (!existsSync(p)) return;
  const rows = computeRows(JSON.parse(readFileSync(p, "utf8")).components);
  for (const [component, rule] of Object.entries(SHELF_FIT)) {
    if (component === "tool") continue; // shares the cli rule; the catalog has no tool rows
    for (const name of [...rule.allow, ...(rule.deny ?? [])]) {
      assert.ok(rows.some((r) => r.name === name && r.component === component), `${name} is a ${component} row`);
    }
  }
});

test("rankRows lists only the rows that fit a gated component, counts the rest in fit, and facets agree", () => {
  const rows = computeRows([
    { name: "sbx", type: "infrastructure", description: "Sandboxes for running AI-generated code", stars: 10, source_url: "https://github.com/a/sbx" },
    { name: "llm-engine", type: "infrastructure", description: "LLM inference in C/C++", stars: 20, source_url: "https://github.com/a/llm-engine" },
    { name: "notes", type: "memory", description: "Agent memory", stars: 5, source_url: "https://github.com/a/notes" },
  ]);
  const lb = rankRows(rows, { component: "sandboxes" });
  assert.deepEqual(lb.items.map((i) => i.name), ["sbx"]);
  assert.deepEqual(lb.fit, { purpose: SHELF_FIT.infra.purpose, filed: 2, left_out: 1 });
  assert.equal(rankRows(rows, { component: "memory" }).fit, null, "an ungated component says nothing");
  assert.equal(rankRows(rows, {}).total, 3, "an unfiltered rank still lists every row");
  assert.equal(lb.facets.components.find((f) => f.key === "infra")?.count, 1, "the facet counts what the filter lists");
});

// ── Shelf moves and shelf names (CP138 PR E) ─────────────────────────────────
test("SHELF_MOVES lists a row on the shelf of its job and keeps its type, so its address holds", () => {
  const row = (name, type, description) => ({ name, type, description, stars: 10, source_url: `https://github.com/a/${name}` });
  const rows = computeRows([
    row("ruflo", "clis-tools", "Agent meta-harness for coordinated multi-agent swarms"),
    row("container-use", "clis-tools", "Containerized environments for coding agents"),
    row("snyk-cli", "mcps", "Snyk CLI scans and monitors your projects"),
    row("container-use", "mcps", "A directory listing of the same project"),
  ]);
  const by = (type, name) => rows.find((r) => r.type === type && r.name === name);
  assert.equal(by("clis-tools", "ruflo").component, "workflow", "the type stays clis-tools; the row lists on Dispatch");
  assert.equal(by("clis-tools", "container-use").component, "infra");
  assert.equal(by("mcps", "snyk-cli").component, "cli");
  assert.equal(by("mcps", "container-use").component, "mcp", "keyed type/name: the same name under another type stays put");
  for (const r of rows) assert.ok(r.fits, `${r.type}/${r.name} fits where it is listed`);
  assert.ok(fitsShelf({ name: "ruflo", type: "clis-tools", component: "workflow" }), "a moved row fits by decision, whatever its words");
  assert.deepEqual(rankRows(rows, { component: "dispatch" }).items.map((i) => i.name), ["ruflo"]);
  assert.deepEqual(rankRows(rows, { component: "sandbox" }).items.map((i) => i.name), ["container-use"]);
});

test("every SHELF_MOVES row is in catalog.json under the type it is keyed by", () => {
  const p = join(ROOT, "catalog.json");
  if (!existsSync(p)) return;
  const rows = computeRows(JSON.parse(readFileSync(p, "utf8")).components);
  for (const [key, component] of Object.entries(SHELF_MOVES)) {
    const [type, name] = key.split("/");
    const row = rows.find((r) => r.type === type && r.name === name);
    assert.ok(row, `${key} is in the catalog (a rename or removal must update SHELF_MOVES)`);
    assert.equal(row.component, component, `${key} is listed under ${component}`);
  }
});

test("SHELVES names the same shelves and components as web/src/data/stack.json", () => {
  const stack = JSON.parse(readFileSync(join(ROOT, "web/src/data/stack.json"), "utf8"));
  assert.deepEqual(SHELVES, Object.fromEntries(stack.components.map((c) => [c.slug, c.aggregates])));
});

test("rankRows takes a shelf name: tools, sandbox and dispatch list their shelves; a component key lists its own rows", () => {
  const row = (name, type, description) => ({ name, type, description, stars: 10, source_url: `https://github.com/a/${name}` });
  const rows = computeRows([
    row("gh", "clis-tools", "GitHub's official command line tool"),
    row("sbx", "infrastructure", "Sandboxes for running AI-generated code"),
    row("n8n", "workflows", "Workflow automation platform"),
    row("rule", "claudemd-rules", "Coding rules"),
    row("card", "identity", "An agent card"),
  ]);
  const names = (component) => rankRows(rows, { component }).items.map((i) => i.name);
  assert.deepEqual(names("tools"), ["gh"], "`armory rank -c tools` returned 0 rows before");
  assert.deepEqual(names("tool"), ["gh"], "the help has always offered tool");
  assert.deepEqual(names("sandbox"), ["sbx"]);
  assert.deepEqual(names("dispatch"), ["n8n"]);
  assert.equal(rankRows(rows, { component: "tools" }).fit?.purpose, SHELF_FIT.cli.purpose, "the shelf keeps its gate");
  assert.deepEqual(names("identity"), ["card"], "a component key lists its own rows, so a leaderboard chip's count holds");
  assert.deepEqual(componentsOf("tools"), ["cli", "tool"]);
  assert.deepEqual(componentsOf("clis-tools"), ["cli"], "a catalog type still resolves");
});

test("rankRows names the components its filter lists, the chips the leaderboard lights", () => {
  const row = (name, type, description) => ({ name, type, description, stars: 10, source_url: `https://github.com/a/${name}` });
  const rows = computeRows([
    row("gh", "clis-tools", "GitHub's official command line tool"),
    row("sbx", "infrastructure", "Sandboxes for running AI-generated code"),
    row("n8n", "workflows", "Workflow automation platform"),
  ]);
  const lit = (component) => rankRows(rows, { component }).components;
  assert.deepEqual(lit("tools"), ["cli", "tool"], "?component=tools lights cli, as ?component=cli does");
  assert.deepEqual(lit("tool"), ["cli", "tool"]);
  assert.deepEqual(lit("sandbox"), ["infra"]);
  assert.deepEqual(lit("dispatch"), ["workflow"]);
  assert.deepEqual(lit("cli"), ["cli"]);
  assert.equal(rankRows(rows, {}).components, null, "no component filter lights no component chip");
});

test("domain: \"subscription\" counts toward payments only beside a payments word", () => {
  const row = (name, description) => ({ name, type: "mcps", description, source_url: `https://github.com/a/${name}` });
  const [orca, feeds, stripe, lemon, chargebee] = computeRows([
    row("stablyai-orca", "Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription."),
    row("feeds", "Manage RSS feed subscriptions and unread counts"),
    row("stripe-tools", "Stripe billing: customers and subscriptions"),
    row("lemon-tools", "Manage Lemon Squeezy stores, products and subscriptions"),
    row("chargebee-tools", "Query Chargebee subscriptions and customers"),
  ]);
  assert.equal(orca.domain, "ai-agents", "someone's own plan is not payments");
  assert.notEqual(feeds.domain, "payments", "a feed subscription is not payments");
  assert.equal(stripe.domain, "payments", "beside a payments word it still counts");
  assert.equal(lemon.domain, "payments", "Lemon Squeezy is a billing platform, like Stripe");
  assert.equal(chargebee.domain, "payments", "so is Chargebee");
});

test("the Ask interpreter offers only components that have rows, so /ask never shows a plugin chip", () => {
  const src = readFileSync(join(ROOT, "web/src/lib/ask-core.ts"), "utf8");
  const m = src.match(/const COMPONENT_TYPES = "([^"]+)"/);
  assert.ok(m, "web/src/lib/ask-core.ts declares COMPONENT_TYPES as one string");
  const offered = m[1].split(",").map((w) => w.trim());
  assert.ok(!offered.includes("plugin"), "no row is filed under plugin");
  const p = join(ROOT, "catalog.json");
  if (!existsSync(p)) return;
  const withRows = new Set(facetsOf(computeRows(JSON.parse(readFileSync(p, "utf8")).components)).components.map((f) => f.key));
  for (const c of offered) assert.ok(withRows.has(c), `${c} has rows, so its chip matches something`);
});

// ── robots.txt and sitemap.xml (static files in web/src/app, served at the site root) ─
test("sitemap.xml lists every fixed page and every shelf, and robots.txt points to it", () => {
  const SITE = "https://armory-murex.vercel.app";
  const app = join(ROOT, "web/src/app");
  // A fixed page is a page.tsx with no [dynamic] folder on its path; /c/[component] is listed by shelf.
  const fixed = [];
  const walk = (dir, route) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && !e.name.startsWith("[")) walk(join(dir, e.name), `${route}/${e.name}`);
      else if (e.isFile() && e.name === "page.tsx") fixed.push(route || "/");
    }
  };
  walk(app, "");
  const shelves = JSON.parse(readFileSync(join(ROOT, "web/src/data/stack.json"), "utf8")).components.map((c) => `/c/${c.slug}`);
  const locs = [...readFileSync(join(app, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.every((u) => u.startsWith(`${SITE}/`)), "every URL is absolute on the site");
  const paths = locs.map((u) => u.slice(SITE.length).replace(/(.)\/$/, "$1"));
  assert.equal(new Set(paths).size, paths.length, "no URL twice");
  assert.deepEqual([...paths].sort(), [...fixed, ...shelves].sort(), "a page or shelf added or removed updates sitemap.xml");
  const robots = readFileSync(join(app, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${SITE}/sitemap\\.xml$`, "m"));
  assert.doesNotMatch(robots, /^Disallow: \/\s*$/m, "crawlers may read the whole site");
});

// ── /stack guard: a pick below its shelf's top row must say why ───────────────
test("stackPickGaps flags a pick below the top row with no reason, and a pick off its shelf", () => {
  const sandbox = (name, stars) => ({ name, type: "infrastructure", description: "Sandboxes for AI-generated code", stars, source_url: `https://github.com/a/${name}` });
  const rows = computeRows([
    sandbox("top", 300),
    sandbox("second", 200),
    sandbox("third", 100),
    { name: "llm-engine", type: "infrastructure", description: "LLM inference in C/C++", stars: 1000, source_url: "https://github.com/a/llm-engine" },
  ]);
  const stack = {
    components: [{
      slug: "sandbox",
      aggregates: ["infra"],
      picks: [
        { name: "top", armoryName: "top" },
        { name: "second", armoryName: "second" },
        { name: "third", armoryName: "third", reason: "Listed for a reason." },
        { name: "engine", armoryName: "llm-engine", reason: "Filed here, but not a sandbox." },
        { name: "later", armoryName: null },
      ],
    }],
  };
  const gaps = stackPickGaps(stack, rows);
  assert.equal(gaps.length, 2, gaps.join(" | "));
  assert.match(gaps[0], /^sandbox: second sits below top and has no reason$/);
  assert.match(gaps[1], /^sandbox: llm-engine is not listed on its shelf/);
});

test("stackPickGaps flags a pick at the top of its shelf that still has a reason", () => {
  const sandbox = (name, stars) => ({ name, type: "infrastructure", description: "Sandboxes for AI-generated code", stars, source_url: `https://github.com/a/${name}` });
  const rows = computeRows([sandbox("top", 300), sandbox("second", 200)]);
  const stack = {
    components: [{
      slug: "sandbox",
      aggregates: ["infra"],
      picks: [
        { name: "top", armoryName: "top", reason: "Picked over the rest." },
        { name: "second", armoryName: "second", reason: "Second by score." },
      ],
    }],
  };
  assert.deepEqual(stackPickGaps(stack, rows), ["sandbox: top is the top row and still has a reason, which no page shows"]);
});
