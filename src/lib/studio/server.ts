/* Server side of the News Studio pages (/news-studio/*): metadata, JSON-LD
 * and the server-rendered UI state, following the /news article rules:
 *   - URL    /news-studio/<headline-slug>-<id>, any other spelling 301s to it
 *   - title  the cleaned headline; H1 the same
 *   - meta description, canonical, Open Graph, Twitter, NewsArticle JSON-LD,
 *     breadcrumb
 * SEO data comes from seo-data.ts (shared with the proxy and sitemaps); the
 * UI state from the same content queries the browser runs (content.ts), on a
 * server client. Server only — never import this from a client component. */
import type { Metadata } from "next";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cleanHeadline } from "@/lib/slug";
import { safeUrl } from "@/lib/html";
import { AUTHOR, OG_DEFAULT, ORIGIN, SITE_NAME } from "@/lib/site";
import { breadcrumbLd, publisher, website, type Crumb } from "@/lib/schema";
import { SERVER_SUPABASE_ANON_KEY, SERVER_SUPABASE_URL } from "./config";
import { fetchApprovedPage, fetchArticlesByIds, fetchTopicById, fetchTrendingTopics, newestFirst } from "./content";
import { dedupeStories } from "./dedupe";
import { FEED_PATH, storyPath } from "./routes";
import { FEED_SEO, storySeo, topicSeo } from "./seo";
import { fetchLatest, imageOf, iso, type SeoStory, type SeoTopic } from "./seo-data";
import type { FeedInitial, Story, StoryInitial, TopicInitial } from "./types";

export { fetchStory, fetchTopic } from "./seo-data";

/* ---------- metadata + JSON-LD ---------- */

const TOPIC_LABEL: Record<string, string> = { India: "National", World: "International", Technology: "Tech" };
const ROBOTS = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

type ArticleOg = { publishedTime?: string; modifiedTime?: string; section?: string };

function baseMeta({
  title,
  pageTitle = title,
  description,
  url,
  image,
  article,
}: {
  title: string;
  pageTitle?: string;
  description: string;
  url: string;
  image?: string;
  /* Open Graph type "article" when present, "website" otherwise */
  article?: ArticleOg;
}): Metadata {
  const images = [
    image ? { url: image, alt: title } : { url: OG_DEFAULT.url, width: OG_DEFAULT.width, height: OG_DEFAULT.height, alt: title },
  ];
  const og = { siteName: SITE_NAME, locale: "en_IN", title, description, url, images };
  return {
    title: pageTitle,
    description,
    alternates: { canonical: url },
    robots: ROBOTS,
    openGraph: article ? { type: "article", ...og, ...article } : { type: "website", ...og },
    twitter: { card: "summary_large_image", title, description, images: [image || OG_DEFAULT.url] },
  };
}

const studioCrumb: Crumb = { name: "News Studio", path: FEED_PATH };
const homeCrumb: Crumb = { name: "Home", path: "/" };
const webPage = (url: string, title: string, description: string, extra: Record<string, unknown> = {}) => ({
  "@context": "https://schema.org",
  "@graph": [
    website,
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: title,
      description,
      inLanguage: "en-IN",
      isPartOf: { "@id": website["@id"] },
      publisher: { "@id": publisher["@id"] },
      ...extra,
    },
  ],
});

type LinkedStory = { path: string; headline: string };

const itemList = (stories: LinkedStory[]) => ({
  "@type": "ItemList",
  itemListElement: stories.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: ORIGIN + s.path, name: s.headline })),
});

/* canonical path + cleaned headline */
const linkList = (stories: { id: string; headline: string }[]): LinkedStory[] =>
  stories.map((s) => ({ path: storyPath(s), headline: cleanHeadline(s.headline) }));

export type PageHead = { metadata: Metadata; jsonLd: unknown[] };

