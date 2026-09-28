#!/usr/bin/env node
// lint-catalog.mjs: the deterministic checks every catalog change passes (CP147 T08). Plain Node, no network.
// The chairman: rows, labels and categories "should go through deterministic linting checks and hooks so that
// these things don't just happen randomly."
//
//   one-repository-one-row  no two rows are the same component (lib/same-component.mjs): one GitHub
//                           repository is one row, on any shelf
//   allowed-labels          every row's type, maturity, CLI list, domain and vertical is on its list
//   no-orphan-labels        every type, domain, vertical and shelf holds a row, and every row a list names by
//                           name (SHELF_MOVES, DOMAIN_MOVES, SHELF_FIT allow and deny, the /stack picks) exists
//   shelf-fits-type         every row lands on exactly one /stack shelf, through its type or SHELF_MOVES
//   one-timestamp           catalog.json's generated_at is a UTC time, and each browse README states exactly it
//
// One source per list: TYPES (ingest/catalog.mjs), MATURITY and CLI_COMPAT (lib/labels.mjs), DOMAINS, VERTICALS,
// SHELF_MOVES, DOMAIN_MOVES and SHELF_FIT (lib/rank.mjs), the shelves and their picks (web/src/data/stack.json).
// Maturity and the CLI list are optional in the contract: an empty value passes, a value off the list does not.
//
//   node scripts/lint-catalog.mjs     # every failure, then exit 1 if there is one
// Runs in CI on every pull request, in the nightly refresh before its commit, and in .githooks/pre-commit.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { duplicateGroups } from "../lib/same-component.mjs";

export const RULES = ["one-repository-one-row", "allowed-labels", "no-orphan-labels", "shelf-fits-type", "one-timestamp"];
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const STAMP = /^\*\*Last updated:\*\* (\S+)/gm;

