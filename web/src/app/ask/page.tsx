"use client";
// Ask — the conversational front door to the catalog. Type a request in plain English ("finance MCPs
// that help with Excel modeling") and POST it to /api/ask, which uses Gemini's free tier to read the
// intent and returns ranked building blocks. Degrades to keyword matches when no Gemini key is set.
// Warm-black + Synapse-Amber, editorial — same inline-token house style as the Leaderboard.
import { useCallback, useState } from "react";

interface Primary { key: string; value: number | null; pct: number; label: string }
interface AskItem {
  name: string; component: string; domain: string; vertical: string | null;
  url: string | null; universal: number | null; primary: Primary | null; desc: string;
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
  if (p.key === "mentions") return { text: `${p.value} mentioned`, glyph: "♦" };
  if (p.key === "stars") return { text: `${Number(p.value).toLocaleString()} stars`, glyph: "★" };
  if (p.key === "usage") return { text: `${Number(p.value).toLocaleString()} used`, glyph: "↑" };
  return { text: `${Number(p.value).toLocaleString()} ${p.key}`, glyph: "" };
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

  const degraded = data?.reason === "no_key" || data?.reason === "gemini_error";

  const card: React.CSSProperties = {
    border: "1px solid var(--line-default)", borderRadius: 14, background: "var(--bg-raise-1)", padding: "16px 18px",
  };
  const nameLink: React.CSSProperties = { color: "var(--text-hi)", fontWeight: 600, fontSize: 15.5, textDecoration: "none" };
  const scoreBadge: React.CSSProperties = {
    fontWeight: 700, fontSize: 15, color: "var(--text-hi)", fontVariantNumeric: "tabular-nums",
    border: "1px solid var(--accent-line)", borderRadius: 8, padding: "2px 9px", whiteSpace: "nowrap",
  };
  const metaText: React.CSSProperties = { fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" };

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "56px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 44, lineHeight: 1.05, color: "var(--text-hi)", letterSpacing: "-0.02em", margin: 0 }}>
        Ask the Armory
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: 12, maxWidth: "58ch", lineHeight: 1.6 }}>
        Describe what your agent needs in plain English. We read the intent, search the ranked index, and
        hand back the building blocks that fit — MCPs, CLIs, skills, and more.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(q); }}
        style={{ display: "flex", gap: 10, margin: "28px 0 14px", flexWrap: "wrap" }}
      >
        <input
          aria-label="Ask for any tool"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask for any tool…"
          style={{
            flex: "1 1 320px", font: "inherit", fontSize: 15, color: "var(--text-hi)",
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
        <section style={{ marginTop: 32 }}>
          <p style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 24, lineHeight: 1.25, color: "var(--text-hi)", margin: 0, letterSpacing: "-0.01em" }}>
            {data.summary}
          </p>

          {/* Interpreted facets: component/domain/vertical in amber, raw keywords muted. */}
          {(data.interpreted.component || data.interpreted.domain || data.interpreted.vertical || data.interpreted.keywords.length > 0) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {data.interpreted.component && <span style={chipAmber}>{data.interpreted.component}</span>}
              {data.interpreted.vertical && <span style={chipAmber}>{data.interpreted.vertical}</span>}
              {data.interpreted.domain && <span style={chipAmber}>{data.interpreted.domain}</span>}
              {data.interpreted.keywords.map((k) => <span key={k} style={chipMuted}>{k}</span>)}
            </div>
          )}

          {degraded && (
            <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-muted)", borderLeft: "2px solid var(--accent-line)", paddingLeft: 12, lineHeight: 1.5 }}>
              Conversational mode needs a Gemini key — showing keyword matches.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
            {data.items.map((i, n) => {
              const p = primaryLabel(i.primary);
              return (
                <article key={i.name + n} style={card}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                    {i.url
                      ? <a href={i.url} target="_blank" rel="noopener noreferrer" style={nameLink}>{i.name}</a>
                      : <span style={nameLink}>{i.name}</span>}
                    {i.universal != null && <span style={scoreBadge}>{i.universal}</span>}
                  </div>
                  {i.desc && <div style={{ color: "var(--text-body)", fontSize: 13.5, marginTop: 6, lineHeight: 1.55, maxWidth: "62ch" }}>{i.desc}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                    {p.text && (
                      <span style={{ fontSize: 12.5, color: "var(--text-body)", whiteSpace: "nowrap" }}>
                        <span style={{ color: "var(--accent)" }}>{p.glyph}</span> {p.text}
                      </span>
                    )}
                    <span style={metaText}>{[i.component, i.domain, i.vertical].filter(Boolean).join(" · ")}</span>
                  </div>
                </article>
              );
            })}
            {data.items.length === 0 && !loading && (
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Nothing matched — try broader or different terms.</div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
