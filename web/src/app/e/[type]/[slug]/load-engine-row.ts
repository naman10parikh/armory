import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SignalValues } from "@/components/signals-row";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows } from "../../../../../lib/rank.mjs";

/** The Universal score + its four signals + taxonomy for ONE component — computed
 *  with the SAME engine (lib/rank.mjs) the leaderboard, /formula and the API use,
 *  so the number on the detail page can never disagree with the number shown
 *  anywhere else (design/BRIEF.md §9, anti-pattern #12). Route-local: only the
 *  detail page needs a single scored row rather than the full ranked table. */
export interface EngineRow {
  domain: string;
  vertical: string | null;
  signals: SignalValues;
  scores: { universal: number | null; evidence: number };
}

export const EMPTY_SIGNALS: SignalValues = {
  tested: null,
  mentions: null,
  stars: null,
  forks: null,
  usage: null,
};

export function loadEngineRow(type: string, slug: string): EngineRow | null {
  try {
    const local = join(process.cwd(), "catalog.json");
    const catPath = existsSync(local) ? local : join(process.cwd(), "..", "catalog.json");
    const raw = JSON.parse(readFileSync(catPath, "utf-8")) as {
      components: { type?: string; name?: string }[];
    };
    const idx = raw.components.findIndex((c) => c.type === type && c.name === slug);
    if (idx === -1) return null;
    const scored = computeRows(raw.components) as EngineRow[];
    return scored[idx] ?? null;
  } catch (err) {
    console.warn(
      "[detail] score unavailable:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}
