/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The catalog and brain markdown live one level up in the monorepo root.
  // Allow Next to trace those files for the standalone build.
  outputFileTracingRoot: new URL("..", import.meta.url).pathname,
};

export default nextConfig;
