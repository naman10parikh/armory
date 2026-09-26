/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to site/ (not an inferred parent). Multiple
  // lockfiles exist above this dir; without this Next guesses the wrong root
  // and the tracing-includes globs below silently miss.
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  // `pnpm prebuild` vendors catalog.json.gz + brain/ INTO site/ (see
  // scripts/copy-data.mjs). The detail route renders the long tail on-demand
  // (ISR), so its serverless function must ship the catalog + every brain body
  // it might read. Force-trace them into that function. Glob is relative to the
  // project root (site/).
  outputFileTracingIncludes: {
    // The home page renders the top-20 ranked rows with the same engine as
    // /formula, so it needs the catalog + the engine traced in as well.
    // Keys match routes as substrings, so "/" reaches every function: changes.json (when each row was
    // listed, mentions gained; scripts/copy-data.mjs) ships beside the catalog wherever rows are read.
    "/": ["./catalog.json.gz", "./lib/rank.mjs", "./changes.json"],
    "/e/[type]/[slug]": ["./catalog.json.gz", "./brain/**/*"],
    // The ranking routes read the vendored catalog + import the vendored engine at runtime — trace
    // both into each serverless function so they ship on Vercel (dev reads them off disk directly).
    "/api/rank": ["./catalog.json.gz", "./lib/rank.mjs"],
    "/api/rank.csv": ["./catalog.json.gz", "./lib/rank.mjs"],
    "/api/search": ["./catalog.json.gz", "./lib/rank.mjs"],
    "/api/ask": ["./catalog.json.gz", "./lib/rank.mjs"],
    // The email + SMS inboxes answer with the same askCatalog pipeline as /api/ask, so their
    // functions need the same two files traced in.
    "/api/inbound/email": ["./catalog.json.gz", "./lib/rank.mjs"],
    "/api/inbound/sms": ["./catalog.json.gz", "./lib/rank.mjs"],
    // /api/stack resolves each pick's live Score from the catalog at request time.
    "/api/stack": ["./catalog.json.gz", "./lib/rank.mjs"],
    // /formula computes every figure it shows from the catalog with the ranking engine, so it needs
    // both traced in too — otherwise the page ships without the data it explains.
    "/formula": ["./catalog.json.gz", "./lib/rank.mjs"],
    // The component pages aggregate the catalog into the 11 canonical harness components with the
    // same engine, so they need the catalog + engine traced in for the same reason as "/".
    "/c": ["./catalog.json.gz", "./lib/rank.mjs"],
    "/c/[component]": ["./catalog.json.gz", "./lib/rank.mjs"],
    "/stack": ["./catalog.json.gz", "./lib/rank.mjs"],
  },
  // The layers page was /graph and called itself Timeline, though it is not a dated history (CP138 T51).
  // It is /pipeline now; the old address and the one its label implied both land there.
  async redirects() {
    return [
      { source: "/graph", destination: "/pipeline", permanent: true },
      { source: "/timeline", destination: "/pipeline", permanent: true },
    ];
  },
};

export default nextConfig;
