// Preview cards (og:image, CP143 upgrade 2). /, /stack and every /e/* page get a 1200×630 PNG that
// says what the page holds, drawn by next/og in the site's warm-dark palette. Satori reads TTF, not
// the WOFF2 that next/font ships, so Instrument Sans and Instrument Serif are fetched from Google
// Fonts once per process; when that fails the card still draws, in next/og's built-in font.
import "server-only";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";
const HOST = "armory-murex.vercel.app";

/** The site's tokens as hex (src/app/globals.css); the accent is oklch(78% 0.13 72). */
export const OG = {
  canvas: "#121110",
  surface: "#181716",
  line: "#2b2927",
  hi: "#f1efed",
  body: "#dcd9d6",
  muted: "#b4b1ae",
  faint: "#8f8b87",
  accent: "#eaa950",
} as const;

interface Font {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal";
}

async function googleFont(family: string, weight: 400 | 600): Promise<Font | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`, {
      signal: AbortSignal.timeout(15_000),
    }).then((r) => r.text());
    const url = /src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!url) throw new Error("the stylesheet named no TTF");
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { name: family, data: await res.arrayBuffer(), weight, style: "normal" };
  } catch (err) {
    console.warn(`[og] ${family} ${weight} unavailable, using the default font:`, err instanceof Error ? err.message : String(err));
    return null;
  }
}

let FONTS: Promise<Font[]> | null = null;
function fonts(): Promise<Font[]> {
  FONTS ??= Promise.all([
    googleFont("Instrument Sans", 400),
    googleFont("Instrument Sans", 600),
    googleFont("Instrument Serif", 400),
  ]).then((list) => list.filter((f): f is Font => f != null));
  return FONTS;
}

/** One card: wordmark and kicker on top, the page's own content, the address at the foot. */
export async function ogCard({
  kicker,
  footer,
  children,
}: {
  kicker: string;
  footer?: string;
  children: ReactNode;
}): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG.canvas,
          color: OG.hi,
          fontFamily: "Instrument Sans",
          padding: "52px 64px 44px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Instrument Serif", fontSize: 46, color: OG.hi }}>Armory</span>
          <span style={{ fontSize: 22, color: OG.muted, letterSpacing: 2.5, textTransform: "uppercase" }}>{kicker}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginTop: 36 }}>{children}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${OG.line}`,
            paddingTop: 20,
            fontSize: 22,
            color: OG.faint,
          }}
        >
          <span>{footer ?? ""}</span>
          <span>{HOST}</span>
        </div>
      </div>
    ),
    // An empty `fonts` list stops Satori ("No fonts are loaded"); leaving it out draws in the default.
    { ...OG_SIZE, ...(await fonts().then((list) => (list.length ? { fonts: list } : {}))) },
  );
}
