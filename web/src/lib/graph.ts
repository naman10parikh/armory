// Graph data derivation for the synapse view. Pure functions — safe to call on
// the server (to pass a sampled subset to the client) and on the client.
//
// PERFORMANCE: the catalog is heading toward thousands of components. We NEVER ship
// every node to the canvas. `sampleGraph` returns a bounded subset, biased toward
// the highest-degree nodes (the ones that make the "brain" legible) plus their
// neighbours, so the picture stays meaningful at any catalog size.
import type { Component, ComponentType } from "./types";

export interface GraphNode {
  id: string; // component name (unique within the catalog)
  type: ComponentType;
  label: string;
  degree: number; // number of resolved synapses
  stars: number | null;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  sampled: boolean; // true if we dropped nodes for perf
  totalNodes: number; // full catalog size (for the "showing N of M" line)
}

/**
 * Build a sampled, undirected synapse graph from the catalog.
 *
 * @param components  full component list
 * @param maxNodes hard cap on rendered nodes (default 220 — smooth on canvas)
 */
export function buildGraph(components: Component[], maxNodes = 220): GraphData {
  const total = components.length;
  const byName = new Map<string, Component>();
  for (const e of components) byName.set(e.name, e);

  // Resolved-degree per node (only count edges to components that actually exist).
  const degree = new Map<string, number>();
  const edgeKeys = new Set<string>();
  const allEdges: GraphEdge[] = [];
  for (const e of components) {
    for (const rel of e.related) {
      if (!byName.has(rel) || rel === e.name) continue;
      // Undirected: dedupe (a,b)/(b,a) with a sorted key.
      const key = e.name < rel ? `${e.name}|${rel}` : `${rel}|${e.name}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      allEdges.push({ source: e.name, target: rel });
      degree.set(e.name, (degree.get(e.name) ?? 0) + 1);
      degree.set(rel, (degree.get(rel) ?? 0) + 1);
    }
  }

  // Pick which nodes survive. Order by degree desc, then stars, then name.
  const ranked = [...components].sort((a, b) => {
    const da = degree.get(a.name) ?? 0;
    const db = degree.get(b.name) ?? 0;
    if (db !== da) return db - da;
    const sa = a.stars ?? 0;
    const sb = b.stars ?? 0;
    if (sb !== sa) return sb - sa;
    return a.name.localeCompare(b.name);
  });

  const keep = new Set(ranked.slice(0, maxNodes).map((e) => e.name));
  const sampled = total > keep.size;

  const nodes: GraphNode[] = ranked
    .filter((e) => keep.has(e.name))
    .map((e) => ({
      id: e.name,
      type: e.type,
      label: e.name,
      degree: degree.get(e.name) ?? 0,
      stars: e.stars,
    }));

  // Keep only edges where BOTH endpoints survived the sample.
  const edges = allEdges.filter(
    (ed) => keep.has(ed.source) && keep.has(ed.target),
  );

  return { nodes, edges, sampled, totalNodes: total };
}

/**
 * A local 1-hop neighbourhood around one component, for the detail page's
 * "synapses" subgraph. Tiny by construction (the focus node + its neighbours).
 */
export function buildNeighborhood(
  components: Component[],
  focusName: string,
): GraphData {
  const byName = new Map(components.map((e) => [e.name, e]));
  const focus = byName.get(focusName);
  if (!focus) return { nodes: [], edges: [], sampled: false, totalNodes: 0 };

  const neighborNames = new Set<string>([focusName]);
  for (const rel of focus.related) if (byName.has(rel)) neighborNames.add(rel);
  // Also pull components that point AT the focus (incoming synapses).
  for (const e of components) {
    if (e.related.includes(focusName)) neighborNames.add(e.name);
  }

  const sub = components.filter((e) => neighborNames.has(e.name));
  return buildGraph(sub, neighborNames.size);
}
