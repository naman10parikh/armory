"use client";
// The Leaderboard — every open-source building block, one Universal rating, sliceable by component
// and domain, sortable on any axis. Calls GET /api/rank. Warm-black + Synapse-Amber, editorial.
import { useCallback, useEffect, useMemo, useState } from "react";

interface Primary { key: string; value: number | null; pct: number; label: string }
interface Row {
  name: string; component: string; domain: string; vertical?: string | null; url?: string | null; license?: string | null;
  universal: number | null; primary?: Primary | null; verified?: boolean;
  stars: number | null; usage: number | null; tested: number | null; mentions: number | null; desc: string;
}
interface Facet { key: string; count: number }
interface Result {
  items: Row[]; total: number; sort: string; dir: string;
  facets: { components: Facet[]; domains: Facet[]; verticals: Facet[]; total: number };
}

const SORTS: [string, string][] = [
  ["universal", "Universal score"], ["popular", "Most popular"], ["tested", "Best tested"],
  ["practitioner", "Practitioner pick"], ["stars", "Most stars"], ["name", "A–Z"],
];

// Show each row's PRIMARY metric (its claim to fame) — not a universal stars column, since most
// artifacts have no stars. Websites show pageviews, packages downloads, repos stars/forks.
function primaryLabel(i: Row): { text: string; glyph: string } {
  const p = i.primary;
  if (!p || p.value == null) return { text: "—", glyph: "" };
  if (p.key === "tested") return { text: "verified", glyph: "✓" };
  if (p.key === "mentions") return { text: `${p.value} mentioned`, glyph: "♦" };
  if (p.key === "stars") return { text: `${Number(p.value).toLocaleString()} stars`, glyph: "★" };
  if (p.key === "usage") return { text: `${Number(p.value).toLocaleString()} used`, glyph: "↑" };
  return { text: `${Number(p.value).toLocaleString()} ${p.key}`, glyph: "" };
}
function allSignals(i: Row): string {
  const bits: string[] = [];
  if (i.stars != null) bits.push(`★ ${Number(i.stars).toLocaleString()} stars`);
  if (i.usage != null) bits.push(`↑ ${Number(i.usage).toLocaleString()} used`);
  if (i.tested != null) bits.push(`✓ tested (${Math.round(i.tested * 100)}%)`);
  if (i.mentions != null) bits.push(`♦ ${i.mentions} mentions`);
  return bits.length ? bits.join(" · ") : "no measured signals yet";
}

