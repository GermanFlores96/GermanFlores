import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Flight clips and posters never change in place: a new version goes to a new folder (MEDIA in
  // src/content/shared.ts), so browsers and the CDN can keep them for a year without revalidating.
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/vid/:version/:file*", headers: immutable },
      { source: "/img/:version/scenes/:file*", headers: immutable },
    ];
  },
};

export default nextConfig;
