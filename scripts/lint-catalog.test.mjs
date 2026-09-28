// The catalog lint (CP147 T08): each rule passes a clean fixture and fails on a planted bad row.
// Fixtures only; the real catalog is linted by `node scripts/lint-catalog.mjs` in CI and the nightly refresh.
import { test } from "node:test";
import assert from "node:assert/strict";
import { lintCatalog, RULES } from "./lint-catalog.mjs";

const WHEN = "2026-09-28T01:30:23.739Z";
const row = (type, name, source_url, extra = {}) =>
  ({ name, type, source_url, source_repo: "", maturity: "beta", cli_compat: ["claude", "codex"], ...extra });

// A clean catalog: two MCP servers, one skill; every label on its list and every list entry in use.
function fixture() {
  const components = [
    row("mcps", "stripe-agent-toolkit", "https://github.com/stripe/agent-toolkit"),
    row("mcps", "playwright-mcp", "https://github.com/microsoft/playwright-mcp"),
    row("skills", "pdf", "https://github.com/anthropics/skills/tree/main/skills/pdf", { maturity: "stable" }),
  ];
  const rows = [
    { type: "mcps", name: "stripe-agent-toolkit", component: "mcp", domain: "payments", vertical: "finance" },
    { type: "mcps", name: "playwright-mcp", component: "mcp", domain: "browser", vertical: null },
    { type: "skills", name: "pdf", component: "skill", domain: "other", vertical: null },
  ];
  const lists = {
    types: ["mcps", "skills"], maturity: ["experimental", "beta", "stable"], cliCompat: ["claude", "codex"],
    domains: ["payments", "browser"], verticals: ["finance"],
    shelves: [
      { slug: "mcps", aggregates: ["mcp"], picks: [{ armoryName: "playwright-mcp" }] },
      { slug: "skills", aggregates: ["skill"], picks: [{ armoryName: null }] },
    ],
    shelfMoves: {}, domainMoves: { "mcps/stripe-agent-toolkit": "payments" }, shelfFit: { mcp: { allow: ["playwright-mcp"] } },
  };
  const readmes = [{ path: "mcps/README.md", text: `# mcps/\n\n**Last updated:** ${WHEN} (UTC), from catalog.json generated_at.\n` }];
  return { input: { catalog: { generated_at: WHEN, components }, rows, readmes }, lists };
}
const rulesOf = (failures) => [...new Set(failures.map((f) => f.rule))];
const only = (failures, rule) => {
  assert.deepEqual(rulesOf(failures), [rule], failures.map((f) => `${f.rule}: ${f.message}`).join("\n"));
  return failures.map((f) => f.message);
};

test("lint: a clean catalog passes every rule", () => {
  const { input, lists } = fixture();
  assert.deepEqual(lintCatalog(input, lists), []);
  assert.equal(RULES.length, 5);
});

test("lint one-repository-one-row: a repository listed twice on one shelf fails", () => {
  const { input, lists } = fixture();
  // Glama's spelling of Stripe's repository under another name, and an mcp.so page naming it in source_repo.
  input.catalog.components.push(row("mcps", "stripe", "https://github.com/Stripe/agent-toolkit.git"));
  input.catalog.components.push(row("mcps", "stripe-mcp-so", "https://mcp.so/server/stripe/stripe", { source_repo: "stripe/agent-toolkit" }));
  input.rows.push({ type: "mcps", name: "stripe", component: "mcp", domain: "payments", vertical: null });
  input.rows.push({ type: "mcps", name: "stripe-mcp-so", component: "mcp", domain: "payments", vertical: null });
  const msgs = only(lintCatalog(input, lists), "one-repository-one-row");
  assert.equal(msgs.length, 1);
  assert.match(msgs[0], /stripe\/agent-toolkit: .*mcps\/stripe-agent-toolkit.*mcps\/stripe\b.*mcps\/stripe-mcp-so/);
});

test("lint one-repository-one-row: entries of one list file, and same names in other repositories, pass", () => {
  const { input, lists } = fixture();
  const hooks = "https://github.com/affaan-m/ecc/blob/main/hooks/hooks.json";
  input.catalog.components.push(row("mcps", "pre-compact", hooks), row("mcps", "session-start", hooks));
  input.catalog.components.push(row("mcps", "playwright-mcp-2", "https://github.com/executeautomation/playwright-mcp"));
  for (const name of ["pre-compact", "session-start", "playwright-mcp-2"]) input.rows.push({ type: "mcps", name, component: "mcp", domain: "browser", vertical: null });
  assert.deepEqual(lintCatalog(input, lists), []);
});

