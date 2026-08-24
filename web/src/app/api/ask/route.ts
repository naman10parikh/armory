// POST /api/ask — the conversational query surface. Turns a natural-language request ("finance MCPs
// that help with Excel modeling") into a keyword query, runs the SAME field-weighted keyword scorer as
// /api/search over the vendored catalog, and returns the top matches enriched with the shared engine's
// component, domain, vertical, Universal score, and primary signal. When GEMINI_API_KEY is set it asks
// Google Gemini's FREE tier to extract the keywords + component/domain/vertical facets from the request;
// with no key (or on any Gemini error) it degrades gracefully to tokenizing the request itself — the
// results still render. Node runtime; this route owns the catalog read like /api/rank and /api/search.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied to the site root by prebuild)
import { computeRows } from "../../../../lib/rank.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Primary { key: string; value: number | null; pct: number; label: string }
interface Signals { stars: number | null; usage: number | null; tested: number | null; mentions: number | null }
interface EngineRow {
  name: string; component: string; domain: string; vertical: string | null; url: string | null;
  desc: string; scores: { universal: number | null }; primary: Primary | null;
  verified?: boolean; signals: Signals;
}
interface RawComponent { name?: string; description?: string; tags?: string[] | string }
interface Hit { raw: RawComponent; row: EngineRow }

// The scored corpus (raw component paired with its enriched engine row, 1:1) is built once and cached in
// the module — computeRows is O(n) with percentile sorts, so we pay it once, not per request (as /api/rank).
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

// Function words carry no catalog signal but DO score, because a name match is worth 3 points: "with",
// "me" and "help" alone lifted `vibe-with-me-tools-agent-reachout` and `mcp-help-article-server` into
// the top 3 for real queries. Dropping them fixes relevance AND the junk chips the client renders from
// `interpreted.keywords` — one list, both symptoms. (1-char words are already gone via tokenize.)
const STOPWORDS = new Set([
  "the", "that", "with", "help", "for", "and", "an", "to", "in", "of", "on", "is",
  "are", "how", "do", "my", "me", "best", "any", "some", "it", "this",
]);

// Keep only the meaningful terms — but never return nothing, so an all-stopword query still searches.
const contentTerms = (tokens: string[]): string[] => {
  const kept = tokens.filter((t) => !STOPWORDS.has(t));
  return kept.length ? kept : tokens;
};

// A simple, deterministic keyword score: a term in the name outweighs a tag, which outweighs the body.
// Identical to /api/search's scorer — one relevance definition across the programmatic + conversational APIs.
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

interface AskItem {
  name: string; component: string; domain: string; vertical: string | null;
  url: string | null; universal: number | null; primary: Primary | null; desc: string;
  verified: boolean; signals: Signals;
}
interface Filters { component?: string; domain?: string; vertical?: string }

// Field-weighted keyword search, optionally sliced by the Gemini-extracted facets, sorted by score then
// Universal — mirrors /api/search exactly, just with an in-process query instead of URL params.
function runSearch(qTerms: string[], f: Filters, limit = 12): AskItem[] {
  const scored = corpus()
    .filter(({ row }) =>
      (!f.component || row.component === f.component) &&
      (!f.domain || row.domain === f.domain) &&
      (!f.vertical || row.vertical === f.vertical))
    .map((h) => ({ h, score: keywordScore(h.raw, qTerms) }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.h.row.scores.universal ?? -1) - (a.h.row.scores.universal ?? -1) ||
        a.h.row.name.localeCompare(b.h.row.name),
    );
  return scored.slice(0, limit).map(({ h }) => ({
    name: h.row.name,
    component: h.row.component,
    domain: h.row.domain,
    vertical: h.row.vertical,
    url: h.row.url,
    universal: h.row.scores.universal,
    primary: h.row.primary,
    desc: h.row.desc,
    // The card leads with the ranking, so it needs the trust chip and every raw signal (for the
    // hover breakdown) — the same three things the Leaderboard row shows.
    verified: h.row.verified ?? false,
    signals: h.row.signals,
  }));
}

// The valid facet vocabularies, given to Gemini so it maps intent onto the catalog's own axes.
const COMPONENT_TYPES = "mcp, cli, skill, plugin, hook, subagent, rules, tool, memory, eval, docs, agent";
const VERTICALS =
  "finance, legal, healthcare, e-commerce, marketing, devtools, ai-infra, security, data-analytics, productivity, education, gaming";

interface Interpretation {
  keywords: string[]; component?: string; domain?: string; vertical?: string; summary?: string;
}

