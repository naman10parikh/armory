// The design check (web/scripts/design-check.mjs): an em dash in text a person reads fails it, in JSX text or in
// a string literal; comments, regular expressions and a lone dash that stands for "no value" do not.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { emDashes, checkDir } from "../scripts/design-check.mjs";

const D = "\u2014";
const lines = (src) => emDashes(src).map((h) => h.line);

test("design-check: an em dash in JSX text fails, on its own line", () => {
  const src = ["export function A() {", "  return (", '    <p className="x">', `      Keyword Mode ${D} unavailable`, "    </p>", "  );", "}"].join("\n");
  assert.deepEqual(emDashes(src), [{ line: 4, text: `Keyword Mode ${D} unavailable` }]);
});

test("design-check: an em dash in a string, a template or an attribute fails", () => {
  const src = [
    `const a = "one ${D} two";`,
    `const b = 'one ${D} two';`,
    "const c = `${name} " + D + " open`;",
    `const d = <a aria-label="x ${D} y" />;`,
    "const e = `a ${f({ x: `in " + D + "` })} b`;",
    `const g = <p>{a} ${D} {b}</p>;`,
    `const h = [a, b].join(" ${D} ");`,
  ].join("\n");
  assert.deepEqual(lines(src), [1, 2, 3, 4, 5, 6, 7]);
});

test("design-check: comments, patterns and a lone placeholder pass", () => {
  const src = [
    `// a ${D} b`,
    `/* a ${D} b */`,
    `const e = <div>{/* a ${D} b */}</div>;`,
    `const f = s.replace(/[\\s.,;:${D}-]+$/, "");`,
    `const g = x ?? "${D}";`,
    `const h = '${D}';`,
    "const i = `" + D + "`;",
    `const j = <td>${D}</td>;`,
    `const k = <span className="t">  ${D}  </span>;`,
    `const m = y === "${D}" ? 1 : 2; // ${D} after code`,
    `const n = <a href="/x">Link</a>;`,
  ].join("\n");
  assert.deepEqual(emDashes(src), []);
});

test("design-check: an apostrophe in JSX text neither hides a dash nor throws off later lines", () => {
  const src = [`const p = <p>Armory's index ${D} counts</p>;`, `const q = "fine";`, `const r = <b>ok ${D} no</b>;`].join("\n");
  assert.deepEqual(lines(src), [1, 3]);
});

test("design-check: the site's text has no em dash a person reads", () => {
  const hits = checkDir(fileURLToPath(new URL("../src", import.meta.url)));
  assert.deepEqual(hits.map((h) => `${h.file}:${h.line}`), []);
});
