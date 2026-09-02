// POST /api/inbound/email — Armory answers its own inbox.
//
// AgentMail POSTs here on `message.received`; we run the question through the SAME pipeline as
// /api/ask (`askCatalog`), render the picks as plain text (`renderAnswer`), and send that back through
// AgentMail's REST API. No model call of our own beyond the one /ask already makes.
//
// PAYLOAD SHAPE — sourced from the AgentMail docs:
//   https://docs.agentmail.to/events            (message.received: {type, event_type, event_id,
//                                                message: {inbox_id, thread_id, message_id, from, to,
//                                                subject, text, html, …}, thread})
//   https://docs.agentmail.to/api-reference/inboxes/messages/send  (the send endpoint below)
// The docs render `from` at the message level; AgentMail's Python SDK exposes the same field as `from_`
// (`from` is a Python keyword). We could not confirm which spelling crosses the wire, so we accept
// BOTH — and we accept the message object at the top level or under `message` / `data`, so a webhook
// wrapper of any of those three shapes is understood. Everything else is ignored.
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { askCatalog } from "@/lib/ask-core";
import { renderAnswer } from "@/lib/answer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Up to 5 picks go in an email (web/src/lib/answer.ts EMAIL_PICKS). */
const LIMIT = 5;
const AGENTMAIL_API = "https://api.agentmail.to/v0";
/** The inbox to reply from. The webhook names the inbox that received the mail, so that wins; this is
 *  the fallback when the payload omits it and `ARMORY_INBOX` is unset. */
const DEFAULT_INBOX = "armory@agentmail.to";

interface Inbound {
  from: string;
  subject: string;
  text: string;
  inbox: string;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** `Jane Doe <jane@example.com>` → `jane@example.com`. A bare address passes through unchanged. */
function addressOf(from: string): string {
  const angled = from.match(/<([^>]+)>/);
  return (angled ? angled[1] : from).trim();
}

/** Find the message object wherever the webhook put it, then read the four fields we need. */
function parseInbound(body: unknown): Inbound {
  const root = (body ?? {}) as Record<string, unknown>;
  const nested = [root.message, root.data, root].find(
    (c): c is Record<string, unknown> => typeof c === "object" && c !== null,
  );
  const m = nested ?? {};
  return {
    from: addressOf(str(m.from) || str(m.from_) || str(root.from) || str(root.from_)),
    subject: str(m.subject) || str(root.subject),
    text: str(m.text) || str(root.text),
    inbox: str(m.inbox_id) || str(root.inbox_id) || str(process.env.ARMORY_INBOX) || DEFAULT_INBOX,
  };
}

/** Send the answer. Returns null on success, or the reason it failed (never the key). */
async function sendReply(
  inbox: string,
  to: string,
  subject: string,
  text: string,
  key: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${AGENTMAIL_API}/inboxes/${encodeURIComponent(inbox)}/messages/send`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ to, subject, text }),
    });
    if (!res.ok) return `agentmail http ${res.status}`;
    return null;
  } catch (err) {
    return `agentmail request failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

/**
 * Svix signature check (what AgentMail signs its webhooks with): `svix-signature` carries one or more
 * `v1,<base64>` values of HMAC-SHA256(`${id}.${timestamp}.${rawBody}`) keyed by the base64 secret after
 * `whsec_`. Timestamps older than 5 minutes are rejected (replay). Returns null when valid, else the reason.
 */
function verifySvix(headers: Headers, raw: string, secret: string): string | null {
  const id = headers.get("svix-id");
  const ts = headers.get("svix-timestamp");
  const sigs = headers.get("svix-signature");
  if (!id || !ts || !sigs) return "missing svix headers";
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return "stale svix timestamp";
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${raw}`).digest("base64");
  const ok = sigs.split(" ").some((s) => {
    const v = s.split(",")[1] ?? "";
    return v.length === expected.length && timingSafeEqual(Buffer.from(v), Buffer.from(expected));
  });
  return ok ? null : "invalid svix signature";
}

export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();
  const dry = new URL(req.url).searchParams.get("dry") === "1";

  // A reply is an OUTBOUND EMAIL to whatever address the payload names. Without a verified sender this
  // route is an open relay, so: no webhook secret → never send (compute the answer, report why);
  // secret set → every non-dry request must carry a valid Svix signature.
  const secret = process.env.AGENTMAIL_WEBHOOK_SECRET;
  const signature = secret ? verifySvix(req.headers, raw, secret) : "AGENTMAIL_WEBHOOK_SECRET not set";
  if (signature && !dry) {
    if (secret) return NextResponse.json({ answered: false, reason: signature }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = null; // Intentionally silent: a malformed body yields an empty question, answered below.
  }

  const inbound = parseInbound(body);
  // Subject carries the intent in most mail; the body refines it. Both feed the one query.
  const q = [inbound.subject, inbound.text].filter(Boolean).join(" ").trim();
  const { items } = await askCatalog(q, LIMIT);
  const reply = renderAnswer(items, q || inbound.subject, { channel: "email" });
  const picks = Math.min(items.length, LIMIT);

  // `?dry=1` — compute and show the answer, send nothing. The way to exercise this route in dev.
  if (dry) {
    return NextResponse.json({ answered: false, reason: "dry", to: inbound.from, picks, reply });
  }
  if (signature) {
    // Unsigned because no secret is configured: answer computed, nothing sent, and say so.
    return NextResponse.json({ answered: false, reason: signature, reply });
  }

  const key = process.env.AGENTMAIL_API_KEY;
  if (!key) {
    return NextResponse.json({ answered: false, reason: "AGENTMAIL_API_KEY not set", reply });
  }
  if (!inbound.from) {
    return NextResponse.json({ answered: false, reason: "no sender in payload", reply });
  }

  const subject = inbound.subject ? `Re: ${inbound.subject}` : "Armory";
  const failure = await sendReply(inbound.inbox, inbound.from, subject, reply, key);
  if (failure) {
    console.warn("[api/inbound/email] send failed:", failure);
    return NextResponse.json({ answered: false, reason: failure, reply });
  }
  return NextResponse.json({ answered: true, to: inbound.from, picks });
}

export function GET(): NextResponse {
  return NextResponse.json({ error: "POST an AgentMail message.received webhook here" }, { status: 405 });
}
