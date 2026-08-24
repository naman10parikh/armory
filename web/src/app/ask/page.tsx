"use client";
// Ask — the conversational front door to the catalog. Type a request in plain English ("finance MCPs
// that help with Excel modeling") and POST it to /api/ask, which uses Gemini's free tier to read the
// intent and returns ranked building blocks. Degrades to keyword matches when no Gemini key is set.
// Every result card LEADS with the ranking (Universal score, the artifact's claim-to-fame metric, the
// verified chip) — the ranking is the product, so the answer surface must show it, not hide it.
// Warm-black + Synapse-Amber, editorial — same inline-token house style as the Leaderboard.
import { useCallback, useState } from "react";

interface Primary { key: string; value: number | null; pct: number; label: string }
interface Signals { stars: number | null; usage: number | null; tested: number | null; mentions: number | null }
interface AskItem {
  name: string; component: string; domain: string; vertical: string | null;
  url: string | null; universal: number | null; primary: Primary | null; desc: string;
  verified: boolean; signals: Signals;
}
interface Interpreted { keywords: string[]; component?: string; domain?: string; vertical?: string }
interface AskResponse {
  ok: boolean; reason?: string; interpreted: Interpreted; summary: string; items: AskItem[];
}

const EXAMPLES = [
  "finance MCPs that help with Excel modeling",
  "best browser-automation tool",
  "skills for writing tests",
  "memory systems for agents",
  "how do I deploy an agent to a sandbox",
];

// Each item's PRIMARY metric (its claim to fame) as a glyph + label — mirrors the Leaderboard.
function primaryLabel(p: Primary | null): { text: string; glyph: string } {
  if (!p || p.value == null) return { text: "", glyph: "" };
  if (p.key === "tested") return { text: "verified", glyph: "✓" };
  if (p.key === "mentions") return { text: `${p.value} mentions`, glyph: "♦" };
  if (p.key === "stars") return { text: `${Number(p.value).toLocaleString()} stars`, glyph: "★" };
  if (p.key === "usage") return { text: `${Number(p.value).toLocaleString()} used`, glyph: "↑" };
  return { text: `${Number(p.value).toLocaleString()} ${p.key}`, glyph: "" };
}
// The full signal breakdown, shown on hover — mirrors the Leaderboard's row tooltip.
function allSignals(s: Signals): string {
  const bits: string[] = [];
  if (s.stars != null) bits.push(`★ ${Number(s.stars).toLocaleString()} stars`);
  if (s.usage != null) bits.push(`↑ ${Number(s.usage).toLocaleString()} used`);
  if (s.tested != null) bits.push(`✓ tested (${Math.round(s.tested * 100)}%)`);
  if (s.mentions != null) bits.push(`♦ ${s.mentions} mentions`);
  return bits.length ? bits.join(" · ") : "no measured signals yet";
}

const chipAmber: React.CSSProperties = {
  fontSize: 12, color: "var(--accent)", background: "var(--accent-quiet)",
  border: "1px solid var(--accent-line)", borderRadius: 999, padding: "3px 10px", fontWeight: 500, whiteSpace: "nowrap",
};
const chipMuted: React.CSSProperties = {
  fontSize: 12, color: "var(--text-muted)", background: "var(--bg-raise-2)",
  border: "1px solid var(--line-default)", borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap",
};

