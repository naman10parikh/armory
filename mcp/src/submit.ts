// Validate a submitted engram's frontmatter and write it into incoming/.
// Same contract as the CLI (CONTRIBUTING.md REQUIRED fields), here taking raw
// markdown text rather than a file path (the MCP tool receives the body).
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { resolveRoot } from "./catalog.js";

const TYPES = [
  "mcps", "skills", "hooks", "subagents", "identity", "memory",
  "claudemd-rules", "clis-tools", "evals", "observability",
  "infrastructure", "workflows",
];

const REQUIRED = ["name", "type", "description", "source_url", "license"] as const;

export interface SubmitResult {
  ok: boolean;
  errors: string[];
  name: string;
  dest: string;
}

function frontmatterFields(raw: string): Record<string, string> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fields: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

export function validateMarkdown(markdown: string): SubmitResult {
  const fields = frontmatterFields(markdown);
  const errors: string[] = [];

  if (!markdown.trimStart().startsWith("---")) {
    errors.push("markdown must start with YAML frontmatter (---).");
  }
  for (const key of REQUIRED) {
    const val = fields[key];
    if (val === undefined) errors.push(`missing required field: ${key}`);
    else if (val === "" && key !== "description") errors.push(`field "${key}" is empty.`);
  }

  const name = (fields.name ?? "").replace(/^["']|["']$/g, "");
  const type = (fields.type ?? "").replace(/^["']|["']$/g, "");
  if (name && !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    errors.push(`name "${name}" must be kebab-case (a-z, 0-9, hyphen).`);
  }
  if (type && !TYPES.includes(type)) {
    errors.push(`type "${type}" is not one of the 12 categories.`);
  }

  return { ok: errors.length === 0, errors, name, dest: "" };
}

// Validate then persist into incoming/<name>.md.
export function submitMarkdown(markdown: string): SubmitResult {
  const result = validateMarkdown(markdown);
  if (!result.ok) return result;
  const incoming = join(resolveRoot(), "incoming");
  if (!existsSync(incoming)) mkdirSync(incoming, { recursive: true });
  const dest = join(incoming, `${result.name}.md`);
  writeFileSync(dest, markdown.endsWith("\n") ? markdown : `${markdown}\n`);
  return { ...result, dest };
}
