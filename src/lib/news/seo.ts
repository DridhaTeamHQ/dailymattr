import type { Metadata } from "next";
import { categoryById, hubPath, type Category } from "@/lib/categories";
import { safeUrl } from "@/lib/html";
import { breadcrumbLd, publisher, website, type Crumb } from "@/lib/schema";
import { AUTHOR, OG_DEFAULT, ORIGIN, PAGE_SIZE, SITE_NAME } from "@/lib/site";
import { articlePath, cleanHeadline } from "@/lib/slug";
import { bullets, metaDescription, modifiedAt, truncateAtWord } from "@/lib/text";
import { ERROR_DESCRIPTION, ERROR_ROBOTS, ERROR_TITLES } from "./errors";
import { artworkFor, ogImageFor, posterFor, slidesFor, type Slide } from "./media";
import type { PixPost } from "./types";

/* Everything the /news <head> carried, as Next metadata plus the JSON-LD
 * graphs (rendered with <JsonLd>). Strings and object key order follow the
 * hand-rolled renderer exactly, so the payload is unchanged. */

const ARTICLE_ROBOTS = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
const HUB_ROBOTS = "index,follow,max-image-preview:large";
const NOINDEX = ERROR_ROBOTS;

/* trail for an article: Home > News > Section > Headline (section skipped
 * when the post's category_id isn't one we publish a hub for) */
export function articleTrail(post: PixPost, title: string): Crumb[] {
  const cat = categoryById(post.category_id);
  return [
    { name: "Home", path: "/" },
    { name: "News", path: "/news/" },
    ...(cat ? [{ name: cat.label, path: hubPath(cat) }] : []),
    { name: truncateAtWord(title, 60), path: articlePath(post) },
  ];
}

export type HeroImage = { url: string; artwork: boolean };

export type ArticleSeo = {
  title: string;
  desc: string;
  url: string;
  slides: Slide[];
  /* what the article page actually shows */
  heroImages: HeroImage[];
  poster: string;
  og: Slide | null;
  points: string[];
  cat: Category | null;
  source: string;
  keywords: unknown[];
  publishedIso: string;
  modifiedIso: string;
  trail: Crumb[];
};

export function articleSeo(post: PixPost): ArticleSeo {
  const title = cleanHeadline(post.headline);
  const points = bullets(post.detail_body);
  const slides = slidesFor(post);
  const artwork = artworkFor(post);
  return {
    title,
    desc: metaDescription(points),
    url: ORIGIN + articlePath(post),
    slides,
    /* the artwork alone; a post without one shows its first card */
    heroImages: artwork ? [{ url: artwork, artwork: true }] : slides.slice(0, 1).map((s) => ({ url: s.url, artwork: false })),
    poster: posterFor(post),
    og: ogImageFor(post),
    points,
    cat: categoryById(post.category_id),
    source: safeUrl(post.source_url),
    /* as stored: JSON-LD carries the values, article:tag their text */
    keywords: Array.isArray(post.keywords) ? (post.keywords as unknown[]).filter(Boolean).slice(0, 10) : [],
    publishedIso: new Date(post.published_at).toISOString(),
    modifiedIso: modifiedAt(post),
    trail: articleTrail(post, title),
  };
}

export function articleMetadata(seo: ArticleSeo): Metadata {
  const { title, desc, url, og, poster, cat, keywords } = seo;
  return {
    /* brand suffix on the <title> tag only — og:title, twitter:title,
     * JSON-LD and the <h1> keep the bare headline */
    title: { absolute: `${title} | ${SITE_NAME}` },
    description: desc || undefined,
    alternates: { canonical: url },
    robots: ARTICLE_ROBOTS,
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_IN",
      title: title || undefined,
      description: desc || undefined,
      url,
      /* the dimension tags only when the rendered size is known */
      images: og ? [{ url: og.url, ...(og.width ? { width: og.width, height: og.height } : {}), alt: title }] : undefined,
      publishedTime: seo.publishedIso,
      modifiedTime: seo.modifiedIso,
      section: cat?.label,
      tags: keywords.length ? keywords.map(String) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title || undefined,
      description: desc || undefined,
      /* set explicitly: Next would otherwise copy og:image (the resized
       * poster) here, where the original carried the poster as stored */
      images: poster ? [{ url: poster, alt: title }] : undefined,
    },
  };
}

export function articleJsonLd(seo: ArticleSeo) {
  const { title, desc, url, heroImages, slides, cat, keywords, source } = seo;
  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: truncateAtWord(title, 110),
    description: desc,
    /* the bullets are the article — same text the reader sees */
    articleBody: seo.points.join("\n"),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: seo.publishedIso,
    dateModified: seo.modifiedIso,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    /* the picture on the page first, then the rendered cards */
    image: [...new Set([...heroImages.map((h) => h.url), ...slides.map((s) => s.url)])],
    publisher,
    /* the desk, not the individual writer — user_name is an internal CMS
     * login and is not shown on the page either. Same name and page as the
     * visible byline. */
    author: { "@type": "Organization", name: AUTHOR.name, url: ORIGIN + AUTHOR.path },
    ...(cat ? { articleSection: cat.label } : {}),
    ...(keywords.length ? { keywords } : {}),
    /* we summarise someone else's reporting — say so in the markup */
    ...(source ? { isBasedOn: source, citation: source } : {}),
  };
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      website,
      {
        "@type": "WebPage", "@id": url, url, name: title, description: desc,
        inLanguage: "en-IN", isPartOf: { "@id": website["@id"] },
        mainEntity: { "@id": ld["@id"] }, publisher: { "@id": publisher["@id"] },
      },
    ],
  };
  return [graph, ld, breadcrumbLd(seo.trail)];
}

/* ---------- feed and hubs ---------- */

export type HubHead = {
  title: string;
  description: string;
  /* the hub's own path, e.g. /news/ or /news/india/ */
  path: string;
  posts: PixPost[];
  page: number;
  hasNext: boolean;
  trail: Crumb[];
  date: string | null;
};

const hubUrls = ({ path, page, hasNext, date }: HubHead) => {
  const url = ORIGIN + path;
  const canonical = page > 1 ? `${url}page/${page}/` : url;
  /* prev/next follow the same filtered series the on-page pager links to */
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return {
    canonical,
    prev: page > 1 ? `${page === 2 ? url : `${url}page/${page - 1}/`}${qs}` : undefined,
    next: hasNext ? `${url}page/${page + 1}/${qs}` : undefined,
  };
};

export function hubMetadata(head: HubHead): Metadata {
  const { title, description, date } = head;
  const { canonical, prev, next } = hubUrls(head);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: date ? NOINDEX : HUB_ROBOTS,
    pagination: { previous: prev, next },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images: [{ url: OG_DEFAULT.url }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_DEFAULT.url],
    },
  };
}

export function hubJsonLd(head: HubHead) {
  const { title, description, posts, page } = head;
  const { canonical } = hubUrls(head);
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonical,
    name: title,
    description,
    url: canonical,
    inLanguage: "en-IN",
    isPartOf: { "@id": `${ORIGIN}/#website` },
    publisher,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: (page - 1) * PAGE_SIZE + i + 1,
        url: ORIGIN + articlePath(p),
        name: cleanHeadline(p.headline),
      })),
    },
  };
  return [{ "@context": "https://schema.org", ...website }, ld, breadcrumbLd(head.trail)];
}

/* ---------- error pages ---------- */

export function errorMetadata(status: keyof typeof ERROR_TITLES): Metadata {
  return { title: { absolute: ERROR_TITLES[status] }, description: ERROR_DESCRIPTION, robots: ERROR_ROBOTS };
}
