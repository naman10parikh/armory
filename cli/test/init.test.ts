import { describe, it, expect } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInit, harnessFromFlags, ARMORY_MCP } from "../src/init.js";

const scratch = () => mkdtempSync(join(tmpdir(), "armory-init-"));

describe("armory init", () => {
  it("writes the Armory MCP server into a fresh Claude Code project", () => {
    const root = scratch();
    const r = runInit({ cli: "claude", to: root, force: false, dryRun: false });
    expect(r.cli).toBe("claude");
    expect(r.result.created).toBe(true);
    const cfg = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"));
    expect(cfg.mcpServers.armory).toEqual(ARMORY_MCP);
    rmSync(root, { recursive: true, force: true });
  });

  it("merges without clobbering other servers, and skips a second run", () => {
    const root = scratch();
    mkdirSync(join(root, ".cursor"));
    const file = join(root, ".cursor", "mcp.json");
    const before = { mcpServers: { other: { command: "x", args: [] } } };
    writeFileSync(file, JSON.stringify(before));
    const first = runInit({ cli: undefined, to: root, force: false, dryRun: false }); // auto-detects cursor
    expect(first.cli).toBe("cursor");
    const cfg = JSON.parse(readFileSync(file, "utf8"));
    expect(Object.keys(cfg.mcpServers).sort()).toEqual(["armory", "other"]);
    const second = runInit({ cli: "cursor", to: root, force: false, dryRun: false });
    expect(second.result.alreadyPresent).toBe(true);
    rmSync(root, { recursive: true, force: true });
  });

  it("emits a TOML table for Codex and writes nothing on --dry-run", () => {
    const root = scratch();
    const dry = runInit({ cli: "codex", to: root, force: false, dryRun: true });
    expect(existsSync(dry.result.file)).toBe(false);
    runInit({ cli: "codex", to: root, force: false, dryRun: false });
    expect(readFileSync(join(root, ".codex", "config.toml"), "utf8")).toContain("[mcp_servers.armory]");
    rmSync(root, { recursive: true, force: true });
  });

  it("rejects an unknown harness and maps flags to a harness", () => {
    expect(() => runInit({ cli: "vim", to: scratch(), force: false, dryRun: true })).toThrow(/unknown harness/);
    expect(harnessFromFlags({ gemini: true })).toBe("gemini");
    expect(harnessFromFlags({})).toBeUndefined();
  });
});
