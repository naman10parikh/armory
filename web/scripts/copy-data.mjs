// prebuild step — make the site self-contained.
//
// The catalog (catalog.json) and the brain markdown (brain/) are authored at
// the repo root, OUTSIDE site/. A Vercel build rooted at site/ can't reach
// parent dirs, and the ISR long-tail detail pages render inside a serverless
// function that only ships traced files. So before `next build` we copy both
// into site/, where catalog.ts resolves them first (see its path logic) and
// next.config.mjs traces them into the function.
//
// Idempotent: re-running overwrites the local copy. If the parent source is
// missing (e.g. data was already vendored in CI), we keep any existing local
// copy and warn instead of failing the build.
import { cpSync, existsSync, mkdirSync, rmSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SITE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = join(SITE_DIR, "..");

function copyCatalog() {
  const src = join(REPO_ROOT, "catalog.json");
  const dest = join(SITE_DIR, "catalog.json");
  if (!existsSync(src)) {
    if (existsSync(dest)) {
      console.warn("[copy-data] ../catalog.json missing; using existing local copy.");
      return;
    }
    throw new Error(`[copy-data] catalog.json not found at ${src} and no local copy exists.`);
  }
  copyFileSync(src, dest);
  console.log("[copy-data] copied catalog.json");
}

function copyBrain() {
  const srcComponents = join(REPO_ROOT, "brain", "components");
  const destBrain = join(SITE_DIR, "brain");
  const destComponents = join(destBrain, "components");
  if (!existsSync(srcComponents)) {
    if (existsSync(destComponents)) {
      console.warn("[copy-data] ../brain/components missing; using existing local copy.");
      return;
    }
    throw new Error(`[copy-data] brain/components not found at ${srcComponents} and no local copy exists.`);
  }
  // Fresh copy so deleted components don't linger. Skip the 16K .obsidian config —
  // readComponentBody only reads brain/components/<path>.
  rmSync(destComponents, { recursive: true, force: true });
  mkdirSync(destBrain, { recursive: true });
  cpSync(srcComponents, destComponents, { recursive: true });
  const moc = join(REPO_ROOT, "brain", "MOC - Armory.md");
  if (existsSync(moc)) copyFileSync(moc, join(destBrain, "MOC - Armory.md"));
  console.log("[copy-data] copied brain/components");
}

function copyRankEngine() {
  // The ranking engine reads its SIBLING catalog.json, so a copy at web/lib/rank.mjs auto-reads the
  // web/catalog.json copied above — keeping the deployed site self-contained (no parent-dir reach).
  const src = join(REPO_ROOT, "lib", "rank.mjs");
  const destDir = join(SITE_DIR, "lib");
  const dest = join(destDir, "rank.mjs");
  if (!existsSync(src)) {
    if (existsSync(dest)) {
      console.warn("[copy-data] ../lib/rank.mjs missing; using existing local copy.");
      return;
    }
    throw new Error(`[copy-data] rank.mjs not found at ${src} and no local copy exists.`);
  }
  mkdirSync(destDir, { recursive: true });
  copyFileSync(src, dest);
  console.log("[copy-data] copied lib/rank.mjs");
}

// changes.json — what the catalog's own history says, which catalog.json cannot say about itself:
//   listed: brain path → the date its note most recently entered the repo (the New tab, "+N this week")
//   gained: "type/name" → mentions gained over the trending window (the Trending tab)
// Read from git, so it only runs where the repo's history is (a checkout or the deploy worktree). A
// Vercel build has no parent repo and keeps the copy vendored before upload, exactly like catalog.json.
const LISTED_DAYS = 60;
const TRENDING_DAYS = 14;
const DAY = 86_400_000;

function git(args) {
  return execFileSync("git", ["-C", REPO_ROOT, ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function mentionsByKey(catalog) {
  const m = new Map();
  for (const c of catalog.components || []) m.set(`${c.type}/${c.name}`, typeof c.mentions === "number" ? c.mentions : 0);
  return m;
}

function writeChanges() {
  const dest = join(SITE_DIR, "changes.json");
  const src = join(REPO_ROOT, "catalog.json");
  const keep = (why) => {
    if (existsSync(dest)) console.warn(`[copy-data] ${why}; using existing changes.json.`);
    else {
      writeFileSync(dest, JSON.stringify({ available: false, reason: why, listed: {}, gained: {} }));
      console.warn(`[copy-data] ${why}; wrote an empty changes.json (New and Trending show their empty state).`);
    }
  };
  if (!existsSync(src)) return keep("../catalog.json missing");
  try {
    const now = JSON.parse(readFileSync(src, "utf8"));
    const at = Date.parse(now.generated_at);
    if (!Number.isFinite(at)) return keep("catalog.json has no generated_at");

    const listed = {};
    const since = new Date(at - LISTED_DAYS * DAY).toISOString();
    let date = "";
    // Newest first, so the first date a path shows up under is its most recent entry into the catalog.
    for (const line of git(["log", `--since=${since}`, "--diff-filter=A", "--name-only", "--format=@@%cI", "--", "brain/components"]).split("\n")) {
      if (line.startsWith("@@")) date = line.slice(2, 12);
      else if (line.startsWith("brain/") && !(line.slice(6) in listed)) listed[line.slice(6)] = date;
    }

    const before = new Date(at - TRENDING_DAYS * DAY).toISOString();
    const rev = git(["log", "-1", "--format=%H", `--before=${before}`, "--", "catalog.json"]).trim();
    const gained = {};
    if (rev) {
      const then = mentionsByKey(JSON.parse(git(["show", `${rev}:catalog.json`])));
      for (const [key, n] of mentionsByKey(now)) {
        // Only rows that were already listed then: a row promoted with its mentions attached is New, not rising.
        if (then.has(key) && n > then.get(key)) gained[key] = n - then.get(key);
      }
    }
    writeFileSync(dest, JSON.stringify({
      available: true, generated_at: now.generated_at, listed_days: LISTED_DAYS, trending_days: TRENDING_DAYS,
      trending_since: rev ? before.slice(0, 10) : null, listed, gained,
    }));
    console.log(`[copy-data] wrote changes.json (${Object.keys(listed).length} dated listings, ${Object.keys(gained).length} rising)`);
  } catch (err) {
    keep(`git history unavailable (${err instanceof Error ? err.message.split("\n")[0] : String(err)})`);
  }
}

// public/llms.txt — the machine-readable guide, with its counts computed from the catalog just vendored
// (CP143): the static copy said 64,657 as of 2 September while the site said 65,318. The text lives in
// llms.template.txt; each {{name}} below is filled from the engine, the date from the catalog's own.
async function writeLlmsTxt() {
  const template = join(SITE_DIR, "llms.template.txt");
  const { rows, facetsOf } = await import(pathToFileURL(join(SITE_DIR, "lib", "rank.mjs")).href);
  const all = rows();
  const f = facetsOf(all);
  const int = (n) => n.toLocaleString("en-US");
  const generated = JSON.parse(readFileSync(join(SITE_DIR, "catalog.json"), "utf-8")).generated_at;
  const values = {
    as_of: typeof generated === "string" ? generated.slice(0, 10) : new Date().toISOString().slice(0, 10),
    total: int(all.length),
    ranked: int(all.filter((r) => r.scores.universal != null).length),
    tested: int(all.filter((r) => r.signals.tested != null).length),
    types: String(f.components.length),
    domains: String(f.domains.length),
    verticals: String(f.verticals.length),
    component_counts: f.components.map((c) => `${c.key} (${int(c.count)})`).join(" · "),
  };
  const text = readFileSync(template, "utf-8").replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in values)) throw new Error(`[copy-data] llms.template.txt names an unknown value ${m}`);
    return values[k];
  });
  writeFileSync(join(SITE_DIR, "public", "llms.txt"), text);
  console.log(`[copy-data] wrote public/llms.txt (${values.total} components, as of ${values.as_of})`);
}

copyCatalog();
copyBrain();
copyRankEngine();
writeChanges();
await writeLlmsTxt();
console.log("[copy-data] done — site is self-contained.");
