#!/usr/bin/env node
// identity-check.mjs — does Armory actually own an inbox and a phone number? (CP137 A4 · T63)
//
// Reads the chairman's env files on disk (never prints a value), asks AgentMail and Twilio what exists,
// and — with --ensure-inbox — creates the `armory` inbox if the account has none. Prints addresses and
// numbers only. Read-only otherwise.
//
//   node scripts/identity-check.mjs                 # report
//   node scripts/identity-check.mjs --ensure-inbox  # also create the armory@ inbox when missing
//
import { readFileSync, existsSync } from "node:fs";

const SOURCES = ["/Users/naman/energy/.env", "/Users/naman/energy/.env.restore", "/Users/naman/sentinel/.env"];
const env = {};
for (const f of SOURCES) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}
const has = (k) => Boolean(env[k]);
const ensure = process.argv.includes("--ensure-inbox");
const AM = "https://api.agentmail.to/v0";

async function agentmail() {
  if (!has("AGENTMAIL_API_KEY")) return console.log("AgentMail  : no AGENTMAIL_API_KEY on disk");
  const h = { authorization: `Bearer ${env.AGENTMAIL_API_KEY}`, "content-type": "application/json" };
  const r = await fetch(`${AM}/inboxes`, { headers: h });
  if (!r.ok) return console.log(`AgentMail  : list inboxes → HTTP ${r.status}`);
  const j = await r.json();
  const inboxes = (j.inboxes || j.data || j || []).map((i) => i.inbox_id || i.address || i.id).filter(Boolean);
  console.log(`AgentMail  : ${inboxes.length} inbox(es): ${inboxes.join(", ") || "none"}`);
  const armory = inboxes.find((a) => /^armory@/i.test(a));
  if (armory) return console.log(`             Armory's inbox: ${armory}`);
  if (!ensure) return console.log("             no armory@ inbox — re-run with --ensure-inbox to create it");
  const c = await fetch(`${AM}/inboxes`, { method: "POST", headers: h, body: JSON.stringify({ username: "armory", display_name: "Armory" }) });
  const cj = await c.json().catch(() => ({}));
  console.log(c.ok ? `             created: ${cj.inbox_id || cj.address || JSON.stringify(cj).slice(0, 80)}` : `             create → HTTP ${c.status} ${JSON.stringify(cj).slice(0, 120)}`);
}

async function twilio() {
  if (!has("TWILIO_ACCOUNT_SID") || !has("TWILIO_AUTH_TOKEN")) return console.log("Twilio     : no TWILIO_ACCOUNT_SID/AUTH_TOKEN on disk");
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json?PageSize=5`, { headers: { authorization: `Basic ${auth}` } });
  if (!r.ok) return console.log(`Twilio     : HTTP ${r.status} (auth or account)`);
  const j = await r.json();
  const nums = (j.incoming_phone_numbers || []).map((n) => `${n.phone_number}${n.sms_url ? ` (sms webhook: ${n.sms_url})` : " (no sms webhook set)"}`);
  console.log(`Twilio     : ${nums.length} number(s): ${nums.join(" · ") || "none"}`);
  console.log(`             on disk TWILIO_PHONE_NUMBER=${env.TWILIO_PHONE_NUMBER || "(unset)"} · WHATSAPP=${env.TWILIO_WHATSAPP_NUMBER ? "set" : "(unset)"}`);
}

console.log(`env names present: ${["AGENTMAIL_API_KEY", "AGENTMAIL_WEBHOOK_SECRET", "ARMORY_EMAIL", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", "COMPOSIO_API_KEY", "E2B_API_KEY", "BEZALEL_TOKEN"].map((k) => `${k}=${has(k) ? "✓" : "–"}`).join(" ")}`);
await agentmail();
await twilio();