// Parse Gemini's reply into an Interpretation: strip ```json fences, isolate the outermost {...}, then
// validate types. Returns null if nothing usable — the caller then falls back to the request's tokens.
function parseInterpretation(text: string): Interpretation | null {
  if (!text) return null;
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) return null;
  t = t.slice(first, last + 1);
  try {
    const p = JSON.parse(t) as Record<string, unknown>;
    const keywords = Array.isArray(p.keywords)
      ? p.keywords.filter((k): k is string => typeof k === "string")
      : [];
    const out: Interpretation = { keywords };
    if (typeof p.component === "string") out.component = p.component;
    if (typeof p.domain === "string") out.domain = p.domain;
    if (typeof p.vertical === "string") out.vertical = p.vertical;
    if (typeof p.summary === "string") out.summary = p.summary;
    return out;
  } catch (err) {
    console.warn("[api/ask] interpretation parse failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

// Call Gemini's FREE-tier REST endpoint (no SDK — just fetch) with a 15s timeout. Any failure returns
// null so the handler degrades to the keyword path; the API key is NEVER logged.
async function interpretWithGemini(q: string, key: string): Promise<Interpretation | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const prompt =
      `You are the query interpreter for Armory, a ranked index of open-source AI-agent building blocks.\n` +
      `Extract a catalog search from the user's request. Reply with STRICT JSON only — no prose, no markdown fences — of this shape:\n` +
      `{"keywords": string[], "component"?: string, "domain"?: string, "vertical"?: string, "summary"?: string}\n` +
      `- keywords: 2-6 lowercase search terms drawn from the request (the tools/topics to match).\n` +
      `- component (optional): one of ${COMPONENT_TYPES} — only if the user clearly wants that kind of building block.\n` +
      `- vertical (optional): one of ${VERTICALS} — only if the user names an industry/sector.\n` +
      `- domain (optional): a technical area such as payments, browser, database, search, comms, auth, front-end, back-end, devops, observability, ai-agents, github-vcs — only if obvious.\n` +
      `- summary (optional): one plain-English sentence answering the user.\n` +
      `User request: ${JSON.stringify(q)}`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      },
    );
    if (!res.ok) {
      console.warn("[api/ask] gemini http status:", res.status);
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return parseInterpretation(text);
  } catch (err) {
    console.warn("[api/ask] gemini request failed:", err instanceof Error ? err.message : String(err));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// A generated one-liner for when Gemini gave facets but no summary: "Top N <component> for <intent>".
function generatedSummary(n: number, i: Interpretation): string {
  if (n === 0) return "No close matches in the index yet — try broader terms.";
  const noun = i.component ? i.component : "tools";
  const intent = i.vertical || i.domain || i.keywords.join(" ");
  return `Top ${n} ${noun}${intent ? ` for ${intent}` : ""}.`;
}

export async function POST(req: Request): Promise<NextResponse> {
  let q = "";
  try {
    const body = (await req.json()) as { q?: unknown };
    q = typeof body.q === "string" ? body.q.trim() : "";
  } catch {
    q = ""; // Intentionally silent: a malformed body is treated as an empty query.
  }
  if (!q) {
    return NextResponse.json({
      ok: false, reason: "empty", interpreted: { keywords: [] },
      summary: 'Ask for any tool — e.g. "finance MCPs that help with Excel modeling".', items: [],
    });
  }

  const qTokens = contentTerms([...new Set(tokenize(q))]);
  const key = process.env.GEMINI_API_KEY;

  // No key → graceful keyword path (still status 200, still renders items).
  if (!key) {
    return NextResponse.json({
      ok: false, reason: "no_key", interpreted: { keywords: qTokens },
      summary: "Showing keyword matches (add GEMINI_API_KEY for conversational search).",
      items: runSearch(qTokens, {}),
    });
  }

  // Key present → let Gemini interpret, then run the same scorer with its keywords + facets.
  const interp = await interpretWithGemini(q, key);
  if (!interp) {
    return NextResponse.json({
      ok: false, reason: "gemini_error", interpreted: { keywords: qTokens },
      summary: "Showing keyword matches (conversational search was unavailable).",
      items: runSearch(qTokens, {}),
    });
  }

  const keywords = interp.keywords.length
    ? contentTerms([...new Set(interp.keywords.flatMap(tokenize))])
    : qTokens;
  const filters: Filters = { component: interp.component, domain: interp.domain, vertical: interp.vertical };
  let items = runSearch(keywords, filters);
  // If the facets over-filtered to nothing, retry once without them so the user still sees the best matches.
  if (items.length === 0 && (filters.component || filters.domain || filters.vertical)) {
    items = runSearch(keywords, {});
  }

  const interpreted: Interpretation = { keywords };
  if (interp.component) interpreted.component = interp.component;
  if (interp.domain) interpreted.domain = interp.domain;
  if (interp.vertical) interpreted.vertical = interp.vertical;

  const summary = interp.summary?.trim() || generatedSummary(items.length, interp);
  return NextResponse.json({ ok: true, interpreted, summary, items });
}
