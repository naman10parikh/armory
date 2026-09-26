// Alternatives on a detail page (web/src/lib/alternatives.ts) match rows on purpose words. A tag naming the row's own
// type or component says only where it is filed: "clis-tools" gave every tagged command-line tool the word "clis"
// and matched them to each other (CP138 PR G). The module imports "server-only", which only the site's build
// resolves, so this runs a copy without that line. Node strips the TypeScript: run with Node 22.6 or newer and
// --experimental-strip-types (CI's last step), or plain node from 23.6.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SERVER_ONLY = 'import "server-only";';
const src = readFileSync(new URL("../src/lib/alternatives.ts", import.meta.url), "utf8");
assert.ok(src.includes(SERVER_ONLY), "alternatives.ts imports server-only as this test expects");
const copy = join(mkdtempSync(join(tmpdir(), "armory-alternatives-")), "alternatives.ts");
writeFileSync(copy, src.replace(SERVER_ONLY, ""));
const { alternativesFor } = await import(pathToFileURL(copy).href);

const row = (name, type, component, desc, tags) => ({ name, type, component, desc, tags, universal: 90 });
// Rows with words of their own, so a word two rows share is not on every row of the shelf.
const others = (type, component) => [
  row("filler-one", type, component, "Parse spreadsheets.", []),
  row("filler-two", type, component, "Resize photographs.", []),
  row("filler-three", type, component, "Translate subtitles.", []),
];

test("alternatives: a tag naming the row's own type or component is not a purpose word", () => {
  for (const [type, component, tag, n] of [
    ["clis-tools", "cli", "clis-tools", 1],
    ["clis-tools", "cli", "cli", 2],
    ["infrastructure", "infra", "infrastructure", 3],
  ]) {
    // One real purpose word in common ("text"), plus the tag: two rows that do different jobs.
    const me = row("diagram-maker", type, component, "Render diagrams from text.", [tag]);
    const mailer = row("mailer", type, component, "Send email from text templates.", [tag]);
    const shelf = [me, mailer, ...others(type, component)];
    assert.deepEqual(alternativesFor(me, `own-${n}`, shelf), [], `${type} rows tagged ${tag} are not alternatives on that tag`);
  }
});

test("alternatives: the same word on another kind of row is a purpose, so two tracing platforms tagged evals match", () => {
  const me = row("lantern", "observability", "observability", "Tracing dashboards.", ["evals"]);
  const other = row("beacon", "observability", "observability", "Tracing and prompt versions.", ["evals"]);
  const shelf = [me, other, ...others("observability", "observability")];
  assert.deepEqual(alternativesFor(me, "other-kind", shelf).map((r) => r.name), ["beacon"]);
});
