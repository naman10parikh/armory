// POST /api/ask — the conversational query surface. Turns a natural-language request ("finance MCPs
// that help with Excel modeling") into a keyword query, runs the SAME field-weighted keyword scorer as
// /api/search over the vendored catalog, and returns the top matches enriched with the shared engine's
// component, domain, vertical, Universal score, and primary signal.
//
// The pipeline itself now lives in `@/lib/ask-core` (`askCatalog`), because the email and SMS inboxes
// answer with the identical one — this route is the HTTP wrapper over it: parse `q`, rename
// `interpretation` → `interpreted` for the client contract, serialize. Same behaviour, same JSON shape.
// Node runtime; ask-core owns the catalog read like /api/rank and /api/search.
import { NextResponse } from "next/server";
import { askCatalog } from "@/lib/ask-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse> {
  let q = "";
  try {
    const body = (await req.json()) as { q?: unknown };
    q = typeof body.q === "string" ? body.q.trim() : "";
  } catch {
    q = ""; // Intentionally silent: a malformed body is treated as an empty query.
  }

  const r = await askCatalog(q);
  // `reason` is omitted entirely on the success path — it never appeared there before either.
  return NextResponse.json(
    r.reason
      ? { ok: r.ok, reason: r.reason, interpreted: r.interpretation, summary: r.summary, items: r.items }
      : { ok: r.ok, interpreted: r.interpretation, summary: r.summary, items: r.items },
  );
}
