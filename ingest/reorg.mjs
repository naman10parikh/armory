#!/usr/bin/env node
// ingest/reorg.mjs — One-time lossless directory consolidation.
//
// Merges 4 duplicate root-folder pairs into the canonical 12-category names:
//   mcp/       → mcps/         (pure rename — 21,735 JSON install configs)
//   agents/    → subagents/    (real vendored files merge into catalog-card dir)
//   commands/  → workflows/    (real vendored files merge into catalog-card dir)
//   rules/     → claudemd-rules/ (real vendored files merge into catalog-card dir)
//
// Merge algorithm:
//   For each file in source dir → move to target dir.
//   COLLISION: if target is a catalog-generated card (contains "Generated from the Armory catalog")
//              AND source is a real vendored file → DELETE the card, keep the real file.
//   COLLISION: if BOTH are real vendored files with different content → keep source as <slug>.ecc.md
//   COLLISION: identical content → keep target (skip move).
//   After merging: remove now-empty source dir.
//
// Usage:
//   node ingest/reorg.mjs            # dry-run
//   node ingest/reorg.mjs --apply    # apply (lossless)

import {
  existsSync, mkdirSync, readdirSync, statSync,
  readFileSync, writeFileSync, rmSync, renameSync,
} from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const DRY_RUN = !process.argv.includes("--apply");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── helpers ───────────────────────────────────────────────────────────────────

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function isCard(content) {
  return content.includes("Generated from the Armory catalog");
}

function gitMv(from, to) {
  // Use git mv so git tracks the rename; fall back to fs rename if git fails
  try {
    execSync(`git mv "${from}" "${to}"`, { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] });
  } catch {
    renameSync(from, to);
  }
}

function gitRm(p) {
  try {
    execSync(`git rm -f "${p}"`, { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] });
  } catch {
    rmSync(p, { force: true });
  }
}

// ── merge logic ───────────────────────────────────────────────────────────────

const collisions = { card_replaced: 0, ecc_kept: 0, identical_skipped: 0 };

/**
 * Merge all files from srcDir into dstDir.
 * srcDir = "real files" source (agents/, commands/, rules/)
 * dstDir = canonical target (subagents/, workflows/, claudemd-rules/)
 */
