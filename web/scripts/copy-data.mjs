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
import { cpSync, existsSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

copyCatalog();
copyBrain();
copyRankEngine();
console.log("[copy-data] done — site is self-contained.");
