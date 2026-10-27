import type { Metadata } from "next";
import { HEADS, type PageKey } from "./page-heads";

/* SVG first: modern browsers pick it and render the mark sharp at any tab
 * size; the PNG is the fallback */
export const SITE_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/favicon.ico", sizes: "32x32" },
    { url: "/assets/favicon.svg?v=3", type: "image/svg+xml" },
    { url: "/assets/favicon.png?v=3", type: "image/png" },
  ],
  apple: "/assets/apple-touch-icon.png?v=3",
};

/* Next metadata for a marketing page, built from the exact strings its
 * original <head> carried (page-heads.ts) */
export function pageMetadata(key: PageKey): Metadata {
  const { title, meta: m, property: p, canonical } = HEADS[key];
  return {
    title,
    ...(m.description ? { description: m.description } : {}),
    ...(m.robots ? { robots: m.robots } : {}),
    ...(m.referrer ? { referrer: m.referrer as Metadata["referrer"] } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    ...(p["og:title"]
      ? {
          openGraph: {
            type: p["og:type"] as "website" | "profile",
            siteName: p["og:site_name"],
            title: p["og:title"],
            description: p["og:description"],
            url: p["og:url"],
            images: [{ url: p["og:image"], width: Number(p["og:image:width"]), height: Number(p["og:image:height"]) }],
          },
        }
      : {}),
    ...(m["twitter:card"]
      ? {
          twitter: {
            card: m["twitter:card"] as "summary_large_image",
            title: m["twitter:title"],
            description: m["twitter:description"],
            images: [m["twitter:image"]],
          },
        }
      : {}),
    icons: SITE_ICONS,
  };
}
