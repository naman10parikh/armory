// lib/rank.mjs — the Universal ranking engine for the Armory catalog.
//
// One normalized rating for every open-source building block, whatever its shape (MCP, CLI, skill,
// plugin, repo, package, docs page, website, paper). Each signal is turned into a 0–100 percentile
// WITHIN ITS OWN KIND (a repo's stars against other repos' stars, a registry's installs against other
// registries' installs) and pooled per DISTINCT URL, so the same artifact listed five times counts once
// and scores once. The Universal score is then MONOTONE: `0.8 × base + 0.2 × others`, where `base` is
// the row's single strongest percentile and `others` is the weight-averaged percentile of everything
// else it holds. One signal caps at 80; a second and third can only ADD. Earning more evidence can
// never lower a score. A component with no real signal is honestly unranked (never faked to the top).
// The formula and every signal are open — see /formula.
//
// Portable ESM (no build step) so the Next.js site, the CLI, and the MCP server all import it.
// Reads catalog.json. Zero external deps.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Guarded so importing this module into a bundler (Next.js) never throws at import time; the site
// imports only the PURE functions (computeRows/rankRows) and never touches CATALOG.
let HERE = ".";
try { HERE = dirname(fileURLToPath(import.meta.url)); } catch { HERE = process.cwd(); }
const CATALOG = join(HERE, "..", "catalog.json");
const STAR_CEILING = 500_000; // above GitHub's real max ⇒ a mislabelled usage figure; show as unverified

// normalize every source's type name to one component label
const COMPONENT = {
  mcps: "mcp", mcp: "mcp", "clis-tools": "cli", cli: "cli", tool: "tool", tools: "tool",
  skills: "skill", skill: "skill", hooks: "hook", hook: "hook", subagents: "subagent",
  subagent: "subagent", plugins: "plugin", plugin: "plugin", "claudemd-rules": "rules", rules: "rules",
  memory: "memory", identity: "identity", evals: "eval", eval: "eval", observability: "observability",
  workflows: "workflow", infrastructure: "infra", sandboxes: "infra", "deploy-infra": "infra",
};

// domain buckets — a component is scored into its best-matching domain by keyword
const DOMAINS = {
  "front-end": ["react", "vue", "svelte", "next.js", "nextjs", "tailwind", "css", "frontend", "front-end", "ui ", "ux", "shadcn", "design", "component", "animation", "figma", "landing"],
  "back-end": ["api", "server", "express", "fastapi", "backend", "back-end", "graphql", "rest", "microservice", "endpoint", "node.js", "django"],
  database: ["database", "postgres", "sqlite", "mysql", "redis", "vector", "embedding", "sql", "supabase", "mongodb", "duckdb", "prisma", "neon"],
  auth: ["auth", "oauth", "clerk", "jwt", "login", "session", "sso", "identity", "credential", "rbac"],
  browser: ["browser", "playwright", "puppeteer", "chrome", "scrape", "stagehand", "crawl", "screenshot", "web-scraping", "browserbase"],
  payments: ["stripe", "payment", "billing", "checkout", "invoice", "subscription", "paypal"],
  devops: ["deploy", "docker", "kubernetes", "vercel", "aws", "gcp", "terraform", "ci/cd", "sandbox", "e2b", "fly.io", "cloudflare", "infra"],
  observability: ["log", "trace", "metric", "monitor", "observability", "posthog", "sentry", "telemetry", "analytics", "opentelemetry"],
  comms: ["slack", "email", "discord", "telegram", "sms", "twilio", "gmail", "notification", "webhook", "chat"],
  search: ["search", "firecrawl", "rag", "retrieval", "index", "crawl", "web-search", "tavily", "exa", "perplexity"],
  "ai-agents": ["agent", "llm", "claude", "gpt", "openai", "anthropic", "mcp server", "memory", "prompt", "orchestrat", "swarm", "multi-agent"],
  "github-vcs": ["github", "git ", "gitlab", "version control", "pull request", "commit", "repo"],
};

