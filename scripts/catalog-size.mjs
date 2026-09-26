#!/usr/bin/env node
// catalog-size.mjs — catalog.json's size against GitHub's limits, before GitHub refuses the push
// (docs/CATALOG-SIZE.md). GitHub warns above 50 MB and refuses a file over 100 MB, counting 1 MB as
// 1,048,576 bytes, so this does too. Warns at 80 MB, fails (exit 1) at 95 MB. Run by CI and the nightly.
//
//   node scripts/catalog-size.mjs [file]
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WARN_MB = 80, FAIL_MB = 95;
const file = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), "..", "catalog.json");
const mb = statSync(file).size / 1048576;
const size = `catalog.json is ${mb.toFixed(2)} MB`;
if (mb >= FAIL_MB) {
  console.log(`::error::${size}, over the ${FAIL_MB} MB stop; GitHub refuses it at 100 MB. See docs/CATALOG-SIZE.md.`);
  process.exit(1);
}
if (mb >= WARN_MB) console.log(`::warning::${size}, past the ${WARN_MB} MB warning; act on docs/CATALOG-SIZE.md before ${FAIL_MB} MB.`);
else console.log(`${size} (warns at ${WARN_MB} MB, fails at ${FAIL_MB} MB)`);
