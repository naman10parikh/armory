// GET /api/rank — the Universal leaderboard for the site (and any agent that prefers HTTP).
// Ranks the vendored catalog.json with the shared engine's PURE functions (no file IO inside the
// engine — this route owns the read), so the bundle is deployable and self-contained.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows, rankRows } from "../../../../lib/rank.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Row { component: string; domain: string }
let CACHE: Row[] | null = null;

function rows(): Row[] {
  if (CACHE) return CACHE;
  const path = join(process.cwd(), "catalog.json"); // vendored to the site root by prebuild
  const cat = JSON.parse(readFileSync(path, "utf-8"));
  CACHE = computeRows(cat.components) as Row[];
  return CACHE;
}

export function GET(req: Request): NextResponse {
  const sp = new URL(req.url).searchParams;
  const lb = rankRows(rows(), {
    component: sp.get("component") || null,
    domain: sp.get("domain") || null,
    vertical: sp.get("vertical") || null,
    sort: sp.get("sort") || "universal",
    dir: sp.get("dir") || "desc",
    limit: Math.min(Number(sp.get("limit")) || 100, 500),
  });
  return NextResponse.json(lb);
}
