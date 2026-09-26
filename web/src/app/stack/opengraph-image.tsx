// /stack's preview card: the pick for each of the eleven harness components.
import { STACK_AS_OF, STACK_COMPONENTS } from "@/lib/canon";
import { shortDate } from "@/lib/format";
import { OG, OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";

export const alt = "Armory Stack: one pick per harness component";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  const slots = STACK_COMPONENTS.map((c) => ({ label: c.label, pick: c.picks[0]?.name ?? "No pick" }));
  const half = Math.ceil(slots.length / 2);
  const column = (list: typeof slots) => (
    <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
      {list.map((s) => (
        <div key={s.label} style={{ display: "flex", alignItems: "baseline", marginTop: 12 }}>
          <span style={{ width: 170, fontSize: 21, color: OG.faint }}>{s.label}</span>
          <span style={{ fontSize: 25, color: OG.body }}>{s.pick}</span>
        </div>
      ))}
    </div>
  );
  return ogCard({
    kicker: "Stack",
    footer: `Picks as of ${shortDate(STACK_AS_OF)}`,
    children: (
      <>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1 }}>
          One pick per harness component
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          {column(slots.slice(0, half))}
          {column(slots.slice(half))}
        </div>
      </>
    ),
  });
}