// vertical buckets — the ECONOMIC / INDUSTRY sector a component serves (orthogonal to DOMAINS, which is
// the technical function: a Stripe MCP is domain=payments AND vertical=finance). Same cheap keyword scan.
// A component matching nothing is honestly null — most building blocks are industry-agnostic. Specific
// industries are listed first so an exact-hit tie prefers them over a horizontal (devtools/ai-infra).
const VERTICALS = {
  finance: ["finance", "financial", "fintech", "banking", "trading", "cryptocurrency", "blockchain", "invoice", "invoicing", "accounting", "payroll", "brokerage", "stripe", "plaid", "quickbooks", "payment", "billing", "defi", "wallet"],
  legal: ["legal", "lawyer", "attorney", "law firm", "litigation", "paralegal", "gdpr", "compliance", "regulatory", "terms of service", "intellectual property", "patent", "courtroom", "legislation", "contract review"],
  healthcare: ["healthcare", "health care", "medical", "medicine", "patient care", "clinical", "hospital", "fhir", "hipaa", "diagnosis", "pharmaceutical", "biotech", "telemedicine", "physician", "genomics"],
  "e-commerce": ["e-commerce", "ecommerce", "shopify", "woocommerce", "online store", "retail", "shopping cart", "checkout", "product catalog", "dropshipping", "storefront", "magento", "bigcommerce", "merchandise"],
  marketing: ["marketing", "seo", "advertising", "ad campaign", "email marketing", "crm", "hubspot", "salesforce", "social media", "content marketing", "lead generation", "newsletter", "mailchimp", "google ads", "copywriting"],
  education: ["education", "edtech", "e-learning", "online course", "student", "teacher", "tutoring", "curriculum", "classroom", "flashcard", "academic", "coursework", "learning management", "lesson plan"],
  gaming: ["game development", "gamedev", "video game", "gaming", "unity engine", "unreal engine", "godot", "multiplayer game", "esports", "roblox", "minecraft", "game engine", "game server"],
  productivity: ["productivity", "todo list", "task management", "note-taking", "notion", "todoist", "project management", "jira", "asana", "trello", "calendar", "obsidian", "kanban", "time tracking"],
  "data-analytics": ["analytics", "data pipeline", "etl", "data warehouse", "business intelligence", "data science", "dbt", "tableau", "looker", "bigquery", "snowflake", "data visualization", "olap", "spreadsheet"],
  security: ["security", "cybersecurity", "vulnerability", "penetration test", "pentest", "encryption", "firewall", "threat detection", "malware", "infosec", "siem", "secrets management", "owasp", "authentication", "authorization"],
  devtools: ["developer tool", "devtools", "debugger", "linter", "code review", "code editor", "testing framework", "package manager", "build tool", "compiler", "version control", "ci/cd", "refactoring", "boilerplate", "scaffolding"],
  "ai-infra": ["large language model", "inference", "vector database", "embedding", "fine-tuning", "model serving", "rag ", "model training", "hugging face", "ollama", "langchain", "vllm", "prompt engineering", "model deployment", "llm"],
};

// signal → weight in the Universal blend (community citation counts most, then stars, then registry
// usage, then forks). The weight orders the `others` term ONLY — the strongest percentile is always the
// base, whatever signal produced it — so a weight expresses "how much does this corroborate", not "how
// much does this win".
//
// `tested` sits at parity with stars, NOT above it, because today it is BINARY: eval_score is 1 or 0, so
// every tool that passed lands on the same auto-p100 and a heavier weight would simply hand that one bit
// the loudest voice in the blend. Raise it above 1.0 only once eval_score is a GRADED number that can
// separate two passing tools.
//
// `forks` is the weakest independent claim: it correlates with stars (both are "GitHub users noticed
// this") but measures a different act — copying, not bookmarking. It is deliberately below stars so a
// forked-but-unstarred repo can never out-argue a starred one.
//
// EXPORTED because /formula renders the visible arithmetic from this exact object. A hand-typed mirror
// there once printed a sum that did not equal the score beside it (docs/FORMULA-AUDIT.md §H12).
export const WEIGHTS = { tested: 1.0, mentions: 1.2, stars: 1.0, usage: 0.9, forks: 0.8 };

