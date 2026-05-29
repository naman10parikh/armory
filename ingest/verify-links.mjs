#!/usr/bin/env node
// Component link verifier. Walks components under a passed dir, HEAD-checks each
// source_url, reports 404s/unreachable, and (with --stamp) bumps verified_at to
// today for the ones that resolve. The fetcher is INJECTABLE for tests (no real
// network). Zero npm deps. Run: node ingest/verify-links.mjs --dir <dir> [--stamp]
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function walkMd(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkMd(p));
    else if (entry.endsWith(".md")) out.push(p);
  }
  return out;
}

// Default fetcher: real HEAD with a short timeout. Returns {ok, status}.
async function defaultFetcher(url, { timeoutMs = 8000 } = {}) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err?.message || "fetch failed" };
  }
}

// Rewrite the verified_at scalar in raw frontmatter, surgically (one line).
function stampVerifiedAt(raw, date) {
  if (/^verified_at:.*$/m.test(raw)) return raw.replace(/^verified_at:.*$/m, `verified_at: ${date}`);
  return raw.replace(/^---\r?\n/, `---\nverified_at: ${date}\n`); // insert if absent
}

export async function verifyLinks(dir, { stamp = false, fetcher = defaultFetcher, log = console.log,
  today = new Date().toISOString().slice(0, 10) } = {}) {
  const result = { ok: [], broken: [], missing: [], stamped: [] };
  for (const filePath of walkMd(dir)) {
    const raw = readFileSync(filePath, "utf8");
    const fm = parseFrontmatter(raw);
    const url = fm.source_url;
    const label = basename(filePath);
    if (!url) { result.missing.push({ filePath }); log(`  ? NO-URL  ${label} (no source_url)`); continue; }
    const { ok, status, error } = await fetcher(url);
    if (ok) {
      result.ok.push({ filePath, url, status });
      log(`  OK   ${status} ${label} -> ${url}`);
      if (stamp && fm.verified_at !== today) {
        writeFileSync(filePath, stampVerifiedAt(raw, today));
        result.stamped.push({ filePath });
      }
    } else {
      result.broken.push({ filePath, url, status, error });
      log(`  DEAD ${status || "ERR"} ${label} -> ${url}${error ? ` (${error})` : ""}`);
    }
  }
  log(`verify-links: ${result.ok.length} ok, ${result.broken.length} broken, ${result.missing.length} no-url${stamp ? `, ${result.stamped.length} stamped` : ""}`);
  return result;
}

// --- CLI ------------------------------------------------------------------
async function main(argv) {
  const args = argv.slice(2);
  const i = args.indexOf("--dir");
  const dir = i !== -1 ? args[i + 1] : undefined;
  const stamp = args.includes("--stamp");
  if (!dir) { console.error("usage: verify-links.mjs --dir <dir> [--stamp]"); process.exit(2); }
  const res = await verifyLinks(dir, { stamp });
  process.exit(res.broken.length ? 1 : 0); // non-zero if any link is dead
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