function mergeDir(srcDir, dstDir, label) {
  if (!existsSync(srcDir)) {
    console.log(`  SKIP ${label}: source ${srcDir} does not exist`);
    return 0;
  }
  ensureDir(dstDir);
  const files = readdirSync(srcDir).filter((f) => {
    const full = join(srcDir, f);
    return statSync(full).isFile();
  });

  let moved = 0;
  for (const fname of files) {
    const src = join(srcDir, fname);
    const dst = join(dstDir, fname);

    if (!existsSync(dst)) {
      // Simple move
      console.log(`  mv  ${label}/${fname} → ${basename(dstDir)}/${fname}`);
      if (!DRY_RUN) gitMv(src, dst);
      moved++;
      continue;
    }

    // COLLISION: file exists at destination
    const srcContent = readFileSync(src, "utf8");
    const dstContent = readFileSync(dst, "utf8");

    if (srcContent === dstContent) {
      // Identical content — skip, remove source
      console.log(`  SKIP (identical) ${label}/${fname}`);
      if (!DRY_RUN) gitRm(src);
      collisions.identical_skipped++;
      continue;
    }

    if (isCard(dstContent) && !isCard(srcContent)) {
      // Target is a generated card, source is real — replace card with real file
      console.log(`  REPLACE CARD  ${basename(dstDir)}/${fname}  ← real file from ${label}/`);
      if (!DRY_RUN) {
        gitRm(dst);           // delete the card
        gitMv(src, dst);      // move real file into place
      }
      collisions.card_replaced++;
      moved++;
      continue;
    }

    if (!isCard(srcContent) && !isCard(dstContent)) {
      // Both are real — keep BOTH, source as .ecc.md
      const ext = extname(fname);
      const slug = basename(fname, ext);
      const eccName = `${slug}.ecc${ext}`;
      const eccDst = join(dstDir, eccName);
      console.log(`  CONFLICT (both real)  ${label}/${fname} → ${basename(dstDir)}/${eccName}`);
      if (!DRY_RUN) {
        const eccFinal = existsSync(eccDst) ? join(dstDir, `${slug}.ecc2${ext}`) : eccDst;
        gitMv(src, eccFinal);
      }
      collisions.ecc_kept++;
      moved++;
      continue;
    }

    // Source is a card, dest is real — discard source card
    console.log(`  DISCARD source card  ${label}/${fname}  (dest is real)`);
    if (!DRY_RUN) gitRm(src);
    collisions.identical_skipped++;
  }

  // Remove source dir if now empty (after apply)
  if (!DRY_RUN) {
    const remaining = readdirSync(srcDir).filter((f) => statSync(join(srcDir, f)).isFile());
    if (remaining.length === 0) {
      try {
        execSync(`git rm -r --cached "${srcDir}" 2>/dev/null; rm -rf "${srcDir}"`, {
          cwd: ROOT, shell: "/bin/bash", stdio: "ignore",
        });
        console.log(`  rmdir ${label}/  (empty after merge)`);
      } catch {
        rmSync(srcDir, { recursive: true, force: true });
        console.log(`  rmdir ${label}/  (fs-only)`);
      }
    } else {
      console.log(`  WARN: ${remaining.length} file(s) still in ${srcDir} after merge (check manually)`);
    }
  }

  return moved;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nreorg.mjs — ${DRY_RUN ? "DRY RUN" : "APPLY"} mode\n`);

  // ── TASK 1a: mcp/ → mcps/ (pure git rename, no merge needed) ─────────────
  // mcps/ does not yet exist at root (only in brain/). mcp/ has 21,735 JSON files.
  const mcpSrc = join(ROOT, "mcp");
  const mcpDst = join(ROOT, "mcps");

  if (existsSync(mcpSrc) && !existsSync(mcpDst)) {
    console.log(`\n── TASK 1a: git mv mcp/ → mcps/ ──`);
    console.log(`  ${readdirSync(mcpSrc).length} files`);
    if (!DRY_RUN) {
      execSync(`git mv mcp mcps`, { cwd: ROOT, stdio: "inherit" });
      console.log("  done");
    } else {
      console.log("  [dry-run] would git mv mcp → mcps");
    }
  } else if (existsSync(mcpDst)) {
    console.log(`\n── TASK 1a: mcps/ already exists — skipping mcp rename ──`);
  } else {
    console.log(`\n── TASK 1a: mcp/ not found — already renamed or never existed ──`);
  }

  // ── TASK 1b: agents/ → subagents/ ────────────────────────────────────────
  console.log("\n── TASK 1b: merge agents/ → subagents/ ──");
  const n1b = mergeDir(join(ROOT, "agents"), join(ROOT, "subagents"), "agents");

  // ── TASK 1c: commands/ → workflows/ ─────────────────────────────────────
  console.log("\n── TASK 1c: merge commands/ → workflows/ ──");
  const n1c = mergeDir(join(ROOT, "commands"), join(ROOT, "workflows"), "commands");

  // ── TASK 1d: rules/ → claudemd-rules/ ───────────────────────────────────
  console.log("\n── TASK 1d: merge rules/ → claudemd-rules/ ──");
  const n1d = mergeDir(join(ROOT, "rules"), join(ROOT, "claudemd-rules"), "rules");

  // ── summary ──────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════════");
  console.log(`reorg.mjs — ${DRY_RUN ? "DRY RUN" : "APPLIED"}`);
  console.log("════════════════════════════════════════════════");
  console.log(`  mcp/ → mcps/          rename`);
  console.log(`  agents/ → subagents/  ${n1b} files moved`);
  console.log(`  commands/ → workflows/ ${n1c} files moved`);
  console.log(`  rules/ → claudemd-rules/ ${n1d} files moved`);
  console.log("");
  console.log(`  card_replaced:     ${collisions.card_replaced}`);
  console.log(`  ecc_kept:          ${collisions.ecc_kept}`);
  console.log(`  identical_skipped: ${collisions.identical_skipped}`);
  console.log("════════════════════════════════════════════════\n");

  if (DRY_RUN) console.log("Run with --apply to make changes.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
