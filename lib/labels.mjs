// labels.mjs: the fixed label lists a catalog row carries that no other module defines (CP147 T08).
// CONTRIBUTING.md states both in prose; scripts/lint-catalog.mjs fails a row whose value is not here.
// The other lists live beside the code that uses them: TYPES in ingest/catalog.mjs, DOMAINS and
// VERTICALS in lib/rank.mjs, the shelves in web/src/data/stack.json.

// How far along a component is. "curated" is where a row came from, not how mature it is (CP147).
export const MATURITY = ["experimental", "beta", "stable"];

// The command-line agents a component works in.
export const CLI_COMPAT = ["claude", "codex", "cursor", "gemini", "opencode"];
