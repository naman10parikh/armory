// GET /api/stack — the machine twin of /stack and /c.
//
// The eleven canonical harness components with their picks, read from the SAME
// src/data/stack.json the pages render, with Score, Signals and the internal detail path
// resolved live from lib/rank.mjs. An agent asking "what do I build an agent out of" gets
// the recommendation and its evidence in one call, and a pick that is not in the catalog
// comes back `indexed: false` rather than as a fabricated row.
import { NextResponse } from "next/server";
import {
  CANON,
  CANON_SLUGS,
  PLANE,
  PROVISIONING,
  STACK_AS_OF,
  STACK_NOTE,
  STACK_REGENERATE,
  resolvedPicksFor,
  rowsFor,
  stackFor,
  statsFor,
} from "@/lib/canon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  const components = CANON_SLUGS.map((slug) => {
    const entry = stackFor(slug);
    const rows = rowsFor(slug);
    const stats = statsFor(slug, rows);

    return {
      slug,
      label: entry?.label ?? slug,
      one_line: entry?.oneLine ?? "",
      aggregates: CANON[slug] ?? [],
      indexed: stats.indexed,
      ranked: stats.ranked,
      ranked_pct: stats.rankedPct,
      top_score: stats.topScore,
      leaderboard: `/leaderboard?component=${encodeURIComponent(stats.leaderboardComponent)}`,
      page: `/c/${slug}`,
      // The pick first, then its runners-up; shelf_rank is the rank /c prints, and reason says why a pick
      // below the shelf's top row is listed anyway.
      picks: resolvedPicksFor(slug).map((p) => ({
        name: p.name,
        why: p.why,
        the_pick: p.isThePick,
        shelf_rank: p.rank,
        reason: p.reason ?? null,
        indexed: p.row != null,
        armory_name: p.armoryName,
        url: p.url,
        detail: p.href,
        type: p.row?.type ?? null,
        universal: p.row?.universal ?? null,
        evidence: p.row?.evidence ?? null,
        ours: p.row?.ours ?? false,
        signals: p.row?.signals ?? null,
      })),
    };
  });

  // `stack` answers the common question in one lookup: slot → the pick (e.g. stack.memory).
  const stack = Object.fromEntries(components.map((c) => [c.slug, c.picks[0]?.name ?? null]));

  return NextResponse.json({
    note: STACK_NOTE,
    as_of: STACK_AS_OF,
    regenerate: STACK_REGENERATE,
    stack,
    total: components.length,
    components,
    // CP138 axis 2: the accounts an agent is provisioned onto. Not open-source code, so never scored.
    plane: PLANE,
    provisioning: PROVISIONING,
  });
}
