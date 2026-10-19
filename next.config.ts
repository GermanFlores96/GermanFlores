import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

// Everything (scripts, fonts, images, clips) is served from this origin. Scripts keep 'unsafe-inline' because the
// pages are prerendered and Next inlines its bootstrap; nonces would force a server render on every visit. Clips
// play from blob: URLs (they are downloaded whole, see the tour and the engine). Dev adds eval and the HMR socket.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

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
  // Identifies this deployment. On Vercel it is the git commit; locally the version check does nothing.
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  },
  // Flight clips and posters never change in place: a new version goes to a new folder (MEDIA in
  // src/content/shared.ts), so browsers and the CDN can keep them for a year without revalidating.
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/vid/:version/:file*", headers: immutable },
      { source: "/img/:version/scenes/:file*", headers: immutable },
      // The version endpoint is what open tabs ask to learn whether a newer deployment exists: never cached.
      { source: "/version", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] },
    ];
  },
};

export default nextConfig;