test("lint allowed-labels: a type, maturity, CLI, domain or vertical off its list fails", () => {
  const { input, lists } = fixture();
  const c = input.catalog.components;
  c[0].maturity = "curated";
  c[1].cli_compat = ["claude", "windsurf"];
  c[2].type = "plugins";
  input.rows[0].domain = "bananas";
  input.rows[1].vertical = "bananas";
  lists.domainMoves["mcps/stripe-agent-toolkit"] = "money";
  input.rows[2].type = "skills"; // the scored row keeps its shelf, so only the label rule speaks
  const msgs = lintCatalog(input, lists).filter((f) => f.rule === "allowed-labels").map((f) => f.message);
  for (const want of [/maturity "curated"/, /cli_compat "windsurf"/, /type "plugins"/, /domain "bananas"/, /vertical "bananas"/, /DOMAIN_MOVES .*"money"/]) {
    assert.ok(msgs.some((m) => want.test(m)), `${want} in\n${msgs.join("\n")}`);
  }
});

test("lint allowed-labels: an empty maturity or CLI list passes (optional in the contract)", () => {
  const { input, lists } = fixture();
  input.catalog.components[0].maturity = "";
  input.catalog.components[0].cli_compat = [];
  assert.deepEqual(lintCatalog(input, lists), []);
});

test("lint no-orphan-labels: a label no row uses, or a list naming a missing row, fails", () => {
  const { input, lists } = fixture();
  lists.domains.push("database");
  lists.verticals.push("legal");
  lists.types.push("hooks");
  lists.shelves.push({ slug: "hooks", aggregates: ["hook"], picks: [] });
  lists.shelfMoves["mcps/ghost"] = "mcp";
  lists.domainMoves["mcps/phantom"] = "payments";
  lists.shelfFit.mcp.deny = ["wraith"];
  lists.shelves[0].picks.push({ armoryName: "spectre" });
  const msgs = only(lintCatalog(input, lists), "no-orphan-labels");
  for (const want of [/domain "database"/, /vertical "legal"/, /type "hooks"/, /shelf "hooks"/, /SHELF_MOVES names mcps\/ghost/,
    /DOMAIN_MOVES names mcps\/phantom/, /SHELF_FIT\.mcp names wraith/, /pick spectre/]) {
    assert.ok(msgs.some((m) => want.test(m)), `${want} in\n${msgs.join("\n")}`);
  }
});

test("lint shelf-fits-type: a row on no shelf, or on two, fails", () => {
  const { input, lists } = fixture();
  input.rows[2].component = "plugin"; // a type that maps to no shelf
  lists.shelves.push({ slug: "servers", aggregates: ["mcp"], picks: [] }); // a component claimed twice
  const msgs = lintCatalog(input, lists).filter((f) => f.rule === "shelf-fits-type").map((f) => f.message);
  assert.ok(msgs.some((m) => /skills\/pdf: its component "plugin" is on no shelf/.test(m)), msgs.join("\n"));
  assert.ok(msgs.some((m) => /"mcp" is on mcps and servers/.test(m)), msgs.join("\n"));
});

test("lint shelf-fits-type: a move to a component no shelf holds fails", () => {
  const { input, lists } = fixture();
  lists.shelfMoves["mcps/playwright-mcp"] = "browsers";
  const msgs = lintCatalog(input, lists).filter((f) => f.rule === "shelf-fits-type").map((f) => f.message);
  assert.deepEqual(msgs, ['SHELF_MOVES mcps/playwright-mcp: "browsers" is on no shelf']);
});

test("lint one-timestamp: a bad generated_at, or a README that states another time, fails", () => {
  const { input, lists } = fixture();
  input.readmes.push({ path: "evals/README.md", text: "**Last updated:** 2026-05-27T10:00:00.000Z (UTC)\n" });
  input.readmes.push({ path: "memory/README.md", text: "# memory/ has no stamp\n" });
  let msgs = only(lintCatalog(input, lists), "one-timestamp");
  assert.ok(msgs.some((m) => /evals\/README\.md: last updated 2026-05-27T10:00:00\.000Z/.test(m)), msgs.join("\n"));
  assert.ok(msgs.some((m) => /memory\/README\.md: 0 "Last updated" lines/.test(m)), msgs.join("\n"));
  input.readmes = [];
  input.catalog.generated_at = "yesterday";
  msgs = only(lintCatalog(input, lists), "one-timestamp");
  assert.deepEqual(msgs, ['catalog.json generated_at "yesterday" is not a UTC time']);
});
