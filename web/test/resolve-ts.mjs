// Test-only module hook: resolve the site's imports the way its bundler does, so node:test can load the
// TypeScript modules as they are: "@/lib/x" becomes web/src/lib/x.ts and "./format" becomes "./format.ts".
const SRC = new URL("../src/", import.meta.url);

export async function resolve(specifier, context, next) {
  const s = specifier.startsWith("@/") ? new URL(specifier.slice(2), SRC).href : specifier;
  const local = s.startsWith(".") || s.startsWith("file:");
  return next(local && !/\.[cm]?[jt]sx?$/.test(s) ? `${s}.ts` : s, context);
}
