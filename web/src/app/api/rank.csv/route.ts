// GET /api/rank.csv — the current leaderboard slice as a downloadable CSV (humans + spreadsheets).
import { readFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error — vendored plain-ESM engine
import { computeRows, rankRows } from "../../../../lib/rank.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Row { component: string; domain: string }
interface Item { name: string; component: string; domain: string; url?: string | null; universal: number | null; stars: number | null; tested: number | null; mentions: number | null; desc: string }
let CACHE: Row[] | null = null;
function rows(): Row[] {
  if (CACHE) return CACHE;
  CACHE = computeRows(JSON.parse(readFileSync(join(process.cwd(), "catalog.json"), "utf-8")).components) as Row[];
  return CACHE;
}
const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function GET(req: Request): Response {
  const sp = new URL(req.url).searchParams;
  const lb = rankRows(rows(), {
    component: sp.get("component") || null, domain: sp.get("domain") || null,
    sort: sp.get("sort") || "universal", dir: sp.get("dir") || "desc", limit: 5000,
  });
  const head = ["rank", "name", "component", "domain", "universal", "stars", "tested", "mentions", "url", "what_it_is"];
  const lines = [head.join(",")];
  (lb.items as Item[]).forEach((i, n) =>
    lines.push([n + 1, i.name, i.component, i.domain, i.universal ?? "", i.stars ?? "", i.tested ?? "", i.mentions ?? "", i.url ?? "", (i.desc || "").replace(/\n/g, " ")].map(cell).join(",")));
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="armory-leaderboard.csv"` },
  });
}