// The monotone blend. `base` = the row's strongest single percentile; `others` = the weight-averaged
// percentile of every OTHER signal it holds (0 when it holds none). base + others = 1.0, so a row that
// is p100 on everything scores 100, and a row with one signal caps at 80 — the same ceiling a single
// signal had before. The point of the split is that `others` is added, never averaged in: earning a
// second signal cannot subtract. Under the old weighted mean it could, and did — a p100 repo that
// picked up one mention (p40.4) lost 19.3 points for the crime of being cited (§H2).
export const BLEND = { base: 0.8, others: 0.2 };

// A row is STALE when its repo has not been pushed to in this long. Advisory only — a flag and a
// tiebreak, never a term in the score. Freshness proves a repo is alive, not that anyone uses it; a
// fresh 0-star repo must not outrank a maintained 100-star one.
const STALE_DAYS = 730; // 24 months

const domainOf = (text) => {
  const t = (text || "").toLowerCase();
  let best = "other", hits = 0;
  for (const [dom, kws] of Object.entries(DOMAINS)) {
    const h = kws.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
    if (h > hits) { best = dom; hits = h; }
  }
  return best;
};
// best-matching industry vertical, or null when nothing matches (unlike domainOf, there is no "other"
// bucket — an industry-agnostic building block should stay unclassified, not be forced into a sector).
const verticalOf = (text) => {
  const t = (text || "").toLowerCase();
  let best = null, hits = 0;
  for (const [vert, kws] of Object.entries(VERTICALS)) {
    const h = kws.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
    if (h > hits) { best = vert; hits = h; }
  }
  return best;
};
const stars = (v) => (typeof v === "number" && v > 0 && v <= STAR_CEILING ? v : null);
const pos = (v) => (typeof v === "number" && v > 0 ? v : null);

// Hosts that publish their own install/usage counters, ship packages, host papers, or host models.
// Anything not matched falls through to `website` — including gitlab/bitbucket, which have no fetcher.
const REGISTRY_HOSTS = new Set(["smithery.ai", "mcp.so", "glama.ai", "pulsemcp.com", "mcpservers.org", "mcp-get.com", "mcpmarket.com", "mcp.pipedream.com", "cursor.directory"]);
const PACKAGE_HOSTS = new Set(["npmjs.com", "registry.npmjs.org", "pypi.org", "crates.io", "packagist.org", "rubygems.org", "pkg.go.dev"]);
const PAPER_HOSTS = new Set(["arxiv.org", "doi.org", "semanticscholar.org", "acm.org", "dl.acm.org", "ieee.org", "openreview.net", "aclanthology.org", "biorxiv.org", "papers.nips.cc", "proceedings.mlr.press"]);
const REPO_ROOT = /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/#?]+\/?$/i;

// The KIND of a thing, from where it lives. This is the percentile POOL: a repo's stars are ranked
// against other repos' stars, a registry listing's installs against other registry listings'. Without
// this the pools silently mix — a PyPI package's 2,000 downloads would be ranked against an npm
// package's 87 million, and a file inside a repo against the repo itself (docs/FORMULA-AUDIT.md §H11).
export function kindOf(row) {
  const u = String(row?.url || "").trim();
  if (!u) return "website";
  let host = "";
  try { host = new URL(u).host.replace(/^www\./, "").toLowerCase(); } catch { return "website"; }
  if (host === "github.com") return REPO_ROOT.test(u) ? "github-root" : "github-file";
  if (REGISTRY_HOSTS.has(host)) return "registry";
  if (PACKAGE_HOSTS.has(host)) return "package";
  if (PAPER_HOSTS.has(host)) return "paper";
  if (host === "huggingface.co" || host === "hf.co") return "hf";
  return "website";
}

// The identity a percentile pool counts by. 3,625 URLs in the catalog carry more than one row (a stale
// crawl and a fresh crawl of the same server both survived), which inflated every pool's denominator
// AND pushed the same value in several times — half the usage pool was measured against copies of
// itself (§H6). Rows with no URL fall back to their own index so they still count once.
const urlKey = (url, i) => String(url || "").trim().replace(/\/+$/, "").toLowerCase() || `row:${i}`;

