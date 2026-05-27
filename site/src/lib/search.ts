// Pure, dependency-free client-side ranking over name + description + tags.
// No external search lib — the dataset is small and a weighted substring score
// is fast and predictable. Used by the browse page (client component).
import type { Engram, EngramType } from "./types";

export interface RankedEngram {
  engram: Engram;
  score: number;
}

const WEIGHTS = {
  nameExact: 100,
  namePrefix: 60,
  nameIncludes: 30,
  tagExact: 25,
  tagIncludes: 12,
  descIncludes: 8,
  repoIncludes: 6,
} as const;

function scoreOne(engram: Engram, q: string): number {
  const name = engram.name.toLowerCase();
  const desc = engram.description.toLowerCase();
  const repo = engram.source_repo.toLowerCase();
  const tags = engram.tags.map((t) => t.toLowerCase());

  let score = 0;
  if (name === q) score += WEIGHTS.nameExact;
  else if (name.startsWith(q)) score += WEIGHTS.namePrefix;
  else if (name.includes(q)) score += WEIGHTS.nameIncludes;

  if (tags.includes(q)) score += WEIGHTS.tagExact;
  else if (tags.some((t) => t.includes(q))) score += WEIGHTS.tagIncludes;

  if (desc.includes(q)) score += WEIGHTS.descIncludes;
  if (repo.includes(q)) score += WEIGHTS.repoIncludes;
  return score;
}

/** Filter by active categories, then (optionally) rank by query. With no query
 *  the list stays in catalog order. */
export function filterAndRank(
  engrams: Engram[],
  query: string,
  activeTypes: ReadonlySet<EngramType>,
): Engram[] {
  const scoped =
    activeTypes.size === 0
      ? engrams
      : engrams.filter((e) => activeTypes.has(e.type));

  const q = query.trim().toLowerCase();
  if (!q) return scoped;

  const ranked: RankedEngram[] = scoped
    .map((engram) => ({ engram, score: scoreOne(engram, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score === a.score
        ? a.engram.name.localeCompare(b.engram.name)
        : b.score - a.score,
    );
  return ranked.map((r) => r.engram);
}