// PURE. `catalog` is catalog.json; `rows` is lib/rank.mjs computeRows(catalog.components), which says each row's
// component, domain and vertical; `readmes` are the browse READMEs, [{ path, text }]. Returns [{ rule, message }].
export function lintCatalog({ catalog, rows, readmes = [] }, lists) {
  const out = [];
  const fail = (rule, message) => out.push({ rule, message });
  const components = catalog?.components || [];
  const at = (c) => `${c.type}/${c.name}`;
  const domains = [...lists.domains, "other"];
  const shelvesOf = (component) => lists.shelves.filter((s) => (s.aggregates || []).includes(component));

  for (const g of duplicateGroups(components)) {
    fail(RULES[0], `${g.repo}: ${g.rows.map(at).join(", ")} (${g.kind}); fold them: node scripts/demote-same-repo.mjs --apply`);
  }

  for (const c of components) {
    if (!lists.types.includes(c.type)) fail(RULES[1], `${at(c)}: type "${c.type}" is not one of ${lists.types.join(", ")}`);
    if (c.maturity && !lists.maturity.includes(c.maturity)) fail(RULES[1], `${at(c)}: maturity "${c.maturity}" is not one of ${lists.maturity.join(", ")}`);
    if (!Array.isArray(c.cli_compat)) fail(RULES[1], `${at(c)}: cli_compat is not a list`);
    else for (const v of c.cli_compat) if (!lists.cliCompat.includes(v)) fail(RULES[1], `${at(c)}: cli_compat "${v}" is not one of ${lists.cliCompat.join(", ")}`);
  }
  for (const r of rows) {
    if (!domains.includes(r.domain)) fail(RULES[1], `${at(r)}: domain "${r.domain}" is not one of ${domains.join(", ")}`);
    if (r.vertical != null && !lists.verticals.includes(r.vertical)) fail(RULES[1], `${at(r)}: vertical "${r.vertical}" is not one of ${lists.verticals.join(", ")}`);
  }
  for (const [k, d] of Object.entries(lists.domainMoves)) if (!domains.includes(d)) fail(RULES[1], `DOMAIN_MOVES ${k}: "${d}" is not a domain`);

  const keys = new Set(components.map(at));
  const names = new Set(components.map((c) => c.name));
  for (const t of lists.types) if (!components.some((c) => c.type === t)) fail(RULES[2], `type "${t}" holds no row`);
  for (const d of lists.domains) if (!rows.some((r) => r.domain === d)) fail(RULES[2], `domain "${d}" holds no row`);
  for (const v of lists.verticals) if (!rows.some((r) => r.vertical === v)) fail(RULES[2], `vertical "${v}" holds no row`);
  for (const s of lists.shelves) if (!rows.some((r) => (s.aggregates || []).includes(r.component))) fail(RULES[2], `shelf "${s.slug}" holds no row`);
  for (const k of Object.keys(lists.shelfMoves)) if (!keys.has(k)) fail(RULES[2], `SHELF_MOVES names ${k}, which is not a row`);
  for (const k of Object.keys(lists.domainMoves)) if (!keys.has(k)) fail(RULES[2], `DOMAIN_MOVES names ${k}, which is not a row`);
  const fitNames = new Map();
  for (const [component, rule] of Object.entries(lists.shelfFit)) {
    for (const n of [...(rule.allow || []), ...(rule.deny || [])]) fitNames.set(n, fitNames.get(n) || component);
  }
  for (const [n, component] of fitNames) if (!names.has(n)) fail(RULES[2], `SHELF_FIT.${component} names ${n}, which is not a row`);
  for (const s of lists.shelves) {
    for (const p of s.picks || []) if (p.armoryName && !names.has(p.armoryName)) fail(RULES[2], `/stack ${s.slug} pick ${p.armoryName} is not a row`);
  }

  for (const r of rows) {
    const on = shelvesOf(r.component);
    if (on.length !== 1) fail(RULES[3], `${at(r)}: its component "${r.component}" is on ${on.length ? on.map((s) => s.slug).join(" and ") : "no shelf"}`);
  }
  for (const [k, component] of Object.entries(lists.shelfMoves)) {
    const on = shelvesOf(component);
    if (on.length !== 1) fail(RULES[3], `SHELF_MOVES ${k}: "${component}" is on ${on.length ? on.map((s) => s.slug).join(" and ") : "no shelf"}`);
  }

  const when = catalog?.generated_at;
  if (!UTC.test(String(when)) || Number.isNaN(Date.parse(when))) fail(RULES[4], `catalog.json generated_at "${when}" is not a UTC time`);
  for (const { path, text } of readmes) {
    const stamps = [...String(text).matchAll(STAMP)].map((m) => m[1]);
    if (stamps.length !== 1) fail(RULES[4], `${path}: ${stamps.length} "Last updated" lines, want 1`);
    else if (stamps[0] !== when) fail(RULES[4], `${path}: last updated ${stamps[0]}, catalog.json generated_at ${when}; run node ingest/surface.mjs --apply`);
  }
  return out;
}

// The real lists and inputs, read from their one source each.
async function main() {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { TYPES } = await import("../ingest/catalog.mjs");
  const { MATURITY, CLI_COMPAT } = await import("../lib/labels.mjs");
  const { DOMAINS, VERTICALS, SHELF_MOVES, DOMAIN_MOVES, SHELF_FIT, computeRows } = await import("../lib/rank.mjs");
  const stack = JSON.parse(readFileSync(join(ROOT, "web", "src", "data", "stack.json"), "utf-8"));
  const catalog = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8"));
  const readmes = [];
  const failures = lintCatalog({ catalog, rows: computeRows(catalog.components), readmes }, {
    types: TYPES, maturity: MATURITY, cliCompat: CLI_COMPAT, domains: Object.keys(DOMAINS), verticals: Object.keys(VERTICALS),
    shelves: stack.components, shelfMoves: SHELF_MOVES, domainMoves: DOMAIN_MOVES, shelfFit: SHELF_FIT,
  });
  const SHOW = 20;
  for (const rule of RULES) {
    const mine = failures.filter((f) => f.rule === rule);
    console.log(`${mine.length ? "FAIL" : "pass"}  ${rule}${mine.length ? ` (${mine.length})` : ""}`);
    for (const f of mine.slice(0, SHOW)) console.log(`        ${f.message}`);
    if (mine.length > SHOW) console.log(`        … and ${mine.length - SHOW} more`);
  }
  console.log(`\ncatalog lint: ${failures.length ? "FAIL" : "PASS"} (${catalog.components.length} rows, generated_at ${catalog.generated_at})`);
  process.exit(failures.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
