"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GraphData } from "@/lib/graph";
import { ForceLayout, type SimNode } from "@/lib/force-layout";
import { TYPE_HUE } from "@/lib/types";

const ACCENT = "oklch(80% 0.135 75)";
const ACCENT_DIM = "oklch(80% 0.135 75 / 0.35)";
const EDGE = "oklch(100% 0 0 / 0.08)";
const LABEL = "oklch(82% 0.005 72)";
const NODE_DIM = "oklch(50% 0.006 72)";

interface Pulse {
  edge: number; // index into layout.edges
  t: number; // 0..1 progress along the edge
}

/**
 * The signature surface: an Obsidian-style force-directed synapse graph on a
 * canvas. Nodes fade in, edges draw, an amber pulse periodically fires along an
 * edge. Hover brightens a node + its 1-hop neighbours. Click navigates to the
 * engram. Honours prefers-reduced-motion (snaps to final, no pulses).
 *
 * `interactive=false` is the hero teaser (no click/hover labels). `query`
 * dims non-matching nodes live (used on the full graph page).
 */
export function SynapseGraph({
  data,
  interactive = true,
  query = "",
  className,
}: {
  data: GraphData;
  interactive?: boolean;
  query?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<ForceLayout | null>(null);
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const queryRef = useRef(query);
  queryRef.current = query.trim().toLowerCase();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;
    const layout = new ForceLayout(data.nodes, data.edges, width, height);
    layout.settle();
    layoutRef.current = layout;

    // Per-node fade-in progress (0..1) and the active pulse.
    const appear = new Map<string, number>();
    for (const n of layout.nodes) appear.set(n.id, reduce ? 1 : 0);
    let pulse: Pulse | null = null;
    let pulseTimer = 0;
    let raf = 0;
    let frame = 0;

    function neighborsOf(id: string): Set<string> {
      const s = new Set<string>([id]);
      for (const e of layout.edges) {
        if (e.source === id) s.add(e.target);
        if (e.target === id) s.add(e.source);
      }
      return s;
    }

    function radius(n: SimNode): number {
      return 3.5 + Math.min(n.degree, 10) * 0.85;
    }

    function setup() {
      width = wrap!.clientWidth;
      height = wrap!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      layout.resize(width, height);
    }
    setup();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      frame++;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);

      const hoveredId = hoverRef.current;
      const hi = hoveredId ? neighborsOf(hoveredId) : null;
      const q = queryRef.current;

      // Gentle idle drift (skipped under reduced motion).
      if (!reduce && frame % 2 === 0) layout.step(0.04);

      // Edges first.
      for (let i = 0; i < layout.edges.length; i++) {
        const e = layout.edges[i];
        const s = layout.get(e.source);
        const t = layout.get(e.target);
        if (!s || !t) continue;
        const active =
          hi && (hi.has(e.source) && hi.has(e.target) && hoveredId !== null);
        ctx!.beginPath();
        ctx!.moveTo(s.x, s.y);
        ctx!.lineTo(t.x, t.y);
        ctx!.strokeStyle = active ? ACCENT_DIM : EDGE;
        ctx!.lineWidth = active ? 1.2 : 0.6;
        ctx!.stroke();
      }

      // Amber pulse travelling along one edge.
      if (pulse) {
        const e = layout.edges[pulse.edge];
        const s = e && layout.get(e.source);
        const t = e && layout.get(e.target);
        if (s && t) {
          const px = s.x + (t.x - s.x) * pulse.t;
          const py = s.y + (t.y - s.y) * pulse.t;
          ctx!.beginPath();
          ctx!.arc(px, py, 2.4, 0, Math.PI * 2);
          ctx!.fillStyle = ACCENT;
          ctx!.shadowColor = ACCENT;
          ctx!.shadowBlur = 10;
          ctx!.fill();
          ctx!.shadowBlur = 0;
        }
        pulse.t += 0.02;
        if (pulse.t >= 1) pulse = null;
      }

      // Nodes.
      for (const n of layout.nodes) {
        const a = appear.get(n.id) ?? 1;
        if (a < 1 && !reduce) appear.set(n.id, Math.min(1, a + 0.04));
        const r = radius(n) * (reduce ? 1 : a);

        const matchesQuery = q
          ? n.label.toLowerCase().includes(q) || n.type.includes(q)
          : true;
        const inHover = hi ? hi.has(n.id) : true;
        const isFocus = hoveredId === n.id;
        const lit = matchesQuery && inHover;

        ctx!.globalAlpha = a * (lit ? 1 : 0.25);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = isFocus ? ACCENT : lit ? TYPE_HUE[n.type] : NODE_DIM;
        ctx!.fill();
        if (isFocus) {
          ctx!.lineWidth = 1.5;
          ctx!.strokeStyle = ACCENT;
          ctx!.shadowColor = ACCENT;
          ctx!.shadowBlur = 12;
          ctx!.stroke();
          ctx!.shadowBlur = 0;
        }
        ctx!.globalAlpha = 1;

        // Labels only for hovered neighbourhood (interactive) — keeps it clean.
        if (interactive && hoveredId && hi?.has(n.id)) {
          ctx!.globalAlpha = isFocus ? 1 : 0.8;
          ctx!.font = "500 11px var(--font-body), system-ui, sans-serif";
          ctx!.fillStyle = LABEL;
          ctx!.fillText(n.label, n.x + r + 4, n.y + 3);
          ctx!.globalAlpha = 1;
        }
      }

      // Schedule pulses (brand heartbeat).
      if (!reduce && layout.edges.length > 0) {
        pulseTimer++;
        if (!pulse && pulseTimer > 140) {
          pulse = {
            edge: Math.floor(Math.random() * layout.edges.length),
            t: 0,
          };
          pulseTimer = 0;
        }
      }

      raf = requestAnimationFrame(draw);
    }

    // Hit-testing for hover / click.
    function nodeAt(mx: number, my: number): SimNode | null {
      let best: SimNode | null = null;
      let bestD = 14 * 14;
      for (const n of layout.nodes) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    }

    function onMove(ev: PointerEvent) {
      if (!interactive) return;
      const rect = canvas!.getBoundingClientRect();
      const n = nodeAt(ev.clientX - rect.left, ev.clientY - rect.top);
      const id = n ? n.id : null;
      if (id !== hoverRef.current) {
        hoverRef.current = id;
        setHover(id);
        canvas!.style.cursor = id ? "pointer" : "default";
      }
    }

    function onClick(ev: MouseEvent) {
      if (!interactive) return;
      const rect = canvas!.getBoundingClientRect();
      const n = nodeAt(ev.clientX - rect.left, ev.clientY - rect.top);
      if (n) {
        const eng = data.nodes.find((d) => d.id === n.id);
        if (eng) router.push(`/e/${eng.type}/${eng.id}`);
      }
    }

    const ro = new ResizeObserver(() => setup());
    ro.observe(wrap);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("click", onClick);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, [data, interactive, router]);

  return (
    <div
      ref={wrapRef}
      className={className}
      role="img"
      aria-label={`Synapse graph of ${data.totalNodes} related engrams`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {interactive && hover && (
        <span className="pointer-events-none sr-only" aria-live="polite">
          {hover}
        </span>
      )}
    </div>
  );
}
