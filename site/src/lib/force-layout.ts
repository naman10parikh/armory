// A tiny, dependency-free force-directed layout. Deterministic seeding so the
// graph looks the same on every render (no layout jank). Runs a fixed number of
// cooling iterations up front, then exposes a light per-frame tick for gentle
// idle drift. This avoids pulling d3-force (and its install/bundle cost) into a
// site that must build fast and scale to thousands of nodes.
import type { GraphEdge, GraphNode } from "./graph";

export interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Mulberry32 — small seeded PRNG so initial placement is stable.
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ForceLayout {
  nodes: SimNode[];
  edges: GraphEdge[];
  private index: Map<string, SimNode>;
  private width: number;
  private height: number;

  constructor(
    nodes: GraphNode[],
    edges: GraphEdge[],
    width: number,
    height: number,
  ) {
    this.width = width;
    this.height = height;
    const rnd = seeded(1337);
    const seedR = Math.min(width, height) * 0.28;
    this.nodes = nodes.map((n) => {
      // Seed inside a central disk (phyllotaxis-ish) so relax untangles cleanly
      // and nodes never start pinned to the viewport walls.
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * seedR;
      return {
        ...n,
        x: width / 2 + Math.cos(a) * r,
        y: height / 2 + Math.sin(a) * r,
        vx: 0,
        vy: 0,
      };
    });
    this.edges = edges;
    this.index = new Map(this.nodes.map((n) => [n.id, n]));
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** Run a fixed cooling schedule to get a stable initial layout. */
  settle(iterations = 220) {
    for (let i = 0; i < iterations; i++) {
      const alpha = 1 - i / iterations;
      this.step(alpha);
    }
  }

  /** One physics step. alpha (0..1) scales movement so motion decays. */
  step(alpha: number) {
    const { nodes, edges } = this;
    const cx = this.width / 2;
    const cy = this.height / 2;
    // Ideal edge length. The whole graph is normalised to fit a central disk.
    const bound = Math.min(this.width, this.height) / 2 - 20;
    const k = Math.max(
      26,
      Math.min(bound * 0.85, (bound * 1.7) / Math.sqrt(Math.max(nodes.length, 1))),
    );
    // Repulsion strength, deliberately small; force is clamped below.
    const repulse = k * k * 0.4;
    const maxStep = k * 0.6; // hard cap on per-step displacement (anti-fling)

    // Repulsion (O(n^2) — node count capped ≤~320). Force clamped so nearby
    // nodes separate gently instead of flinging to the walls.
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 4) {
          dx = (Math.random() - 0.5) * 2;
          dy = (Math.random() - 0.5) * 2;
          d2 = dx * dx + dy * dy + 4;
        }
        const dist = Math.sqrt(d2);
        const force = Math.min(repulse / d2, k * 0.15);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Spring attraction along edges toward edge length k.
    for (const e of edges) {
      const s = this.index.get(e.source);
      const t = this.index.get(e.target);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (dist - k) * 0.06;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    }

    // Centering + integrate (with per-step displacement clamp) + damp + bound.
    for (const n of nodes) {
      n.vx += (cx - n.x) * 0.03;
      n.vy += (cy - n.y) * 0.03;
      // Clamp displacement this step so no node can fling across the canvas.
      let stepX = n.vx * alpha;
      let stepY = n.vy * alpha;
      const stepLen = Math.hypot(stepX, stepY);
      if (stepLen > maxStep) {
        stepX = (stepX / stepLen) * maxStep;
        stepY = (stepY / stepLen) * maxStep;
      }
      n.x += stepX;
      n.y += stepY;
      n.vx *= 0.8;
      n.vy *= 0.8;

      // Soft radial boundary (inscribed circle) — pools the cloud, no wall-stick.
      const ox = n.x - cx;
      const oy = n.y - cy;
      const r = Math.hypot(ox, oy);
      if (r > bound) {
        n.x = cx + (ox / r) * bound;
        n.y = cy + (oy / r) * bound;
        n.vx *= 0.3;
        n.vy *= 0.3;
      }
    }
  }

  get(id: string): SimNode | undefined {
    return this.index.get(id);
  }
}
