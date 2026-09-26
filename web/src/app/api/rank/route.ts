// GET /api/rank — the Universal leaderboard for the site (and any agent that prefers HTTP).
// Ranks the vendored catalog.json with the shared engine's PURE functions (no file IO inside the
// engine — this route owns the read), so the bundle is deployable and self-contained.
import { readCatalogText } from "@/lib/catalog-file";
import { NextResponse } from "next/server";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows, rankRows } from "../../../../lib/rank.mjs";
import { isInstallable } from "@/lib/installable";
import { titleOf } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Row { component: string; domain: string }
let CACHE: Row[] | null = null;
/** "type/name" → title, for the rows whose slug had to differ; `name` stays the slug `armory install` takes. */
const TITLES = new Map<string, string>();

function rows(): Row[] {
  if (CACHE) return CACHE;
  const cat = JSON.parse(readCatalogText()); // vendored to the site root by prebuild
  CACHE = computeRows(cat.components) as Row[];
  for (const c of cat.components as { type?: string; name?: string; title?: unknown }[]) {
    const title = titleOf(c);
    if (title) TITLES.set(`${c.type}/${c.name}`, title);
  }
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
  }) as { items: { name: string; type: string | null; url: string | null }[] };
  // Whether `armory install` places each row, so a list never promises a command that installs nothing.
  const items = lb.items.map((it) => {
    const title = TITLES.get(`${it.type}/${it.name}`);
    return { ...it, ...(title ? { title } : {}), installable: isInstallable(it.type ?? "", it.name, it.url) };
  });
  return NextResponse.json({ ...lb, items });
}
