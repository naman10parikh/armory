// The site's catalog step (web/src/lib/normalize.ts) keeps every field the pages read. Node strips the TypeScript:
// run with Node 22.6 or newer and --experimental-strip-types (CI's last step), or plain node from 23.6.
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeComponent } from "../src/lib/normalize.ts";

const row = {
  name: "microsoft-playwright-2", type: "clis-tools", description: "Web testing and automation.",
  source_repo: "microsoft/playwright", source_url: "https://github.com/microsoft/playwright", license: "unknown",
  cli_compat: ["claude"], maturity: "experimental", stars: 96700, eval_score: 1, mentions: 21, forks: 5300,
  pushed_at: "2026-09-26T00:00:00Z", verified_at: "2026-09-26", related: [], tags: ["sentinel-feed"],
  path: "components/clis-tools/microsoft-playwright-2.md",
};

test("normalize: a row's title reaches the page, so microsoft-playwright-2 reads microsoft-playwright", () => {
  assert.equal(normalizeComponent({ ...row, title: "microsoft-playwright" }).title, "microsoft-playwright");
});

test("normalize: no title, an empty one or a non-string gives no title key; the name stays the slug", () => {
  for (const title of [undefined, "", 7, null]) {
    const c = normalizeComponent({ ...row, title });
    assert.ok(!("title" in c), `title ${JSON.stringify(title)}`);
    assert.equal(c.name, "microsoft-playwright-2");
  }
});
