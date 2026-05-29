#!/usr/bin/env node
// Component frontmatter validator. Checks every component file under
// brain/components/<type>/ against the CONTRIBUTING.md contract.
// Exits non-zero on any failure. Run: node ingest/validate.mjs
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, TYPES } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS = join(ROOT, "brain", "components");

// Per the contract: name, type, description, source_url, license, verified_at.
const REQUIRED = ["name", "type", "description", "source_url", "license", "verified_at"];

function validate() {
  const errors = [];
  let checked = 0;
  for (const type of TYPES) {
    const dir = join(COMPONENTS, type);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const slug = basename(file, ".md");
      if (slug === type) continue; // category hub note — not an component
      checked += 1;
      const rel = `components/${type}/${file}`;
      const fm = parseFrontmatter(readFileSync(join(dir, file), "utf8"));

      for (const field of REQUIRED) {
        const v = fm[field];
        if (v === undefined || v === null || v === "") {
          errors.push(`${rel}: missing required field "${field}"`);
        }
      }
      if (fm.name !== undefined && fm.name !== slug) {
        errors.push(`${rel}: name "${fm.name}" must equal filename "${slug}"`);
      }
      if (fm.type !== undefined && fm.type !== type) {
        errors.push(`${rel}: type "${fm.type}" must equal its folder "${type}"`);
      }
      if (fm.type !== undefined && !TYPES.includes(fm.type)) {
        errors.push(`${rel}: type "${fm.type}" is not one of the 12 valid categories`);
      }
    }
  }
  return { checked, errors };
}

const { checked, errors } = validate();
if (errors.length === 0) {
  console.log(`component validate: PASS — ${checked} component(s) valid across ${TYPES.length} categories`);
  process.exit(0);
}
console.error(`component validate: FAIL — ${errors.length} error(s) across ${checked} component(s):`);
for (const e of errors) console.error(`  ✗ ${e}`);
process.exit(1);
