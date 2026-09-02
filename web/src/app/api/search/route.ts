// GET /api/search — the programmatic query surface: keyword-search the catalog so an agent (or the
// site) can find the right building block for a task. Ranks the vendored catalog.json by keyword
// relevance on name + description + tags, intersected with the component/domain filters, and enriches
// every hit with the shared engine's normalized component, domain, Universal score, and primary signal
// (via computeRows — imported read-only). Node runtime; this route owns the catalog read like /api/rank.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied to the site root by prebuild)
import { computeRows } from "../../../../lib/rank.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Primary { key: string; value: number | null; pct: number; label: string }
interface EngineRow {
  name: string; type: string; component: string; domain: string; url: string | null;
  desc: string; scores: { universal: number | null }; primary: Primary | null;
}
interface RawComponent { name?: string; description?: string; tags?: string[] | string }
interface Hit { raw: RawComponent; row: EngineRow }

// The scored corpus (raw component paired with its enriched engine row, 1:1) is built once and cached
// in the module — computeRows is O(n) with percentile sorts, so we pay it once, not per request.
let CACHE: Hit[] | null = null;
function corpus(): Hit[] {
  if (CACHE) return CACHE;
  const path = join(process.cwd(), "catalog.json"); // vendored to the site root by prebuild
  const cat = JSON.parse(readFileSync(path, "utf-8")) as { components: RawComponent[] };
  const rows = computeRows(cat.components) as EngineRow[]; // same order as cat.components (a .map)
  CACHE = cat.components.map((raw, i) => ({ raw, row: rows[i] }));
  return CACHE;
}

const tokenize = (text: string): string[] =>
  text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);

// A simple, deterministic keyword score: a term in the name outweighs a tag, which outweighs the body.
// No LLM, no network — just field-weighted term hits (mirrors the CLI `search` + MCP `search_catalog`).
function keywordScore(raw: RawComponent, qTerms: string[]): number {
  const tagText = Array.isArray(raw.tags) ? raw.tags.join(" ") : raw.tags || "";
  const name = new Set(tokenize(raw.name || ""));
  const tags = new Set(tokenize(tagText));
  const desc = new Set(tokenize(raw.description || ""));
  let s = 0;
  for (const term of qTerms) {
    if (name.has(term)) s += 3;
    if (tags.has(term)) s += 2;
    if (desc.has(term)) s += 1;
  }
  return s;
}

interface SearchItem {
  name: string; type: string; component: string; domain: string; url: string | null;
  universal: number | null; primary: Primary | null; desc: string;
}

export function GET(req: Request): NextResponse {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim();
  const component = sp.get("component");
  const domain = sp.get("domain");
  const limit = Math.min(Number(sp.get("limit")) || 20, 200);

  const qTerms = [...new Set(tokenize(q))];
  if (qTerms.length === 0) return NextResponse.json({ items: [], total: 0 });

  const scored = corpus()
    .filter(({ row }) => (!component || row.component === component) && (!domain || row.domain === domain))
    .map((h) => ({ h, score: keywordScore(h.raw, qTerms) }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.h.row.scores.universal ?? -1) - (a.h.row.scores.universal ?? -1) ||
        a.h.row.name.localeCompare(b.h.row.name),
    );

  const items: SearchItem[] = scored.slice(0, limit).map(({ h }) => ({
    name: h.row.name,
    type: h.row.type, // the catalog folder — the detail page is /e/{type}/{name}
    component: h.row.component,
    domain: h.row.domain,
    url: h.row.url,
    universal: h.row.scores.universal,
    primary: h.row.primary,
    desc: h.row.desc,
  }));
  return NextResponse.json({ items, total: scored.length });
}
