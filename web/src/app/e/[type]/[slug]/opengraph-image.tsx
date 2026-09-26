// A component's preview card: what it is, its Score, the evidence behind it in words, and who
// contributed the row when a feed did.
import { clampWords } from "@/components/data-table";
import { signalPhrases } from "@/components/signals-row";
import { OG, OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";
import { findRow } from "@/lib/rows";
import { CATEGORY_LABEL, type ComponentType } from "@/lib/types";

export const alt = "An Armory component: its Score and the evidence behind it";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: { type: string; slug: string } }) {
  // Next 15 hands metadata-image routes plain params (the page's are a Promise).
  const { type, slug: name } = params;
  const row = findRow(type, name) ?? null;
  const evidence = row ? signalPhrases(row.signals) : [];
  return ogCard({
    kicker: CATEGORY_LABEL[type as ComponentType] ?? type,
    footer: row?.contributedBy ? `Contributed by ${row.contributedBy}` : undefined,
    children: (
      <>
        <div
          style={{ display: "flex", fontSize: 56, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1, wordBreak: "break-all" }}
        >
          {clampWords(name, 60)}
        </div>
        {row?.desc ? (
          <div style={{ display: "flex", marginTop: 16, fontSize: 27, lineHeight: 1.35, color: OG.muted }}>
            {clampWords(row.desc, 150)}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: "auto", marginBottom: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", marginRight: 44 }}>
            <span style={{ fontSize: 20, color: OG.faint, letterSpacing: 2.5, textTransform: "uppercase" }}>Score</span>
            <span style={{ fontSize: 84, fontWeight: 600, lineHeight: 1, color: row?.universal != null ? OG.accent : OG.faint }}>
              {row?.universal != null ? row.universal.toFixed(1) : "Unranked"}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 640, fontSize: 25, lineHeight: 1.4, color: OG.body, paddingBottom: 6 }}>
            {evidence.length ? evidence.join(" · ") : "No signals yet"}
          </div>
        </div>
      </>
    ),
  });
}
