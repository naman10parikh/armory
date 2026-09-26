// A row whose slug alone would not do (clis-tools/microsoft-playwright-2 took a collision suffix;
// mcps/microsoft-playwright would read like Playwright itself) carries the catalog's `title`: the lists, the Ask
// cards and the email and text replies print it, while the key, the link and `armory install` keep the slug (CP143). Node strips the TypeScript: run with Node 22.6 or newer and --experimental-strip-types (CI's
// last step), or plain node from 23.6.
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// The modules import "@/lib/..." and "./format" as the bundler resolves them; the hook does the same.
register("./resolve-ts.mjs", import.meta.url);
const { titleOf } = await import("../src/lib/format.ts");
const { toRowViews } = await import("../src/lib/row-view.ts");
const { renderAnswer } = await import("../src/lib/answer.ts");

const signals = { tested: 1, mentions: 21, stars: 96700, usage: null, forks: 5300 };
const row = {
  name: "microsoft-playwright-2", title: "microsoft-playwright", type: "clis-tools", component: "cli",
  domain: "browser", url: "https://github.com/microsoft/playwright", desc: "Web testing and automation.",
  universal: 87.1, exact: 87.1234, evidence: 3, signals, pushedAt: "2026-09-26", stale: false,
  listedAt: "2026-09-26", gained: null, ours: false, contributedBy: "Sentinel", installable: true,
  rank: 1, alsoListedAs: [],
};

test("titleOf: a non-empty string title, else none (the rule normalize.ts applies to the detail page)", () => {
  assert.equal(titleOf({ title: "microsoft-playwright" }), "microsoft-playwright");
  for (const title of [undefined, "", 7, null]) assert.equal(titleOf({ title }), undefined, JSON.stringify(title));
  assert.equal(titleOf(null), undefined);
});

test("toRowViews: the table prints the title, while the key, the link and the install name keep the slug", () => {
  const [v] = toRowViews([row]);
  assert.equal(v.title || v.name, "microsoft-playwright"); // the name cell
  assert.equal(v.name, "microsoft-playwright-2"); // InstallSnippet
  assert.equal(v.key, "clis-tools/microsoft-playwright-2");
  assert.equal(v.href, "/e/clis-tools/microsoft-playwright-2");
});

test("toRowViews: a row without a title prints its slug, and a folded twin's title prints in 'also listed as'", () => {
  const twin = { name: "microsoft-playwright-2", title: "microsoft-playwright", type: "clis-tools" };
  const [v] = toRowViews([{ ...row, name: "playwright-cli", title: undefined, alsoListedAs: [twin] }]);
  assert.equal(v.title || v.name, "playwright-cli");
  assert.deepEqual(v.alsoListedAs, [
    { name: "microsoft-playwright-2", title: "microsoft-playwright", href: "/e/clis-tools/microsoft-playwright-2" },
  ]);
});

test("renderAnswer: the email and text replies print the title, and the email's command keeps the slug", () => {
  const item = {
    name: "microsoft-playwright-2", title: "microsoft-playwright", component: "cli", domain: "browser",
    vertical: null, url: "https://github.com/microsoft/playwright", universal: 87.1, primary: null,
    desc: "Web testing and automation.", verified: true, signals, contributor: "Sentinel", installable: true,
  };
  const first = (text) => text.split("\n").find((l) => l.startsWith("1. "));
  const email = renderAnswer([item], "browser testing", { channel: "email" });
  assert.ok(first(email).startsWith("1. microsoft-playwright "), first(email));
  assert.ok(!first(email).includes("microsoft-playwright-2"), first(email));
  assert.match(email, /armory install microsoft-playwright-2 --cli claude/);
  const sms = renderAnswer([item], "browser testing", { channel: "sms" });
  assert.ok(first(sms).startsWith("1. microsoft-playwright 87.1 "), first(sms));
});
