/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to site/ (not an inferred parent). Multiple
  // lockfiles exist above this dir; without this Next guesses the wrong root
  // and the tracing-includes globs below silently miss.
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  // `pnpm prebuild` vendors catalog.json + brain/ INTO site/ (see
  // scripts/copy-data.mjs). The detail route renders the long tail on-demand
  // (ISR), so its serverless function must ship the catalog + every brain body
  // it might read. Force-trace them into that function. Glob is relative to the
  // project root (site/).
  outputFileTracingIncludes: {
    "/e/[type]/[slug]": ["./catalog.json", "./brain/**/*"],
    // The ranking routes read the vendored catalog + import the vendored engine at runtime — trace
    // both into each serverless function so they ship on Vercel (dev reads them off disk directly).
    "/api/rank": ["./catalog.json", "./lib/rank.mjs"],
    "/api/rank.csv": ["./catalog.json", "./lib/rank.mjs"],
  },
};

export default nextConfig;
