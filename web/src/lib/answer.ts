// Plain-text rendering of an ask result, for the channels that have no DOM: email and SMS/WhatsApp.
// Same picks the /ask page shows, same Score, same install command — rendered as text a phone and a
// mail client both display correctly. No markdown (an SMS shows the asterisks), no emoji, and labels
// rather than sentences (web/COPY.md §1 R1/R5/R9).
import { installCommand } from "@/lib/install-targets";
import type { AskItem } from "@/lib/ask-core";

/** The public site. The one place a channel reply points a reader back to. */
export const SITE = "https://armory-murex.vercel.app";

/** Email fits a list; a text message does not. Both caps are hard. */
const EMAIL_PICKS = 5;
const SMS_PICKS = 3;
/** One GSM-encoded segment is 160 chars; three is the most a single answer should cost. */
const SMS_MAX = 480;

export type Channel = "email" | "sms";

/** COPY.md §2 — a missing Score is `Unmeasured`, never a guessed number or a bare dash in prose. */
const score = (v: number | null): string => (v == null ? "Unmeasured" : v.toFixed(1));

/** One line of description, cut at a word boundary. Email gets prose room; SMS carries none at all. */
function oneLine(text: string, max: number): string {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${(at > max / 2 ? cut.slice(0, at) : cut).replace(/[\s.,;:–—-]+$/, "")}…`;
}

// Name — Score · description, then the two copyable strings on their own lines so no mail client
// wraps a command or a URL mid-token.
function emailPick(item: AskItem, i: number): string {
  const head = `${i + 1}. ${item.name} — ${score(item.universal)}`;
  const lines = [item.desc ? `${head} · ${oneLine(item.desc, 110)}` : head];
  lines.push(`   ${installCommand(item.name, "claude")}`);
  if (item.url) lines.push(`   ${item.url}`);
  return lines.join("\n");
}

function renderEmail(items: AskItem[], q: string): string {
  const head = `Armory · ${q}`;
  const footer = `Ask · ${SITE}/ask`;
  if (items.length === 0) {
    return [head, "", "No Results · Broaden the query", "", footer].join("\n");
  }
  const picks = items.slice(0, EMAIL_PICKS);
  return [
    `${head} · ${picks.length} Picks`,
    "",
    picks.map(emailPick).join("\n\n"),
    "",
    footer,
  ].join("\n");
}

function renderSms(items: AskItem[], q: string): string {
  const head = `Armory · ${oneLine(q, 60)}`;
  if (items.length === 0) return `${head}\nNo Results · ${SITE}/ask`;

  // Name + Score + link only. Drop picks from the end until the whole message fits one budget —
  // a truncated URL is a broken URL, so the cut lands between picks, never inside one.
  const lines = items
    .slice(0, SMS_PICKS)
    .map((it, i) => `${i + 1}. ${it.name} ${score(it.universal)}${it.url ? ` ${it.url}` : ""}`);
  while (lines.length > 1 && [head, ...lines].join("\n").length > SMS_MAX) lines.pop();
  const out = [head, ...lines].join("\n");
  return out.length <= SMS_MAX ? out : out.slice(0, SMS_MAX);
}

/** Render one answer for one channel. Pure — no I/O, no secrets, no network. */
export function renderAnswer(items: AskItem[], q: string, opts: { channel: Channel }): string {
  return opts.channel === "sms" ? renderSms(items, q) : renderEmail(items, q);
}
