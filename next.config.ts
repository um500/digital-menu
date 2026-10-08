import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (Next.js 16's new static/dynamic model) is left off on
  // purpose: this app is request-time data end to end (orders, auth, SSE),
  // so there's nothing worth prerendering, and turning it on would mean
  // wrapping every cookies()/headers() read in <Suspense> for no benefit.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
