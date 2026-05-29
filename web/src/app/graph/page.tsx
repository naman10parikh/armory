import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { buildGraph } from "@/lib/graph";
import type { ComponentType } from "@/lib/types";
import { GraphClient } from "./graph-client";

export const metadata: Metadata = {
  title: "Synapse graph — Armory",
  description:
    "An Obsidian-style force-directed graph of every agent-harness component and its related[] synapses.",
};

// Server: build a SAMPLED graph (bounded node count) so the page stays fast no
// matter how large the catalog grows. The sampler keeps the highest-degree nodes.
export default function GraphPage() {
  const { components } = getCatalog();
  const data = buildGraph(components, 320);
  const presentTypes = [...new Set(components.map((e) => e.type))] as ComponentType[];

  return <GraphClient data={data} presentTypes={presentTypes} />;
}
