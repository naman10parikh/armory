// lib/rank.mjs — the Universal ranking engine for the Armory catalog.
//
// One normalized rating for every open-source building block, whatever its shape (MCP, CLI, skill,
// plugin, repo, package, docs page, website, paper). Each signal is turned into a 0–100 percentile
// WITHIN ITS OWN KIND (stars vs stars, downloads vs downloads), then the Universal score blends
// whatever a component has, scaled by an evidence factor so a component corroborated by several
// signals outranks one riding a single signal. A component with no real signal is honestly unranked
// (never faked to the top). The formula and every signal are open — see /formula.
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

// signal → weight in the Universal blend (community citation counts most, then stars, then registry usage).
// `tested` sits at parity with stars, NOT above it, because today it is BINARY: eval_score is 1 or 0, so
// every tool that passed lands on the same auto-p100 and a heavier weight would simply hand that one bit
// the loudest voice in the blend — the top of the board becomes a wall of "verified" ordered by nothing
// else. Raise this above 1.0 only once eval_score is a GRADED number that can separate two passing tools.
const WEIGHTS = { tested: 1.0, mentions: 1.2, stars: 1.0, usage: 0.9 };

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

// PURE: build + score rows from a components array (no file IO — so the Next.js site can rank a
// catalog it read itself, and the CLI/MCP can rank the sibling catalog. One formula, two callers).
export function computeRows(components) {
  const list = (components || []).map((c) => {
    const text = [c.name, c.description, c.tags].filter(Boolean).join(" ");
    const url = c.source_url || (typeof c.source_repo === "string" ? c.source_repo : null);
    // Data-quality normalization: a "stars" figure is GitHub stars ONLY when the source is GitHub.
    // Non-GitHub sources (e.g. Smithery) put a USAGE count in that field — a different metric entirely.
    // So a repo's claim to fame is stars; a Smithery MCP's is usage. Never conflate them.
    const isGithub = /github\.com/i.test(url || "");
    const raw = typeof c.stars === "number" && c.stars > 0 ? c.stars : null;
    return {
      name: c.name,
      component: COMPONENT[c.type] || c.type || "other",
      domain: domainOf(text),
      vertical: verticalOf(text),
      url,
      license: c.license,
      desc: (c.description || "").slice(0, 160),
      signals: {
        stars: isGithub ? stars(c.stars) : null,
        usage: !isGithub ? raw : null,
        tested: c.eval_score, mentions: c.mentions ?? null,
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

function percentiles(list, sig) {
  const vals = list.map((r) => r.signals[sig]).filter((v) => v != null).sort((a, b) => a - b);
  if (!vals.length) return new Map();
  const n = vals.length;
  const rankOf = (v) => { // fraction of values ≤ v
    let lo = 0, hi = n;
    while (lo < hi) { const m = (lo + hi) >> 1; if (vals[m] <= v) lo = m + 1; else hi = m; }
    return lo;
  };
  const m = new Map();
  for (const r of list) if (r.signals[sig] != null) m.set(r, Math.round((1000 * rankOf(r.signals[sig])) / n) / 10);
  return m;
}

function score(list) {
  const pct = Object.fromEntries(Object.keys(WEIGHTS).map((s) => [s, percentiles(list, s)]));
  for (const r of list) {
    let parts = 0, wsum = 0, ev = 0;
    const axes = {};
    for (const [s, w] of Object.entries(WEIGHTS)) {
      const p = pct[s].get(r);
      if (p != null) { parts += p * w; wsum += w; ev++; axes[s] = p; }
    }
    const mean = wsum ? parts / wsum : null;
    r.scores = {
      universal: mean != null ? Math.round(10 * mean * (0.7 + (0.3 * Math.min(ev, 3)) / 3)) / 10 : null,
      tested: axes.tested ?? null, popular: axes.stars ?? null, practitioner: axes.mentions ?? null, evidence: ev,
    };
    // The PRIMARY metric = the row's strongest NUMERIC popularity signal (its claim to fame as a
    // NUMBER — stars for a repo, usage for a Smithery MCP, mentions for a community pick). Shown first,
    // per artifact, instead of a universal stars column. "tested" is a separate quality badge (below),
    // never the headline number — so the top isn't a monotonous wall of "verified".
    let pk = null, pp = -1;
    for (const s of ["stars", "usage", "mentions"]) { const p = axes[s]; if (p != null && p > pp) { pp = p; pk = s; } }
    if (!pk && axes.tested != null) pk = "tested";      // nothing numeric → fall back to the verified badge
    r.primary = pk ? { key: pk, value: r.signals[pk], pct: axes[pk], label: METRIC_LABEL[pk] || pk } : null;
    r.verified = r.signals.tested != null;              // a trust chip shown alongside, when we measured it
  }
}

// display metadata per signal — the label an agent/human sees for a primary metric.
const METRIC_LABEL = { stars: "stars", usage: "used", tested: "tested", mentions: "mentions", forks: "forks", downloads: "downloads" };

const num = (v, lo = -1) => (typeof v === "number" ? v : lo);
const nm = (r) => (r.name || "").toLowerCase();
const PRIMARY = {
  universal: (r) => r.scores.universal, popular: (r) => r.signals.stars, tested: (r) => r.scores.tested,
  practitioner: (r) => r.signals.mentions, stars: (r) => r.signals.stars, name: (r) => r.name,
};
const KEY = {
  universal: (r) => [-num(r.scores.universal), -num(r.scores.evidence, 0), -num(r.signals.stars), nm(r)],
  popular: (r) => [-num(r.signals.stars), nm(r)],
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
  name: r.name, component: r.component, domain: r.domain, vertical: r.vertical, url: r.url, license: r.license,
  universal: r.scores.universal, primary: r.primary, verified: r.verified ?? false,
  signals: { stars: r.signals.stars, usage: r.signals.usage, tested: r.signals.tested, mentions: r.signals.mentions },
  stars: r.signals.stars, usage: r.signals.usage, tested: r.signals.tested, mentions: r.signals.mentions, desc: r.desc,
});

export function facetsOf(scored) {
  const count = (f) => { const m = new Map(); for (const r of scored) m.set(f(r), (m.get(f(r)) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1]).map(([key, n]) => ({ key, count: n })); };
  return { components: count((r) => r.component), domains: count((r) => r.domain), verticals: count((r) => r.vertical).filter((v) => v.key != null), total: scored.length };
}
export function facets() { return facetsOf(rows()); }