export function storyPage(item: SeoStory): PageHead {
  const { title, pageTitle, description, path } = storySeo(item);
  const url = ORIGIN + path;
  const image = imageOf(item.image);
  const source = safeUrl(item.sourceUrl);
  const section = item.topic ? TOPIC_LABEL[item.topic] || item.topic : null;
  const article = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: title.length > 110 ? title.slice(0, 109) + "…" : title,
    description,
    articleBody: item.summary,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: iso(item.publishedAt),
    dateModified: iso(item.modifiedAt),
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    image: [image || OG_DEFAULT.url],
    publisher,
    author: { "@type": "Organization", name: AUTHOR.name, url: ORIGIN + AUTHOR.path },
    ...(section ? { articleSection: section } : {}),
    /* a summary of someone else's reporting — say so in the markup */
    ...(source ? { isBasedOn: source, citation: source } : {}),
  };
  const publishedTime = iso(item.publishedAt);
  const modifiedTime = iso(item.modifiedAt);
  return {
    metadata: baseMeta({
      title,
      pageTitle,
      description,
      url,
      image,
      article: {
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
        ...(section ? { section } : {}),
      },
    }),
    jsonLd: [
      webPage(url, title, description, { mainEntity: { "@id": article["@id"] } }),
      article,
      breadcrumbLd([homeCrumb, studioCrumb, { name: title.length > 60 ? title.slice(0, 59) + "…" : title, path }]),
    ],
  };
}

export function topicPage(topic: SeoTopic): PageHead {
  const { title, pageTitle, description, path } = topicSeo(topic);
  const url = ORIGIN + path;
  const image = imageOf(topic.image);
  const modified = iso(topic.modifiedAt);
  return {
    metadata: baseMeta({ title, pageTitle, description, url, image }),
    jsonLd: [
      webPage(url, title, description, {
        "@type": "CollectionPage",
        ...(modified ? { dateModified: modified } : {}),
        mainEntity: itemList(linkList(topic.stories)),
      }),
      breadcrumbLd([homeCrumb, studioCrumb, { name: title, path }]),
    ],
  };
}

export const feedMetadata = (): Metadata =>
  baseMeta({ title: FEED_SEO.title, description: FEED_SEO.description, url: ORIGIN + FEED_SEO.path });

/* the feed's graph lists the newest stories as an ItemList, so crawlers
 * reach them from /news-studio/; the page still renders if the lookup fails */
export async function feedJsonLd(): Promise<unknown[]> {
  const { title, description, path } = FEED_SEO;
  const url = ORIGIN + path;
  const linked = linkList(await fetchLatest(50).catch(() => []));
  return [
    webPage(url, title, description, { "@type": "CollectionPage", ...(linked.length ? { mainEntity: itemList(linked) } : {}) }),
    breadcrumbLd([homeCrumb, studioCrumb]),
  ];
}

/* drawer-only URLs: the app opens a panel over the feed — never indexed */
export const privateMetadata = (): Metadata => ({
  title: FEED_SEO.title,
  description: FEED_SEO.description,
  robots: "noindex,follow",
});

export const NOT_FOUND: Metadata = {
  title: "Story not found | dailymattr News Studio",
  description: "This link doesn't match any story on dailymattr News Studio.",
};

/* ---------- server-rendered UI state ----------
 * The same queries the browser runs, so the first paint is the real page
 * and the live feed carries on from it. Anything that fails comes back null
 * and the browser loads that part itself, as it always did. */

let db: SupabaseClient | null = null;
const serverDb = () =>
  (db ??= createClient(SERVER_SUPABASE_URL, SERVER_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }));

export async function feedInitial(): Promise<FeedInitial> {
  const [page, topics] = await Promise.all([
    fetchApprovedPage(serverDb(), { slug: "general" }).catch(() => null),
    fetchTrendingTopics(serverDb()),
  ]);
  return { now: Date.now(), page, topics };
}

/* the default reading sequence around a story: the newest page of the feed
 * in front-page order, with the story itself in front when it is older */
export async function storyInitial(id: string): Promise<StoryInitial> {
  let list: Story[] | null = null;
  try {
    const { items } = await fetchApprovedPage(serverDb(), { slug: "general", limit: 60 });
    list = dedupeStories(items.sort(newestFirst));
    if (!list.some((x) => x.id === id)) {
      const [own] = await fetchArticlesByIds(serverDb(), [id]);
      list = own ? [own, ...list] : null;
    }
  } catch {
    list = null;
  }
  return { now: Date.now(), id, list };
}

export async function topicInitial(id: string): Promise<TopicInitial> {
  try {
    const topic = await fetchTopicById(serverDb(), id);
    const members = topic ? (await fetchArticlesByIds(serverDb(), topic.memberIds)).sort(newestFirst) : null;
    return { now: Date.now(), topic, members };
  } catch {
    return { now: Date.now(), topic: null, members: null };
  }
}
