// Pure, dependency-free client-side ranking over name + description + tags.
// No external search lib — the dataset is small and a weighted substring score
// is fast and predictable. Used by the browse page (client component).
import type { Component, ComponentType } from "./types";

export interface RankedComponent {
  component: Component;
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

function scoreOne(component: Component, q: string): number {
  const name = component.name.toLowerCase();
  const desc = component.description.toLowerCase();
  const repo = component.source_repo.toLowerCase();
  const tags = component.tags.map((t) => t.toLowerCase());

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
  components: Component[],
  query: string,
  activeTypes: ReadonlySet<ComponentType>,
): Component[] {
  const scoped =
    activeTypes.size === 0
      ? components
      : components.filter((e) => activeTypes.has(e.type));

  const q = query.trim().toLowerCase();
  if (!q) return scoped;

  const ranked: RankedComponent[] = scoped
    .map((component) => ({ component, score: scoreOne(component, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score === a.score
        ? a.component.name.localeCompare(b.component.name)
        : b.score - a.score,
    );
  return ranked.map((r) => r.component);
}
