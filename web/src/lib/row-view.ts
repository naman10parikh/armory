// Board rows → the ranked table's row views. Server-side; the Ask page builds the same shape from
// GET /api/rank on the client (components/ranked-row.tsx).
import type { RowView } from "@/components/board-table";
import { rankedScoreTexts } from "./format";
import type { ListedRow } from "./rows";

export function detailHref(type: string, name: string): string {
  return `/e/${encodeURIComponent(type)}/${encodeURIComponent(name)}`;
}

/** Each row keeps the rank its list gave it (page 2 of a leaderboard starts at 101). */
export function toRowViews(rows: readonly ListedRow[]): RowView[] {
  const texts = rankedScoreTexts(rows.map((r) => (r.universal == null ? null : r.exact)));
  return rows.map((r, i) => ({
    key: `${r.type}/${r.name}`,
    rank: r.rank,
    name: r.name,
    href: r.type ? detailHref(r.type, r.name) : r.url,
    external: !r.type && r.url != null,
    meta: [r.component, r.domain].filter(Boolean).join(" · "),
    desc: r.desc,
    universal: r.universal,
    exact: r.exact,
    scoreText: texts[i],
    evidence: r.evidence,
    signals: r.signals,
    pushedAt: r.pushedAt,
    stale: r.stale,
    listedAt: r.listedAt,
    gained: r.gained,
    ours: r.ours,
    contributedBy: r.contributedBy,
    alsoListedAs: r.alsoListedAs.map((t) => ({ name: t.name, href: t.type ? detailHref(t.type, t.name) : null })),
    installable: r.installable,
    source: r.url,
  }));
}