export default function Ask() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const ask = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setQ(trimmed);
    setLoading(true);
    setErr("");
    fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: trimmed }),
    })
      .then((r) => r.json())
      .then((d: AskResponse) => setData(d))
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Degraded = the keyword fallback. Its `summary` is a SYSTEM message, never an answer — so it must
  // never occupy the serif answer slot; it is demoted to a small muted note below.
  const degraded = data?.reason === "no_key" || data?.reason === "gemini_error";

  const card: React.CSSProperties = {
    display: "flex", gap: 14, alignItems: "flex-start",
    border: "1px solid var(--line-default)", borderRadius: 14, background: "var(--bg-raise-1)", padding: "15px 16px",
  };
  const nameLink: React.CSSProperties = { color: "var(--text-hi)", fontWeight: 600, fontSize: 15, textDecoration: "none" };
  // The score rail — the first thing the eye lands on, since the ranking IS the answer.
  const scoreRail: React.CSSProperties = {
    flex: "0 0 auto", minWidth: 58, textAlign: "center", padding: "6px 8px 5px",
    border: "1px solid var(--accent-line)", borderRadius: 10, background: "var(--accent-quiet)",
  };
  const scoreNum: React.CSSProperties = {
    fontSize: 21, fontWeight: 700, lineHeight: 1.05, color: "var(--text-hi)", fontVariantNumeric: "tabular-nums",
  };
  const scoreCap: React.CSSProperties = {
    fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-muted)", marginTop: 3,
  };
  const metaText: React.CSSProperties = { fontSize: 11.5, color: "var(--text-muted)", whiteSpace: "nowrap" };

  const items = data?.items ?? [];
  const ranked = items.filter((i) => i.universal != null).length;
  const topScore = items.reduce((m, i) => (i.universal != null && i.universal > m ? i.universal : m), 0);

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 44, lineHeight: 1.05, color: "var(--text-hi)", letterSpacing: "-0.02em", margin: 0 }}>
        Ask the Armory
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6 }}>
        Describe the job. Get ranked building blocks.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(q); }}
        style={{ display: "flex", gap: 10, margin: "24px 0 14px", flexWrap: "wrap" }}
      >
        <input
          aria-label="Ask for any tool"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask for any tool…"
          style={{
            flex: "1 1 420px", font: "inherit", fontSize: 15, color: "var(--text-hi)",
            background: "var(--bg-raise-1)", border: "1px solid var(--line-default)", borderRadius: 12,
            padding: "13px 16px", outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          style={{
            font: "inherit", fontSize: 15, fontWeight: 600, color: "var(--bg-base)",
            background: loading || !q.trim() ? "var(--accent-line)" : "var(--accent)",
            border: "none", borderRadius: 12, padding: "13px 22px",
            cursor: loading || !q.trim() ? "default" : "pointer", whiteSpace: "nowrap",
          }}
        >
          {loading ? "Searching…" : "Ask"}
        </button>
      </form>

      {/* Example queries — click to run. */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => ask(ex)}
            style={{ ...chipMuted, cursor: "pointer", font: "inherit" }}
          >
            {ex}
          </button>
        ))}
      </div>

      {err && <div style={{ color: "var(--warn)", marginTop: 20 }}>Couldn’t reach the index: {err}</div>}
      {loading && !data && <div style={{ color: "var(--text-muted)", marginTop: 28 }}>Searching the index…</div>}

      {data && (
        <section style={{ marginTop: 30 }}>
          {/* The serif slot holds the real ANSWER only. In keyword mode there is no answer, so it stays empty. */}
          {!degraded && data.summary && (
            <p style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 26, lineHeight: 1.25, color: "var(--text-hi)", margin: 0, letterSpacing: "-0.01em" }}>
              {data.summary}
            </p>
          )}

          {/* What we found, as numbers — the counts a developer scans before reading a single card. */}
          {items.length > 0 && (
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: degraded ? 0 : 10, fontVariantNumeric: "tabular-nums" }}>
              <strong style={{ color: "var(--text-body)" }}>{items.length}</strong> matches ·{" "}
              <strong style={{ color: "var(--text-body)" }}>{ranked}</strong> scored
              {ranked > 0 && <> · top Universal <strong style={{ color: "var(--text-body)" }}>{topScore}</strong></>}
            </div>
          )}

          {/* Interpreted facets: component/domain/vertical in amber, search terms muted.
              The route already strips function words, so no `that`/`help`/`with` junk reaches here. */}
          {(data.interpreted.component || data.interpreted.domain || data.interpreted.vertical || data.interpreted.keywords.length > 0) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {data.interpreted.component && <span style={chipAmber}>{data.interpreted.component}</span>}
              {data.interpreted.vertical && <span style={chipAmber}>{data.interpreted.vertical}</span>}
              {data.interpreted.domain && <span style={chipAmber}>{data.interpreted.domain}</span>}
              {data.interpreted.keywords.map((k) => <span key={k} style={chipMuted}>{k}</span>)}
            </div>
          )}

          {degraded && (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
              Keyword mode — conversational search is off.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12, marginTop: 20 }}>
            {items.map((i, n) => {
              const p = primaryLabel(i.primary);
              return (
                <article key={i.name + n} style={card}>
                  {/* Score first, always present — a real number, or an honest "unrated". */}
                  <div
                    style={i.universal != null ? scoreRail : { ...scoreRail, border: "1px solid var(--line-default)", background: "var(--bg-raise-2)" }}
                    title={i.universal != null ? "Universal score — how this ranks across every measured signal" : "not measured yet — no stars, usage, mentions or test signal"}
                  >
                    <div style={i.universal != null ? scoreNum : { ...scoreNum, color: "var(--text-muted)" }}>
                      {i.universal != null ? i.universal : "—"}
                    </div>
                    <div style={scoreCap}>{i.universal != null ? "universal" : "unrated"}</div>
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div>
                      {i.url
                        ? <a href={i.url} target="_blank" rel="noopener noreferrer" style={nameLink}>{i.name}</a>
                        : <span style={nameLink}>{i.name}</span>}
                      {i.verified && (
                        <span title="we installed + measured this" style={{ marginLeft: 6, fontSize: 11, color: "var(--accent)", border: "1px solid var(--accent-line)", borderRadius: 5, padding: "1px 5px", whiteSpace: "nowrap" }}>
                          ✓ verified
                        </span>
                      )}
                    </div>
                    {i.desc && <div style={{ color: "var(--text-body)", fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>{i.desc}</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }} title={allSignals(i.signals)}>
                      {p.text && (
                        <span style={{ fontSize: 12, color: "var(--text-body)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                          <span style={{ color: "var(--accent)" }}>{p.glyph}</span> {p.text}
                        </span>
                      )}
                      <span style={metaText}>{[i.component, i.domain, i.vertical].filter(Boolean).join(" · ")}</span>
                    </div>
                  </div>
                </article>
              );
            })}
            {items.length === 0 && !loading && (
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Nothing matched — try broader or different terms.</div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