// PURE: build + score rows from a components array (no file IO — so the Next.js site can rank a
// catalog it read itself, and the CLI/MCP can rank the sibling catalog. One formula, two callers).
export function computeRows(components) {
  const now = Date.now();
  const list = (components || []).map((c, i) => {
    const text = [c.name, c.description, c.tags].filter(Boolean).join(" ");
    const url = c.source_url || (typeof c.source_repo === "string" ? c.source_repo : null);
    // Data-quality normalization: a "stars" figure is GitHub stars ONLY when the source is GitHub.
    // Non-GitHub sources (e.g. Smithery) put a USAGE count in that field — a different metric entirely.
    // So a repo's claim to fame is stars; a Smithery MCP's is usage. Never conflate them.
    const isGithub = /github\.com/i.test(url || "");
    const raw = typeof c.stars === "number" && c.stars > 0 ? c.stars : null;
    const kind = kindOf({ url });
    // `pushed_at` is metadata, never a signal. It answers "is this alive?", which is a different
    // question from "does anyone use this?" — so it breaks ties and raises a Stale flag, and stays
    // out of the arithmetic entirely.
    const pushed = typeof c.pushed_at === "string" && c.pushed_at ? c.pushed_at : null;
    const pushedMs = pushed ? Date.parse(pushed) : NaN;
    return {
      name: c.name,
      // `type` is the RAW catalog/folder name ("mcps", "clis-tools", …) — it is the path segment the
      // internal detail route /e/[type]/[slug] is built from. `component` is the normalized display
      // label ("mcp", "cli"). Both are carried: one addresses, one reads.
      type: c.type || null,
      component: COMPONENT[c.type] || c.type || "other",
      domain: domainOf(text),
      vertical: verticalOf(text),
      url,
      kind,
      urlKey: urlKey(url, i),
      license: c.license,
      desc: (c.description || "").slice(0, 160),
      pushed_at: pushed,
      // Unknown is not stale. A row we never asked about stays honestly unflagged.
      stale: Number.isFinite(pushedMs) ? now - pushedMs > STALE_DAYS * 86_400_000 : false,
      signals: {
        stars: isGithub ? stars(c.stars) : null,
        usage: !isGithub ? raw : null,
        tested: c.eval_score, mentions: c.mentions ?? null,
        // Forks belong to a REPO. A file inside a repo has not earned its parent's forks any more than
        // it earned its parent's stars, so only a repo root carries this.
        forks: kind === "github-root" ? pos(c.forks) : null,
      },
    };
  });
  score(list);
  return list;
}

let _rows = null;
export function rows() {
  if (_rows) return _rows;
  const cat = JSON.parse(readFileSync(CATALOG, "utf-8"));
  _rows = computeRows(cat.components);
  return _rows;
}

// One percentile map for one signal. The pool is (signal × kind) over DISTINCT URLs: the first row on a
// URL contributes the group's single value, and every row on that URL then receives that same
// percentile — so five copies of one Smithery server no longer score 1.3 and 73.0 at the same time, and
// no longer count five times against everyone else's denominator.
// A pool needs enough distinct artifacts to be a distribution. Below this, "percentile within kind"
// degenerates (a sole member is p100 by definition — codeforces-mcp-server went 12.2 → 80.0 as the
// only usage|package row), so small pools fall back to the signal's all-kinds pool.
const MIN_POOL = 30;

