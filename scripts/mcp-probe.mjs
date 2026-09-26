#!/usr/bin/env node
// Minimal MCP stdio client: initialize → notifications/initialized → tools/list → tools/call rank_components
// (memory, then the Tools shelf by its name). Exits 0 only when each answers without an error, and the
// Tools shelf returns rows. Adapted from the CP138 T50 transcript's client
// (docs/surface-transcripts/mcp.md), which found the installed bin exiting before it answered.
//
//   node scripts/mcp-probe.mjs <command> [args...]
import { spawn } from "node:child_process";

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("usage: node scripts/mcp-probe.mjs <command> [args...]");
  process.exit(2);
}
const STEP_MS = 60_000;
const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"], env: process.env });
const pending = new Map();
let buf = "";
let exited = null;

child.stdout.on("data", (chunk) => {
  buf += chunk.toString("utf8");
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) pending.get(msg.id)(msg);
    } catch {
      console.log(`(non-JSON on stdout) ${line}`);
    }
  }
});
child.stderr.on("data", (chunk) => process.stderr.write(`[server] ${chunk}`));
const exit = new Promise((res) => child.on("exit", (code, signal) => res((exited = { code, signal }))));

function request(id, method, params) {
  const reply = new Promise((res) => pending.set(id, res));
  if (!exited) child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  const timeout = new Promise((res) => setTimeout(() => res({ timeout: true }), STEP_MS).unref());
  return Promise.race([reply, exit.then((e) => ({ exitedBeforeReply: e })), timeout]);
}

function fail(step, got) {
  console.log(`✗ ${step}: ${JSON.stringify(got).slice(0, 400)}`);
  child.kill("SIGTERM");
  process.exit(1);
}

const init = await request(1, "initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "armory-fresh-install-check", version: "1.0.0" },
});
if (!init.result) fail("initialize", init);
console.log(`✓ initialize: ${init.result.serverInfo?.name} ${init.result.serverInfo?.version}`);
child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);

const list = await request(2, "tools/list", {});
if (!list.result) fail("tools/list", list);
console.log(`✓ tools/list: ${list.result.tools.map((t) => t.name).join(", ")}`);

const call = await request(3, "tools/call", { name: "rank_components", arguments: { component: "memory", limit: 3 } });
if (!call.result || call.result.isError) fail("tools/call rank_components", call);
const lb = JSON.parse(call.result.content[0].text);
console.log(
  `✓ rank_components memory: ${lb.items.map((i) => `${i.name} ${i.universal}`).join(", ")} · ${lb.total} in memory, ${lb.facets.total} in all`,
);

// A shelf name ranks the whole shelf: "tools" returned 0 rows before CP138 PR E.
const tools = await request(4, "tools/call", { name: "rank_components", arguments: { component: "tools", limit: 3 } });
if (!tools.result || tools.result.isError) fail("tools/call rank_components tools", tools);
const tb = JSON.parse(tools.result.content[0].text);
if (!(tb.total > 0) || tb.items.some((i) => !["cli", "tool"].includes(i.component))) fail("rank_components tools lists the Tools shelf", tb);
console.log(`✓ rank_components tools: ${tb.items.map((i) => `${i.name} ${i.universal}`).join(", ")} · ${tb.total} on the Tools shelf`);

child.stdin.end();
const done = await Promise.race([exit, new Promise((r) => setTimeout(() => r(null), 5000).unref())]);
if (!done) child.kill("SIGTERM");
process.exit(0);
