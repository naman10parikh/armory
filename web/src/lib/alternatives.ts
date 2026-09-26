// "Alternatives · <component>" on a detail page — rows that do the same job, not merely the shelf's top rows
// (CP143). The detail page used to list the three best-scored rows on the shelf, so aider's page offered
// gh and duckdb. A row now qualifies only when it shares a purpose with this one: two or more purpose
// words in common (from the description and the purpose tags), weighted by how rare each word is on the
// shelf, adding up to at least a tenth of the two rows' words together. "Coding" and "terminal" count;
// "server" and "tool" never do. When nothing qualifies the list is shorter, or absent, never padded.
// The best-scored qualifying rows come first. The same product listed again (e2b beside e2b-sandbox) is
// not its own alternative.
import "server-only";
import type { BoardRow } from "./rows";

const MIN_SHARED = 2;
const MIN_SIMILARITY = 0.1;

// Words that say nothing about what a component is for: English glue, plus words every row here shares.
const STOP = new Set(
  (
    "a an and are as at be by for from has have in into is it its of on or that the this to via with your you " +
    "any all can more most not one only other than then there these they those when where which while will " +
    "use used uses using based built open source official new simple fast lightweight powerful easy best " +
    "tool tools server servers mcp model context protocol agent agents llm llms claude api apis library " +
    "framework app apps support supports provides provide enables enable allows allow lets help helps run runs " +
    "running integration integrations way ways make makes get gets set also like just need needs etc capability " +
    "exposes expose"
  ).split(" "),
);
const SAME: Readonly<Record<string, string>> = {
  programming: "coding",
  code: "coding",
  coder: "coding",
  codes: "coding",
  coders: "coding",
};
// Tags that name a source, a catalogue type or a platform, not a purpose.
const NOT_PURPOSE =
  /^(mcp|mcps|glama|pulsemcp|mcp-so|smithery|sentinel-feed|cp\d+-seed|dlezo|aggregators|skills?|subagents?|workflows?|rules|claude-md-files|cursor-rules|claudemd-rules|agents?|hooks?|commands?|tools|tooling|claude-code|anthropic|cookbook|recipe|other-tools-and-integrations|integration|official)$/;

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((w) => SAME[w] ?? (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

const PURPOSE = new WeakMap<BoardRow, Set<string>>();
function purposeOf(r: BoardRow): Set<string> {
  let p = PURPOSE.get(r);
  if (!p) {
    p = new Set(words(`${r.desc} ${r.tags.filter((t) => !NOT_PURPOSE.test(t)).join(" ")}`));
    PURPOSE.set(r, p);
  }
  return p;
}

// Document frequency per shelf, over its ranked rows, counted once per process.
const FREQ = new Map<string, { n: number; df: Map<string, number> }>();
function frequencies(shelf: string, pool: readonly BoardRow[]): { n: number; df: Map<string, number> } {
  let f = FREQ.get(shelf);
  if (!f) {
    const df = new Map<string, number>();
    for (const r of pool) for (const w of purposeOf(r)) df.set(w, (df.get(w) ?? 0) + 1);
    f = { n: pool.length, df };
    FREQ.set(shelf, f);
  }
  return f;
}

const flat = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Up to `limit` ranked rows on `shelf` that share a purpose with `me`, best-scored first. */
export function alternativesFor(me: BoardRow, shelf: string, shelfRows: readonly BoardRow[], limit = 3): BoardRow[] {
  const pool = shelfRows.filter((r) => r.universal != null);
  const { n, df } = frequencies(shelf, pool);
  const idf = (w: string): number => Math.log((n + 1) / ((df.get(w) ?? 0) + 1));
  const mine = purposeOf(me);
  const own = flat(me.name);
  const out: BoardRow[] = [];
  for (const r of pool) {
    if (out.length === limit) break;
    if (r === me || (r.type === me.type && r.name === me.name)) continue;
    const theirs = flat(r.name);
    if (own.includes(theirs) || theirs.includes(own)) continue;
    const other = purposeOf(r);
    const shared = [...other].filter((w) => mine.has(w));
    if (shared.length < MIN_SHARED) continue;
    const union = new Set([...mine, ...other]);
    const sum = (ws: Iterable<string>): number => [...ws].reduce((t, w) => t + idf(w), 0);
    if (sum(shared) / sum(union) >= MIN_SIMILARITY) out.push(r);
  }
  return out;
}
