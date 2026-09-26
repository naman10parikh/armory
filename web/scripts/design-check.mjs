#!/usr/bin/env node
// design-check.mjs: text a person reads on the site carries no em dash (the chairman's checklist, item 45).
// It reads every .ts and .tsx file under web/src and flags an em dash in JSX text or in a string literal.
// Comments, regular expressions and a lone em dash that stands for "no value" are fine: a string that is
// only the dash, or an element whose only text is the dash.
//
//   node web/scripts/design-check.mjs     # lists each hit as file:line and exits 1 when there is one
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DASH = "\u2014";
const IDENT = /[A-Za-z0-9_$]/;
// After one of these (or at the start), a `/` opens a regular expression; after anything else it divides.
// `<` and `>` are left out: in JSX they stand before the `/` of `</a>` and `/>`, never before a pattern.
const BEFORE_REGEX = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", ";", "+", "-", "*", "%", "~", "^"]);
const KEYWORDS_BEFORE_REGEX = new Set(["return", "typeof", "case", "in", "of", "void", "yield", "await", "delete", "throw", "new", "else", "do"]);

/** Em dashes a person would read in one source file, as [{ line, text }], one per line. */
export function emDashes(src) {
  const hits = [];
  const flag = (at) => {
    const line = src.slice(0, at).split("\n").length;
    if (hits.some((h) => h.line === line)) return;
    const end = src.indexOf("\n", at);
    hits.push({ line, text: src.slice(src.lastIndexOf("\n", at - 1) + 1, end === -1 ? src.length : end).trim() });
  };
  const templates = []; // the brace depth at each open `${`, so its `}` goes back into the template
  let depth = 0;
  let prev = ""; // the last significant character of code
  let word = ""; // the identifier that ends at `prev`, if any
  let i = 0;

  // The body of a string or template from `i` to its closing quote, or to the next `${` in a template. A
  // quote or apostrophe never runs past its line, so an apostrophe in JSX text cannot swallow the file.
  const body = (quote) => {
    const start = i;
    const dashes = [];
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") { i += 2; continue; }
      if (c === quote) { i += 1; return { dashes, lone: src.slice(start, i - 1) === DASH, open: false }; }
      if (quote !== "`" && c === "\n") break;
      if (quote === "`" && c === "$" && src[i + 1] === "{") { i += 2; return { dashes, lone: false, open: true }; }
      if (c === DASH) dashes.push(i);
      i += 1;
    }
    return { dashes, lone: false, open: false };
  };
  // A template's text, fresh after its opening backtick or resumed after a `${...}`.
  const template = (fresh) => {
    const t = body("`");
    if (t.open) templates.push(depth);
    if (!(fresh && t.lone)) t.dashes.forEach(flag);
    prev = "`";
    word = "";
  };

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "/") { const end = src.indexOf("\n", i); i = end === -1 ? src.length : end; continue; }
    if (c === "/" && next === "*") { const end = src.indexOf("*/", i + 2); i = end === -1 ? src.length : end + 2; continue; }
    if (c === "/" && (BEFORE_REGEX.has(prev) || KEYWORDS_BEFORE_REGEX.has(word))) {
      let inClass = false;
      for (i += 1; i < src.length && src[i] !== "\n"; i += 1) {
        if (src[i] === "\\") i += 1;
        else if (src[i] === "[") inClass = true;
        else if (src[i] === "]") inClass = false;
        else if (src[i] === "/" && !inClass) { i += 1; break; }
      }
      prev = "/";
      word = "";
      continue;
    }
    if (c === '"' || c === "'") {
      i += 1;
      const s = body(c);
      if (!s.lone) s.dashes.forEach(flag);
      prev = c;
      word = "";
      continue;
    }
    if (c === "`") { i += 1; template(true); continue; }
    if (c === "}" && templates.length && templates[templates.length - 1] === depth) {
      templates.pop();
      i += 1;
      template(false);
      continue;
    }
    if (c === "{") depth += 1;
    if (c === "}") depth -= 1;
    if (c === DASH) {
      // Outside comments, strings and patterns an em dash can only be JSX text. It is a placeholder when it is
      // the only text between a tag's `>` and the next `<`; between braces it is punctuation.
      let a = i;
      while (a > 0 && !"<>{}".includes(src[a - 1])) a -= 1;
      let b = i + 1;
      while (b < src.length && !"<>{}".includes(src[b])) b += 1;
      if (!(src[a - 1] === ">" && src[b] === "<" && src.slice(a, b).trim() === DASH)) flag(i);
    }
    if (!/\s/.test(c)) {
      word = IDENT.test(c) ? (IDENT.test(prev) ? word + c : c) : "";
      prev = c;
    }
    i += 1;
  }
  return hits.sort((x, y) => x.line - y.line);
}

/** Every hit in the .ts and .tsx files under a directory, as [{ file, line, text }]. */
export function checkDir(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !/\.tsx?$/.test(entry.name) || entry.name.endsWith(".d.ts")) continue;
    const file = join(entry.parentPath ?? entry.path, entry.name);
    for (const h of emDashes(readFileSync(file, "utf8"))) out.push({ file, ...h });
  }
  return out.sort((x, y) => x.file.localeCompare(y.file) || x.line - y.line);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const src = join(fileURLToPath(import.meta.url), "..", "..", "src");
  const hits = checkDir(src);
  for (const h of hits) console.log(`${relative(process.cwd(), h.file)}:${h.line}: ${h.text}`);
  console.log(hits.length ? `design-check: ${hits.length} em dash(es) in text a person reads` : "design-check: PASS, no em dash in text a person reads");
  process.exit(hits.length ? 1 : 0);
}
