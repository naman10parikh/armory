// The home page's preview card: the promise with the live count, and the top three rows.
import { int, rankedScoreTexts } from "@/lib/format";
import { OG, OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";
import { boardMeta, topRows } from "@/lib/rows";

export const alt = "Armory: agent components ranked on public evidence";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  const meta = boardMeta();
  const top = topRows(3);
  const scores = rankedScoreTexts(top.map((r) => r.exact));
  return ogCard({
    kicker: "Top ranked",
    footer: "Refreshed nightly",
    children: (
      <>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1 }}>
          {`${int(meta.total)} agent components, ranked on public evidence`}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 28, color: OG.muted }}>
          Each one installs in one command
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: 28 }}>
          {top.map((r, i) => (
            <div key={r.name} style={{ display: "flex", alignItems: "baseline", fontSize: 28, marginTop: 10 }}>
              <span style={{ width: 44, color: OG.faint }}>{i + 1}</span>
              <span style={{ flexGrow: 1, color: OG.body }}>{r.name}</span>
              <span style={{ color: OG.accent }}>{scores[i] ?? ""}</span>
            </div>
          ))}
        </div>
      </>
    ),
  });
}
