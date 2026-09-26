// The one place the site reads the catalog file (docs/CATALOG-SIZE.md, CP138 T24).
//
// `pnpm prebuild` (scripts/copy-data.mjs) vendors catalog.json.gz into web/ (~7 MB instead of ~53 MB),
// and next.config.mjs traces that file into every function that reads it. In local dev before prebuild,
// the repository root's catalog.json.gz or catalog.json is used instead.
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

/**
 * The catalog's JSON text: catalog.json.gz, unless a plain catalog.json beside it is newer (the .gz is
 * gitignored, so a pull can leave an old one), here or one level up.
 */
export function readCatalogText(): string {
  for (const dir of [process.cwd(), join(process.cwd(), "..")]) {
    const gz = join(dir, "catalog.json.gz");
    const plain = join(dir, "catalog.json");
    const hasGz = existsSync(gz);
    const hasPlain = existsSync(plain);
    if (hasGz && (!hasPlain || statSync(gz).mtimeMs >= statSync(plain).mtimeMs)) {
      return gunzipSync(readFileSync(gz)).toString("utf-8");
    }
    if (hasPlain) return readFileSync(plain, "utf-8");
  }
  throw new Error(`catalog.json(.gz) not found in ${process.cwd()} or its parent`);
}
