// lib/rank.mjs — the Universal ranking engine for the Armory catalog.
//
// One normalized rating for every open-source building block, whatever its shape (MCP, CLI, skill,
// plugin, repo, package, docs page, website, paper). Each signal is turned into a 0–100 percentile
// WITHIN ITS OWN KIND (a repo's stars against other repos' stars, a registry's installs against other
// registries' installs) and pooled per DISTINCT URL, so the same artifact listed five times counts once
// and scores once. The Universal score is then MONOTONE: `0.8 × base + 0.2 × others`, where `base` is
// the row's single strongest percentile and `others` is its second strongest. One signal caps at 80; a
// second adds; a third counts only when it beats one of the first two. Earning more evidence can never
// lower a score. A component with no real signal is honestly unranked (never faked to the top).
// The formula and every signal are open — see /formula.
//
// Portable ESM (no build step) so the Next.js site, the CLI, and the MCP server all import it.
// Reads catalog.json. Zero external deps.

import { existsSync, readFileSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Guarded so importing this module into a bundler (Next.js) never throws at import time; the site
// imports only the PURE functions (computeRows/rankRows) and never touches CATALOG.
let HERE = ".";
try { HERE = dirname(fileURLToPath(import.meta.url)); } catch { HERE = process.cwd(); }
const CATALOG = join(HERE, "..", "catalog.json");
// The gzipped copy ingest/catalog.mjs writes beside it is read first (docs/CATALOG-SIZE.md), but only
// while it is at least as new as the plain file: it is gitignored, so a `git pull` that brings a newer
// catalog.json leaves an older .gz behind.
const readCatalog = () => {
  const gz = `${CATALOG}.gz`;
  const fresh = existsSync(gz) && (!existsSync(CATALOG) || statSync(gz).mtimeMs >= statSync(CATALOG).mtimeMs);
  return fresh ? gunzipSync(readFileSync(gz)).toString("utf-8") : readFileSync(CATALOG, "utf-8");
};
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
  payments: ["stripe", "payment", "billing", "checkout", "invoice", "paypal", "lemonsqueezy", "lemon squeezy", "chargebee"],
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

// signal → weight (community citation first, then stars, then registry usage, then forks). The blend
// takes the strongest and second-strongest percentiles whatever produced them; the weight decides only
// which signal leads when two percentiles tie, so it expresses "which evidence is more deliberate", never
// "how much does this win". (It used to weight-average the `others` term, which let a weaker third signal
// pull a score down: CP143 T20.)
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

// The monotone blend. `base` = the row's strongest single percentile; `others` = its second strongest (0
// when it holds one signal). base + others = 1.0, so a row p100 on two signals scores 100, and a row with
// one signal caps at 80. `others` is the best of the rest, never an average of the rest: under the old
// weighted mean a p100 repo that picked up one mention (p40.4) lost 19.3 points (§H2), and averaging the
// rest still let a weaker third signal cost points, as it did on all 169 rows holding three or more
// (CP143 T20). A signal now counts only when it raises the score.
export const BLEND = { base: 0.8, others: 0.2 };

// A row is STALE when its repo has not been pushed to in this long. Advisory only — a flag and a
// tiebreak, never a term in the score. Freshness proves a repo is alive, not that anyone uses it; a
// fresh 0-star repo must not outrank a maintained 100-star one.
const STALE_DAYS = 730; // 24 months

// Words that count toward a domain only beside one of its own words. "Subscription" alone is usually
// someone's plan ("run any coding agent with your own subscription"), a feed or an event stream; beside
// "billing" or "stripe" it is billing (CP138 PR F).
const SUPPORTING = { payments: ["subscription"] };
// A domain word counts only where a word starts (CP138 PR G): "log" inside "catalog", "api" inside "capital",
// "rag" inside "storage", "ux" inside "linux" and "search" inside "research" used to count. A compound that
// ends in one and names the same thing is read as that word, and only as it ("chatgpt" is "gpt", not "chat"):
// every word that carried a domain word inside it on 20 or more rows was read, and these are the ones that do.
const COMPOUNDS = {
  api: ["openapi"], sql: ["mssql"], vector: ["pgvector"], payment: ["micropayment"], chat: ["wechat"],
  search: ["elasticsearch", "websearch", "opensearch"], rag: ["graphrag"], index: ["llamaindex"],
  gpt: ["chatgpt"], agent: ["subagent"], repo: ["monorepo"],
};
const AS_WORD = Object.entries(COMPOUNDS).flatMap(([k, cs]) => cs.map((c) => [c, new RegExp(`(^|[^a-z0-9])${c}`, "g"), `$1${k}`]));
const atWordStart = (t, k) => {
  for (let i = t.indexOf(k); i !== -1; i = t.indexOf(k, i + 1)) {
    const c = i === 0 ? "" : t[i - 1];
    if (!(c >= "a" && c <= "z") && !(c >= "0" && c <= "9")) return true;
  }
  return false;
};
const domainOf = (text) => {
  const raw = (text || "").toLowerCase();
  const t = AS_WORD.reduce((s, [c, rx, k]) => (s.includes(c) ? s.replace(rx, k) : s), raw);
  let best = "other", hits = 0, weak = 0;
  for (const [dom, kws] of Object.entries(DOMAINS)) {
    let h = kws.reduce((n, k) => n + (atWordStart(t, k) ? 1 : 0), 0);
    if (h === 0) continue;
    h += (SUPPORTING[dom] ?? []).reduce((n, k) => n + (atWordStart(t, k) ? 1 : 0), 0);
    // A domain word inside another word is weak evidence: it no longer counts on its own, but it still breaks a
    // tie between domains that each have a word, as every match did before.
    const w = kws.reduce((n, k) => n + (raw.includes(k) ? 1 : 0), 0);
    if (h > hits || (h === hits && w > weak)) { best = dom; hits = h; weak = w; }
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

// A repository's root written another way: `…/repo#readme`, `…/repo?tab=readme`, `…/repo.git` or
// `…/repo/tree/main` all name the repository itself, not a file inside it (CP143 T56). Returns the
// canonical `https://github.com/owner/repo`, or null for a real subpath (`/tree/main/src/x`, `/blob/…`).
const ROOT_IN_DISGUISE = /^https?:\/\/(?:www\.)?github\.com\/([^/\s#?]+)\/([^/\s#?]+?)(?:\.git)?\/?(?:\/tree\/[^/\s#?]+\/?)?(?:[#?].*)?$/i;
export function repoRootUrl(url) {
  const m = ROOT_IN_DISGUISE.exec(String(url || "").trim());
  return m ? `https://github.com/${m[1]}/${m[2]}` : null;
}

// The KIND of a thing, from where it lives. This is the percentile POOL: a repo's stars are ranked
// against other repos' stars, a registry listing's installs against other registry listings'. Without
// this the pools silently mix — a PyPI package's 2,000 downloads would be ranked against an npm
// package's 87 million, and a file inside a repo against the repo itself (docs/FORMULA-AUDIT.md §H11).
export function kindOf(row) {
  const u = String(row?.url || "").trim();
  if (!u) return "website";
  let host = "";
  try { host = new URL(u).host.replace(/^www\./, "").toLowerCase(); } catch { return "website"; }
  if (host === "github.com") return REPO_ROOT.test(u) || repoRootUrl(u) ? "github-root" : "github-file";
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
// A root written another way (`#readme`, `.git`, `/tree/main`) is the same artifact as the root.
const urlKey = (url, i) => String(repoRootUrl(url) || url || "").trim().replace(/\/+$/, "").toLowerCase() || `row:${i}`;

// PURE: build + score rows from a components array (no file IO — so the Next.js site can rank a
// catalog it read itself, and the CLI/MCP can rank the sibling catalog. One formula, two callers).
// The feed that contributed a row: a `<name>-feed` tag names it ("sentinel-feed" → "Sentinel"). Read from
// the tag, never hard-coded, so a new feed labels itself; the site's src/lib/format.ts contributorOf is
// the same rule.
function contributorOf(tags) {
  for (const tag of Array.isArray(tags) ? tags : []) {
    const m = typeof tag === "string" ? /^(.+)-feed$/.exec(tag.trim()) : null;
    if (m) return m[1].charAt(0).toUpperCase() + m[1].slice(1);
  }
  return null;
}

export function computeRows(components) {
  const now = Date.now();
  const list = (components || []).map((c, i) => {
    const text = [c.name, c.description, c.tags].filter(Boolean).join(" ");
    // A row in SHELF_MOVES is listed where its job is; its `type`, and so its address, stays (CP138 PR E).
    const component = SHELF_MOVES[`${c.type}/${c.name}`] || COMPONENT[c.type] || c.type || "other";
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
      component,
      // Whether the row does its component's job (SHELF_FIT below); only rows that do are listed under it.
      fits: fitsShelf({ name: c.name, type: c.type, component, description: c.description }),
      domain: domainOf(text),
      vertical: verticalOf(text),
      url,
      kind,
      urlKey: urlKey(url, i),
      license: c.license,
      contributor: contributorOf(c.tags),
      desc: (c.description || "").slice(0, 160),
      pushed_at: pushed,
      // Unknown is not stale. A row we never asked about stays honestly unflagged.
      stale: Number.isFinite(pushedMs) ? now - pushedMs > STALE_DAYS * 86_400_000 : false,
      signals: {
        // Stars belong to a REPO, like forks below: a file or folder inside a repo has not earned its
        // parent's count, so a subpath row is scored on its own evidence only (CP143 T56). 321 file rows
        // used to carry their parent's stars, which let a folder outrank the project it sits in.
        stars: isGithub && kind === "github-root" ? stars(c.stars) : null,
        usage: !isGithub ? raw : null,
        // A recorded 0 is no signal, the same as a missing one: nobody has cited it yet, which is not a
        // measurement to rank (CP143 T20 — `mentions: 0` used to count as p7.3 and cost 11 rows ten points).
        tested: c.eval_score, mentions: pos(c.mentions),
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
  const cat = JSON.parse(readCatalog());
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
export const MIN_POOL = 30; // exported so /formula states the same number

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
    // Kept exact. Rounding here, before the blend, rounded twice: 3,111 rows (10% of everything
    // ranked) printed a Universal 0.1 away from their own arithmetic. The score is rounded once, at
    // the end, in score().
    m.set(r, (100 * lo) / vals.length);
  }
  return m;
}

const r1 = (v) => (v == null ? null : Math.round(10 * v) / 10);
const r4 = (v) => Math.round(1e4 * v) / 1e4;

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
    // OTHERS — the strongest of the rest (the second-best percentile), or 0 when there is nothing else.
    // Ties go to the heavier-weighted signal, as for the base. A weaker third signal is simply not used.
    let second = null;
    for (const s of held) {
      if (s === base) continue;
      if (second === null || axes[s] > axes[second] || (axes[s] === axes[second] && WEIGHTS[s] > WEIGHTS[second])) second = s;
    }
    const others = second === null ? 0 : axes[second];
    // EXACT — the same blend before any rounding, kept to four decimals (in ten-thousandths, as an
    // integer, so the cut below is exact arithmetic). The one-decimal Universal is this number cut
    // ONCE, DOWN, so the two can never disagree and 100.0 is printed only for a row that scores 100
    // (CP138 T23: rounding showed 99.96 as 100.0 on shelves where no row reaches 100). `exact` is also
    // the first tiebreak: at the top of the board the percentiles saturate and twenty rows share 99.9
    // at one decimal, while their exact scores differ in the second and third decimal.
    const e4 = base === null ? null : Math.round(1e4 * (BLEND.base * axes[base] + BLEND.others * others));
    r.scores = {
      universal: e4 === null ? null : Math.floor(e4 / 1000) / 10,
      exact: e4 === null ? null : e4 / 1e4,
      tested: r1(axes.tested), popular: r1(axes.stars), practitioner: r1(axes.mentions),
      evidence: held.length,
      // Shown-not-explained: /formula renders the arithmetic from exactly these, so the page cannot
      // print a sum that disagrees with the score beside it.
      pct: Object.fromEntries(held.map((s) => [s, r4(axes[s])])), base, second, others: second ? r4(others) : null,
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
    r.primary = pk ? { key: pk, value: r.signals[pk], pct: r1(axes[pk]), label: METRIC_LABEL[pk] || pk } : null;
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
  // THE TIEBREAK, in order: the exact score (the Universal before rounding) → more independent signals
  // → most recently pushed → more stars → name. `exact` separates the saturated top of the board, where
  // twenty rows round to 100.0 or 99.9; the rest decide genuine equals. Freshness enters HERE and only
  // here: 8,124 rows share the bottom score, and "the alive one first" is a better answer than "the one
  // whose name starts with 'a'". None of these can buy a single point of score.
  universal: (r) => [-num(r.scores.exact), -num(r.scores.evidence, 0), fresh(r), -num(r.signals.stars), nm(r)],
  popular: (r) => [-num(popularity(r)), nm(r)],
  tested: (r) => [-num(r.scores.tested), nm(r)],
  practitioner: (r) => [-num(r.signals.mentions), nm(r)],
  stars: (r) => [-num(r.signals.stars), nm(r)],
  name: (r) => [nm(r)],
};
const cmp = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; } return 0; };

// Shelf fit (CP138, docs/SHELF-FIT-PROPOSAL.md). The crawl files each row in a folder, and three folders
// are grab-bags: `infrastructure` holds browser tools and inference engines beside the sandboxes,
// `clis-tools` holds whole coding agents and an editor beside the commands, and `workflows` holds
// tutorials and paper code beside the orchestrators. A row in one of these components is listed under it
// (by rankRows, so by /api/rank, the CLI, the MCP server and every shelf page) only when its name and
// description say it does that job (`must`, and not `not`), or when it is on `allow`: a real member the
// words miss. `deny` holds rows the words let in by accident. A row that does not fit keeps its
// component, score and detail page, and stays in search, Browse and the unfiltered leaderboard.
const TERMINAL = {
  purpose: "run as commands from a terminal",
  // AgentShield is a command-line scanner: "AI agent" in its description names what it scans.
  allow: ["crawl4ai", "firecrawl-firecrawl", "claudectx", "vibe-log", "agnix", "claude-task-master", "affaan-m-agentshield"],
  must: /\b(cli|command[- ](line|prompt)|terminal|tui|shell|tmux|ssh)\b/i,
  // Whole agents and editors mention the terminal too. "For your AI agent" names an audience, not a kind.
  not: /(?<!\b(your|for|to|with|by) )\b(autonomous (coding )?agent|ai (coding )?agent|coding agent|personal ai assistant|ai pair programming|web builder|(vs ?code|ide|editor) extension|emacs|neovim)\b/i,
};
export const SHELF_FIT = {
  infra: {
    purpose: "run agent code in isolation",
    allow: ["claude-managed-agents-selfhost"],
    must: /\b(sandbox(es|ed|ing)?|(micro-?)?vms?|firecracker|isolat(ed|ion)|containers?|virtual machines?|code (execution|interpreter)|execut(e|es|ion) (untrusted|ai-generated|arbitrary)|run(s|ning)? (untrusted|ai-generated) code|dev(elopment)? environments?|workspaces?)\b/i,
  },
  cli: TERMINAL,
  tool: TERMINAL,
  workflow: {
    purpose: "route, schedule or loop agent work",
    allow: ["pocketflow", "openai-symphony"],
    // "crewai" here is an A2A sample agent, not CrewAI; the framework itself is moved in below.
    deny: ["setup-monorepo", "system-dynamics-modeler", "crewai"],
    // "Human-in-the-loop" is an approval step, not a loop.
    must: /\b(orchestrat\w*|dispatch\w*|delegat\w*|multi-agent|swarms?|queues?|state machines?|durable execution|workflow (automation|engine|orchestration)s?|cron|scheduler|scheduled (runs?|jobs?|tasks?|agents?)|looping)\b|(?<!in-the-|in the )\bloops?\b/i,
    not: /\b(tutorials?|guides?|courses?|curriculum|books?|awesome|list of|curated list|papers?|from scratch|tips|index of|mirror|collection of|directory|cheatsheet|handbook|exercises|walk-?through|learning resources?)\b/i,
  },
};

// Rows filed under a type whose job they do not do, listed where their job is (CP138 PR E). A move changes
// the component a row is listed under and nothing else: its type stays, so its address (/e/<type>/<name>)
// never changes. Keyed type/name, because a name can repeat across types. A moved row fits its new shelf.
export const SHELF_MOVES = {
  // Dispatch: orchestration frameworks and runners the crawl filed as command-line tools or MCP servers.
  "clis-tools/ruflo": "workflow",
  "clis-tools/crewaiinc-crewai": "workflow",
  "clis-tools/microsoft-autogen": "workflow",
  "clis-tools/langchain-ai-langgraph": "workflow",
  "clis-tools/openai-openai-agents-python": "workflow",
  "clis-tools/sudocode": "workflow",
  "clis-tools/stablyai-orca": "workflow",
  "mcps/praisonai": "workflow",
  "mcps/bernstein": "workflow",
  "clis-tools/mastra-ai-mastra": "workflow",
  // Sandbox: environments that isolate agent work, filed as a command-line tool or as MCP servers.
  "clis-tools/container-use": "infra",
  "mcps/babelcloud-gru-sandbox": "infra",
  "mcps/runno": "infra",
  // Tools: command-line tools filed as a workflow or as MCP servers.
  "workflows/ccoutputstyles": "cli",
  "mcps/snyk-cli": "cli",
  "mcps/cocoindex-code": "cli",
};

// PURE: does this row do its component's job? A moved row does, by decision; a row outside the components
// SHELF_FIT names always does.
export function fitsShelf({ name = "", type = null, component = null, description = "" } = {}) {
  if (type && SHELF_MOVES[`${type}/${name}`]) return true;
  const rule = SHELF_FIT[COMPONENT[component] ?? component];
  if (!rule) return true;
  if (rule.deny?.includes(name)) return false;
  if (rule.allow.includes(name)) return true;
  const text = `${name} ${description || ""}`;
  return rule.must.test(text) && !rule.not?.test(text);
}

// The site's shelves (web/src/data/stack.json slugs) and the components each lists, so `armory rank -c tools`
// and rank_components{component:"dispatch"} rank a whole shelf. A test keeps this in step with stack.json.
export const SHELVES = {
  identity: ["identity", "rules"], memory: ["memory"], skills: ["skill"], tools: ["cli", "tool"],
  hooks: ["hook"], subagents: ["subagent"], mcps: ["mcp"], dispatch: ["workflow"], evals: ["eval"],
  observability: ["observability"], sandbox: ["infra"],
};
const KEYS = new Set(Object.values(COMPONENT));
// PURE: the components a --component value lists. A component key lists exactly its own rows, so a
// leaderboard chip's count holds ("identity" is the identity rows, not the whole Identity shelf). A shelf name
// that is not also a key lists the whole shelf ("tools" is cli and tool). Anything else is read as a catalog
// type ("clis-tools", "sandboxes"). "tool" is the one key no catalog type files rows under, and the CLI help
// has always offered it, so it lists the Tools shelf rather than nothing.
export function componentsOf(name) {
  if (name === "tool") return SHELVES.tools;
  if (KEYS.has(name)) return [name];
  return SHELVES[name] ?? [COMPONENT[name] ?? name];
}

// PURE: filter + sort + slice a scored row-set. The site passes rows it computed itself.
export function rankRows(scored, { component = null, domain = null, vertical = null, sort = "universal", dir = "desc", limit = 200 } = {}) {
  // Accept the shelf name the site and /stack use ("skills", "mcps") as well as the engine's
  // singular key ("skill", "mcp"). Without this, `armory rank --component skills` and the MCP's
  // rank_components{component:"skills"} silently returned 0 rows — it only ever worked for
  // "memory", the one shelf whose name is the same in both forms. "tools" still returned 0 rows until
  // CP138 PR E, because it named the empty `tool` component instead of the Tools shelf; SHELVES fixes that.
  const members = component ? componentsOf(component) : null;
  if (members) component = members.length === 1 ? members[0] : component;
  let items = scored.filter((r) => (!members || members.includes(r.component)) && (!domain || r.domain === domain) && (!vertical || r.vertical === vertical));
  // A component SHELF_FIT names lists only the rows that do its job; `fit` says so and counts the rest.
  const rule = members ? members.map((m) => SHELF_FIT[m]).find(Boolean) ?? null : null;
  const filed = items.length;
  if (rule) items = items.filter((r) => r.fits !== false);
  const fit = rule ? { purpose: rule.purpose, filed, left_out: filed - items.length } : null;
  const key = KEY[sort] || KEY.universal;
  items = items.map((r) => [key(r), r]).sort((a, b) => cmp(a[0], b[0])).map((x) => x[1]);
  if (dir === "asc") {
    const p = PRIMARY[sort] || PRIMARY.universal;
    const ranked = items.filter((r) => p(r) != null), unranked = items.filter((r) => p(r) == null);
    items = ranked.reverse().concat(unranked);
  }
  // `components` names what the component filter listed ("tools" is cli and tool), so the leaderboard lights
  // the chip a shelf name resolves to; null without a component filter.
  return { items: items.slice(0, limit).map(flat), total: items.length, sort, dir, component, components: members, domain, vertical, fit, facets: facetsOf(scored) };
}

// PURE: the default order (the tiebreak above) over rows a caller scored itself, returned whole rather
// than flattened. The site's home board and shelves sort with this, so their order cannot drift from
// rankRows'.
export function orderByScore(scored) {
  return scored.map((r) => [KEY.universal(r), r]).sort((a, b) => cmp(a[0], b[0])).map((x) => x[1]);
}

// convenience for the CLI/MCP: rank the sibling catalog (cached). The site uses computeRows + rankRows.
export function leaderboard(query) { return rankRows(rows(), query); }

const flat = (r) => ({
  name: r.name, type: r.type ?? null, component: r.component, domain: r.domain, vertical: r.vertical,
  url: r.url, license: r.license, kind: r.kind, contributor: r.contributor ?? null,
  universal: r.scores.universal, exact: r.scores.exact ?? null, evidence: r.scores.evidence, primary: r.primary, verified: r.verified ?? false,
  signals: { stars: r.signals.stars, usage: r.signals.usage, tested: r.signals.tested, mentions: r.signals.mentions, forks: r.signals.forks },
  stars: r.signals.stars, usage: r.signals.usage, tested: r.signals.tested, mentions: r.signals.mentions,
  forks: r.signals.forks, pushed_at: r.pushed_at ?? null, stale: r.stale ?? false, desc: r.desc,
});

export function facetsOf(scored) {
  const count = (f) => { const m = new Map(); for (const r of scored) m.set(f(r), (m.get(f(r)) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1]).map(([key, n]) => ({ key, count: n })); };
  return {
    // A component counts the rows its filter lists, so a row that does not do its job (SHELF_FIT) is left out.
    components: count((r) => (r.fits === false ? null : r.component)).filter((c) => c.key != null), domains: count((r) => r.domain),
    verticals: count((r) => r.vertical).filter((v) => v.key != null),
    kinds: count((r) => r.kind),
    // how many rows we KNOW are dormant — not how many we have no push date for
    stale: scored.reduce((n, r) => n + (r.stale ? 1 : 0), 0),
    total: scored.length,
  };
}
export function facets() { return facetsOf(rows()); }
