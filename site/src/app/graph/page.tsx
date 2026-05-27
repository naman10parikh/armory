import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { buildGraph } from "@/lib/graph";
import type { EngramType } from "@/lib/types";
import { GraphClient } from "./graph-client";

export const metadata: Metadata = {
  title: "Synapse graph — Armory",
  description:
    "An Obsidian-style force-directed graph of every agent-harness engram and its related[] synapses.",
};

// Server: build a SAMPLED graph (bounded node count) so the page stays fast no
// matter how large the catalog grows. The sampler keeps the highest-degree nodes.
export default function GraphPage() {
  const { engrams } = getCatalog();
  const data = buildGraph(engrams, 320);
  const presentTypes = [...new Set(engrams.map((e) => e.type))] as EngramType[];

  return <GraphClient data={data} presentTypes={presentTypes} />;
}
