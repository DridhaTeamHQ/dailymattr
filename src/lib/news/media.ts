import { IMAGE_HOSTS, IMAGE_WIDTHS, MEDIA_CDN, MEDIA_ORIGIN, SLIDE_H, SLIDE_W } from "@/lib/site";
import type { PixPost } from "./types";

export type Slide = { url: string; width: number; height: number };

/* The resized src/srcset pair for an <img> (and for latest.json, which keeps
 * the lowercase `srcset` key the homepage script reads). */
export type ImgAttrs = { src: string; srcset: string };

type CardSource = Pick<PixPost, "main_image_url" | "web_pages" | "media_pages">;

/* An image URL from the database is used only if it is https on a host we
 * control; anything else is dropped rather than rendered. Carousel pages
 * recorded against the private S3 bucket are re-pointed at PIX_MEDIA_CDN
 * when one is configured. */
export function allowedImage(u: unknown): string {
  try {
    const url = new URL(String(u));
    if (url.protocol !== "https:") return "";
    if (url.hostname === MEDIA_ORIGIN && MEDIA_CDN) url.hostname = MEDIA_CDN;
    return IMAGE_HOSTS.has(url.hostname) ? url.href : "";
  } catch {
    return "";
  }
}

/* Supabase storage can resize and re-encode on the fly. Swapping
 * /object/public/ for /render/image/public/ returns WebP when the browser
 * asks for it, which turns a 2.7 MB PNG poster into ~50 KB. */
export function sized(url: string, width: number, quality = 72): string {
  if (!url) return "";
  const rendered = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  if (rendered === url) return url; // not a Supabase object URL
  /* resize=contain is required: the default (cover) keeps the source height
   * and only changes the width, which stretches the image — a 1024x1536
   * poster comes back as 480x1536 without it. */
  return `${rendered}?width=${width}&resize=contain&quality=${quality}`;
}

export const srcSet = (url: string, widths: number[]) => widths.map((w) => `${sized(url, w)} ${w}w`).join(", ");

type PageRecord = { url?: unknown; width?: unknown; height?: unknown; sort_order?: unknown };

const records = (pages: unknown): PageRecord[] =>
  Array.isArray(pages) ? pages.filter((p): p is PageRecord => typeof p === "object" && p !== null) : [];

const order = (p: PageRecord) => (typeof p.sort_order === "number" ? p.sort_order : Number(p.sort_order ?? 0) || 0);

const toSlides = (pages: unknown): Slide[] =>
  records(pages)
    .slice()
    .sort((a, b) => order(a) - order(b))
    .map((p) => ({
      url: allowedImage(p.url),
      width: Number(p.width) || SLIDE_W,
      height: Number(p.height) || SLIDE_H,
    }))
    .filter((s) => s.url);

/* The carousel, in order of preference:
 *   1. web_pages   — the rendered cards the CMS copies to the public Supabase
 *                    bucket when QA publishes (poster + text slides)
 *   2. media_pages — the same cards on the app backend's private S3; only
 *                    usable once PIX_MEDIA_CDN names a public host for them
 *   3. the bare background artwork the card was built on — the one image
 *                    every post has had from the start
 * Posts published before the CMS learned to copy its cards only have (3); the
 * bullet text below carries what their text slide says, so nothing is lost
 * for a reader or a crawler. */
export function slidesFor(post: CardSource): Slide[] {
  const fromWeb = toSlides(post.web_pages);
  if (fromWeb.length) return fromWeb;
  const fromApp = toSlides(post.media_pages);
  if (fromApp.length) return fromApp;
  const poster = allowedImage(post.main_image_url);
  return poster ? [{ url: poster, width: SLIDE_W, height: SLIDE_H }] : [];
}

/* The story's artwork: the picture the card was built on, without the
 * headline, date or logo baked in. This is what the article page and the
 * grid show — the words are already on the page as text, so a card that
 * repeats them is the same story twice. */
export const artworkFor = (post: CardSource) => allowedImage(post.main_image_url) || slidesFor(post)[0]?.url || "";

/* Poster for og:image: the rendered first card when it is reachable — a
 * headline baked into the picture is exactly what a WhatsApp or X preview
 * wants — otherwise the artwork. */
export const posterFor = (post: CardSource) => slidesFor(post)[0]?.url || allowedImage(post.main_image_url) || "";

/* The poster at share size for og:image. The resizer never upscales, so the
 * rendered size is only known when the source size is: the CMS records it
 * for the cards, not for the bare artwork — then width/height are 0 and the
 * caller leaves the dimension tags out rather than guess. */
export function ogImageFor(post: CardSource, max = 1200): Slide | null {
  const url = posterFor(post);
  if (!url) return null;
  const pages = [...records(post.web_pages), ...records(post.media_pages)];
  const src = pages.find((p) => allowedImage(p.url) === url && Number(p.width) > 0 && Number(p.height) > 0);
  if (!src) return { url: sized(url, max), width: 0, height: 0 };
  const srcW = Number(src.width);
  const srcH = Number(src.height);
  const w = Math.min(max, srcW);
  const out = sized(url, w);
  /* not a Supabase object: served as-is at its own size */
  if (out === url) return { url, width: srcW, height: srcH };
  return { url: out, width: w, height: Math.round((srcH * w) / srcW) };
}

export const thumbAttrs = (url: string): ImgAttrs => ({
  src: sized(url, IMAGE_WIDTHS.thumb[0]),
  srcset: srcSet(url, IMAGE_WIDTHS.thumb),
});

export const slideAttrs = (url: string): ImgAttrs => ({
  src: sized(url, IMAGE_WIDTHS.slide[0]),
  srcset: srcSet(url, IMAGE_WIDTHS.slide),
});

/* the <img sizes> of the grid thumbs and the article hero */
export const THUMB_SIZES = "(max-width: 640px) 90vw, 260px";
export const SLIDE_SIZES = "(max-width: 860px) 86vw, 420px";