export default function Leaderboard() {
  const [data, setData] = useState<Result | null>(null);
  const [err, setErr] = useState<string>("");
  const [component, setComponent] = useState("");
  const [domain, setDomain] = useState("");
  const [vertical, setVertical] = useState("");
  const [sort, setSort] = useState("universal");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const load = useCallback(() => {
    const q = new URLSearchParams();
    if (component) q.set("component", component);
    if (domain) q.set("domain", domain);
    if (vertical) q.set("vertical", vertical);
    q.set("sort", sort); q.set("dir", dir); q.set("limit", "150");
    fetch("/api/rank?" + q.toString())
      .then((r) => r.json()).then(setData).catch((e) => setErr(String(e)));
  }, [component, domain, vertical, sort, dir]);
  useEffect(() => { load(); }, [load]);

  const csvHref = useMemo(() => {
    const q = new URLSearchParams();
    if (component) q.set("component", component);
    if (domain) q.set("domain", domain);
    if (vertical) q.set("vertical", vertical);
    q.set("sort", sort); q.set("dir", dir);
    return "/api/rank.csv?" + q.toString();
  }, [component, domain, vertical, sort, dir]);

  const clickSort = (axis: string) => {
    if (sort === axis) setDir(dir === "desc" ? "asc" : "desc");
    else { setSort(axis); setDir("desc"); }
  };
  const arrow = (axis: string) => (sort === axis ? <span style={{ color: "var(--accent)", fontSize: 9 }}> {dir === "asc" ? "▲" : "▼"}</span> : null);

  const slice = [component, domain, vertical].filter(Boolean).join(" × ") || "everything";
  const th: React.CSSProperties = { textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-muted)", fontWeight: 600, padding: "12px 14px", borderBottom: "1px solid var(--line-default)", whiteSpace: "nowrap" };
  const td: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid var(--line-subtle)", verticalAlign: "top" };
  const sel: React.CSSProperties = { font: "inherit", fontSize: 13.5, color: "var(--text-hi)", background: "var(--bg-raise-1)", border: "1px solid var(--line-default)", borderRadius: 8, padding: "7px 11px", cursor: "pointer" };

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 44, lineHeight: 1.05, color: "var(--text-hi)", letterSpacing: "-0.02em", margin: 0 }}>
        The Leaderboard
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: 12, maxWidth: "60ch", lineHeight: 1.6 }}>
        Every open-source building block — MCP, CLI, skill, plugin, repo, package, docs — with one
        Universal rating. Sliceable by component and domain, sortable on any axis.{" "}
        <a href="/formula" style={{ color: "var(--accent-hover)", textDecoration: "underline", textUnderlineOffset: 3 }}>How the score works →</a>
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "28px 0 20px" }}>
        <select aria-label="component" style={sel} value={component} onChange={(e) => setComponent(e.target.value)}>
          <option value="">every component</option>
          {data?.facets.components.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
        </select>
        <select aria-label="domain" style={sel} value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">every domain</option>
          {data?.facets.domains.map((d) => <option key={d.key} value={d.key}>{d.key}</option>)}
        </select>
        <select aria-label="vertical" style={sel} value={vertical} onChange={(e) => setVertical(e.target.value)}>
          <option value="">every vertical</option>
          {data?.facets.verticals.map((v) => <option key={v.key} value={v.key}>{v.key}</option>)}
        </select>
        <select aria-label="sort by" style={sel} value={sort} onChange={(e) => { setSort(e.target.value); setDir("desc"); }}>
          {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <a href={csvHref} style={{ ...sel, textDecoration: "none" }}>Export CSV</a>
        <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
          <strong style={{ color: "var(--text-body)" }}>{(data?.total ?? 0).toLocaleString()}</strong> in {slice} · of {(data?.facets.total ?? 0).toLocaleString()} total
        </span>
      </div>

      {err && <div style={{ color: "var(--warn)" }}>Couldn’t load: {err}</div>}
      <div style={{ overflowX: "auto", border: "1px solid var(--line-default)", borderRadius: 14, background: "var(--bg-raise-1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={{ ...th, cursor: "pointer" }} onClick={() => clickSort("universal")}>universal{arrow("universal")}</th>
              <th style={th}>name — what it is</th>
              <th style={{ ...th }} title="each artifact's strongest metric — hover a row for all of them">top signal</th>
              <th style={th}>component</th>
              <th style={th}>domain</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((i, n) => (
              <tr key={i.name + n}>
                <td style={{ ...td, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{n + 1}</td>
                <td style={{ ...td }}>{i.universal != null ? <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-hi)", fontVariantNumeric: "tabular-nums" }}>{i.universal}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                <td style={td}>
                  {i.url ? <a href={i.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-hi)", fontWeight: 500 }}>{i.name}</a> : <span style={{ color: "var(--text-hi)", fontWeight: 500 }}>{i.name}</span>}
                  {i.verified && <span title="we installed + measured this" style={{ marginLeft: 6, fontSize: 11, color: "var(--accent)", border: "1px solid var(--accent-line)", borderRadius: 5, padding: "1px 5px", whiteSpace: "nowrap" }}>✓ verified</span>}
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3, maxWidth: "56ch" }}>{i.desc}</div>
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }} title={allSignals(i)}>
                  {(() => { const p = primaryLabel(i); return p.text === "—"
                    ? <span style={{ color: "var(--text-muted)" }}>—</span>
                    : <span style={{ color: "var(--text-body)" }}><span style={{ color: "var(--accent)" }}>{p.glyph}</span> {p.text}</span>; })()}
                </td>
                <td style={{ ...td, color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>{i.component}</td>
                <td style={{ ...td, color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>{i.domain}</td>
              </tr>
            ))}
            {data && data.items.length === 0 && <tr><td style={{ ...td, color: "var(--text-muted)" }} colSpan={6}>nothing in this slice yet</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
