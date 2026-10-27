/* Redirects, rewrites and headers carried over from the Vite site's
 * vercel.json, plus the routing the old serverless adapters did by hand. */

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const wellKnownJson = [
  { key: "Content-Type", value: "application/json" },
  { key: "Cache-Control", value: "public, max-age=300" },
];

import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* the static pages' canonical URLs end in "/" (/about/) while /news and
   * /news-studio story URLs don't, so neither form is forced: both answer,
   * and the /news router tells them apart itself, as before */
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  /* metadata always in <head>: per-request pages (the /news date filters)
   * would otherwise stream it into <body>, noindex included */
  htmlLimitedBots: /.*/,
  turbopack: { root: path.resolve(".") },

  async redirects() {
    return [
      {
        source: "/:path((?!\\.well-known/).*)",
        has: [{ type: "host", value: "dailymattr.com" }],
        destination: "https://www.dailymattr.com/:path",
        permanent: false,
      },
      { source: "/index.html", destination: "/", statusCode: 301 },
      {
        source: "/tamada-media",
        destination: "https://play.google.com/store/apps/details?id=com.dailymattr&utm_source=linkedin&utm_medium=social&utm_campaign=tamada_media",
        permanent: false,
      },
      /* News Studio: one URL per page, as studio.js did — a trailing slash
       * on a story or topic goes to the canonical, and any path the app has
       * no page for goes to the feed (the drawer URLs answer either way) */
      { source: "/news-studio/topic", destination: "/news-studio/", statusCode: 301 },
      { source: "/news-studio/topic/", destination: "/news-studio/", statusCode: 301 },
      { source: "/news-studio/topic/:path([^/]+)/", destination: "/news-studio/topic/:path", statusCode: 301 },
      { source: "/news-studio/topic/:a/:rest+", destination: "/news-studio/", statusCode: 301 },
      {
        source: "/news-studio/:path((?!(?:sitemap|subscribe/|login/|profile/|topic/))[^/]+)/",
        destination: "/news-studio/:path",
        statusCode: 301,
      },
      { source: "/news-studio/:a((?!topic/)[^/]+)/:rest+", destination: "/news-studio/", statusCode: 301 },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: "/news-studio/:file(sitemap[^/]*\\.xml)", destination: "/studio-sitemaps/:file" },
      ],
      afterFiles: [
        { source: "/s/dev/:shareId", destination: "https://api.dailymattr.com/s/:shareId" },
        { source: "/s/:shareId", destination: "https://public.dailymattr.com/s/:shareId" },
      ],
    };
  },

  async headers() {
    return [
      { source: "/.well-known/apple-app-site-association", headers: wellKnownJson },
      { source: "/.well-known/assetlinks.json", headers: wellKnownJson },
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/assets/:file*\\.:ext(png|jpg|jpeg|webp|svg|glb|ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/:file(robots\\.txt|sitemap-pages\\.xml|favicon\\.ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" }],
      },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