function percentiles(list, sig) {
  const pools = new Map(); // kind → { byUrl: Map<urlKey, value> }; "*" = all kinds
  const put = (kind, r) => {
    let pool = pools.get(kind);
    if (!pool) { pool = { vals: [], byUrl: new Map() }; pools.set(kind, pool); }
    // Rows sharing a URL are ONE artifact: it speaks once, with its best-known value (copies of the
    // same listing can carry stale counts; the group's number is the max, never the first seen).
    const prev = pool.byUrl.get(r.urlKey);
    if (prev == null || r.signals[sig] > prev) pool.byUrl.set(r.urlKey, r.signals[sig]);
  };
  for (const r of list) {
    if (r.signals[sig] == null) continue;
    put(r.kind, r);
    put("*", r);
  }
  for (const pool of pools.values()) pool.vals = [...pool.byUrl.values()].sort((a, b) => a - b);
  const m = new Map();
  for (const r of list) {
    if (r.signals[sig] == null) continue;
    let pool = pools.get(r.kind);
    if (pool.vals.length < MIN_POOL) pool = pools.get("*");
    const { vals } = pool;
    const v = pool.byUrl.get(r.urlKey) ?? r.signals[sig]; // the group's value, not this copy's
    let lo = 0, hi = vals.length;  // fraction of values ≤ v
    while (lo < hi) { const mid = (lo + hi) >> 1; if (vals[mid] <= v) lo = mid + 1; else hi = mid; }
    m.set(r, Math.round((1000 * lo) / vals.length) / 10);
  }
  return m;
}

function score(list) {
  const pct = Object.fromEntries(Object.keys(WEIGHTS).map((s) => [s, percentiles(list, s)]));
  for (const r of list) {
    const axes = {};
    for (const s of Object.keys(WEIGHTS)) { const p = pct[s].get(r); if (p != null) axes[s] = p; }
    const held = Object.keys(axes);
    // BASE — the row's single strongest claim, whatever produced it. Ties go to the heavier-weighted
    // signal (the more deliberate evidence), then to WEIGHTS key order, so this is deterministic.
    let base = null;
    for (const s of held) {
      if (base === null || axes[s] > axes[base] || (axes[s] === axes[base] && WEIGHTS[s] > WEIGHTS[base])) base = s;
    }
    // OTHERS — the weight-averaged percentile of everything else, or 0 when there is nothing else.
    let parts = 0, wsum = 0;
    for (const s of held) if (s !== base) { parts += axes[s] * WEIGHTS[s]; wsum += WEIGHTS[s]; }
    const others = wsum ? parts / wsum : 0;
    r.scores = {
      universal: base === null ? null : Math.round(10 * (BLEND.base * axes[base] + BLEND.others * others)) / 10,
      tested: axes.tested ?? null, popular: axes.stars ?? null, practitioner: axes.mentions ?? null,
      evidence: held.length,
      // Shown-not-explained: /formula renders the arithmetic from exactly these, so the page cannot
      // print a sum that disagrees with the score beside it.
      pct: axes, base, others: wsum ? others : null,
    };
    // The PRIMARY metric = the row's strongest NUMERIC popularity signal (its claim to fame as a
    // NUMBER — stars for a repo, usage for a Smithery MCP, mentions for a community pick). Shown first,
    // per artifact, instead of a universal stars column. "tested" is a separate quality badge (below),
    // never the headline number — so the top isn't a monotonous wall of "verified".
    let pk = null, pp = -1;
    for (const s of ["stars", "usage", "mentions"]) { const p = axes[s]; if (p != null && p > pp) { pp = p; pk = s; } }
    // Forks are a fallback headline, never a competitor to stars: a repo is known by its stars, and a
    // forked-but-unstarred repo would otherwise be ranked with nothing to show for it.
    if (!pk && axes.forks != null) pk = "forks";
    if (!pk && axes.tested != null) pk = "tested";      // nothing numeric → fall back to the verified badge
    r.primary = pk ? { key: pk, value: r.signals[pk], pct: axes[pk], label: METRIC_LABEL[pk] || pk } : null;
    r.verified = r.signals.tested != null;              // a trust chip shown alongside, when we measured it
  }
}

// display metadata per signal — the label an agent/human sees for a primary metric.
const METRIC_LABEL = { stars: "stars", usage: "used", tested: "tested", mentions: "mentions", forks: "forks", downloads: "downloads" };

