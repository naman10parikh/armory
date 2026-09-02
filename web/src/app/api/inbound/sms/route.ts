// POST /api/inbound/sms — Armory answers its own phone number (SMS and WhatsApp, one route).
//
// Twilio POSTs an `application/x-www-form-urlencoded` body (`From`, `To`, `Body`, …). We run `Body`
// through the SAME pipeline as /api/ask (`askCatalog`), render ≤3 picks as plain text
// (`renderAnswer`), and return it as TwiML. Twilio sends that reply itself — so there is no outbound
// API call, no TWILIO_ACCOUNT_SID read here, and WhatsApp works by the same mechanism as SMS.
//
// Requests are authenticated with the `X-Twilio-Signature` header, per
// https://www.twilio.com/docs/usage/security — take the full URL through its query string, append
// every POST parameter as name+value in case-sensitive sorted order with no delimiter, HMAC-SHA1 it
// with the AuthToken, base64 the digest, compare. Implemented with node:crypto; no SDK.
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { askCatalog } from "@/lib/ask-core";
import { renderAnswer } from "@/lib/answer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Up to 3 picks go in a text message (web/src/lib/answer.ts SMS_PICKS). */
const LIMIT = 3;

/** The URL Twilio signed. Behind Vercel's proxy `req.url` carries the internal scheme, so the
 *  forwarded headers — which hold the public origin the console was pointed at — win when present. */
function publicUrl(req: Request): string {
  const u = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (proto && host) return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}${u.pathname}${u.search}`;
  return u.toString();
}

function isValidSignature(url: string, params: Map<string, string>, signature: string, token: string): boolean {
  let payload = url;
  for (const key of [...params.keys()].sort()) payload += key + (params.get(key) ?? "");
  const expected = createHmac("sha1", token).update(payload, "utf-8").digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Escape the five XML entities so a component name containing `&` cannot break the document. */
const xml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function twiml(message: string, note?: string): NextResponse {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${
    note ? `<!-- ${xml(note)} -->` : ""
  }<Message>${xml(message)}</Message></Response>`;
  return new NextResponse(body, { status: 200, headers: { "content-type": "text/xml; charset=utf-8" } });
}

export async function POST(req: Request): Promise<NextResponse> {
  const params = new Map<string, string>();
  try {
    const form = await req.formData();
    for (const [k, v] of form.entries()) if (typeof v === "string") params.set(k, v);
  } catch {
    // Intentionally silent: a body Twilio did not send yields no params, answered as an empty query.
  }

  // Signature gate. With a token set, a bad or missing signature is rejected outright; with no token
  // set there is nothing to verify against, so the request is answered and the reply says as much.
  const token = process.env.TWILIO_AUTH_TOKEN;
  let note: string | undefined;
  if (token) {
    const signature = req.headers.get("x-twilio-signature") ?? "";
    if (!signature || !isValidSignature(publicUrl(req), params, signature, token)) {
      return NextResponse.json({ ok: false, reason: "invalid X-Twilio-Signature" }, { status: 403 });
    }
  } else {
    note = "signature not verified: TWILIO_AUTH_TOKEN not set";
  }

  const q = (params.get("Body") ?? "").trim();
  const { items } = await askCatalog(q, LIMIT);
  return twiml(renderAnswer(items, q, { channel: "sms" }), note);
}

export function GET(): NextResponse {
  return NextResponse.json({ error: "POST a Twilio form-encoded webhook here" }, { status: 405 });
}