const num = (v, lo = -1) => (typeof v === "number" ? v : lo);
const nm = (r) => (r.name || "").toLowerCase();
// Negated epoch ms, so "most recently pushed first" sorts ascending like every other key here. Rows we
// never asked about (and unparseable dates) fall to 0 and therefore sort LAST among equals — honest,
// since an unknown push date is not a claim of freshness.
const fresh = (r) => { const t = r.pushed_at ? Date.parse(r.pushed_at) : NaN; return Number.isFinite(t) ? -t : 0; };
// "Popular" is the row's NUMERIC popularity, whatever shape it takes — a repo's stars or a registry
// listing's installs (the site labels that column "Usage"). Sorting by it on `stars` alone made the
// axis byte-identical to the `stars` axis and silently dropped every registry listing to the bottom.
// `stars` stays stars, for when the question really is "how starred is this repo".
const popularity = (r) => r.signals.usage ?? r.signals.stars;
const PRIMARY = {
  universal: (r) => r.scores.universal, popular: popularity, tested: (r) => r.scores.tested,
  practitioner: (r) => r.signals.mentions, stars: (r) => r.signals.stars, name: (r) => r.name,
};
const KEY = {
  // universal → evidence → most recently pushed → stars → name. Freshness enters HERE and only here:
  // 8,124 rows share the bottom score, and "the alive one first" is a better answer than "the one whose
  // name starts with 'a'". It still cannot buy a single point of score.
  universal: (r) => [-num(r.scores.universal), -num(r.scores.evidence, 0), fresh(r), -num(r.signals.stars), nm(r)],
  popular: (r) => [-num(popularity(r)), nm(r)],
  tested: (r) => [-num(r.scores.tested), nm(r)],
  practitioner: (r) => [-num(r.signals.mentions), nm(r)],
  stars: (r) => [-num(r.signals.stars), nm(r)],
  name: (r) => [nm(r)],
};
const cmp = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; } return 0; };

// PURE: filter + sort + slice a scored row-set. The site passes rows it computed itself.
export function rankRows(scored, { component = null, domain = null, vertical = null, sort = "universal", dir = "desc", limit = 200 } = {}) {
  let items = scored.filter((r) => (!component || r.component === component) && (!domain || r.domain === domain) && (!vertical || r.vertical === vertical));
  const key = KEY[sort] || KEY.universal;
  items = items.map((r) => [key(r), r]).sort((a, b) => cmp(a[0], b[0])).map((x) => x[1]);
  if (dir === "asc") {
    const p = PRIMARY[sort] || PRIMARY.universal;
    const ranked = items.filter((r) => p(r) != null), unranked = items.filter((r) => p(r) == null);
    items = ranked.reverse().concat(unranked);
  }
  return { items: items.slice(0, limit).map(flat), total: items.length, sort, dir, component, domain, vertical, facets: facetsOf(scored) };
}

// convenience for the CLI/MCP: rank the sibling catalog (cached). The site uses computeRows + rankRows.
export function leaderboard(query) { return rankRows(rows(), query); }

const flat = (r) => ({
  name: r.name, type: r.type ?? null, component: r.component, domain: r.domain, vertical: r.vertical,
  url: r.url, license: r.license, kind: r.kind,
  universal: r.scores.universal, evidence: r.scores.evidence, primary: r.primary, verified: r.verified ?? false,
  signals: { stars: r.signals.stars, usage: r.signals.usage, tested: r.signals.tested, mentions: r.signals.mentions, forks: r.signals.forks },
  stars: r.signals.stars, usage: r.signals.usage, tested: r.signals.tested, mentions: r.signals.mentions,
  forks: r.signals.forks, pushed_at: r.pushed_at ?? null, stale: r.stale ?? false, desc: r.desc,
});

export function facetsOf(scored) {
  const count = (f) => { const m = new Map(); for (const r of scored) m.set(f(r), (m.get(f(r)) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1]).map(([key, n]) => ({ key, count: n })); };
  return {
    components: count((r) => r.component), domains: count((r) => r.domain),
    verticals: count((r) => r.vertical).filter((v) => v.key != null),
    kinds: count((r) => r.kind),
    // how many rows we KNOW are dormant — not how many we have no push date for
    stale: scored.reduce((n, r) => n + (r.stale ? 1 : 0), 0),
    total: scored.length,
  };
}
export function facets() { return facetsOf(rows()); }
