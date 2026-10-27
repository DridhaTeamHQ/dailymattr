import { slugify } from "@/lib/slug";

/* Every story and trending topic has its own page, with URLs in the same
 * shape as the /news articles — the headline slug, then the id the page
 * resolves on — built by the same slugify, so links match byte for byte:
 *   /news-studio/<headline-slug>-<id>
 *   /news-studio/topic/<title-slug>-<id>
 * Shared by the pages, the server SEO and the proxy (src/lib/studio/proxy.ts),
 * which 301s any other spelling to these. */

export const BASE = "/news-studio";
export const FEED_PATH = `${BASE}/`;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const SLUG_ID = new RegExp(`^(?:([a-z0-9-]*)-)?(${UUID})$`);

/* "<slug>-<uuid>" -> { slug, id }; null when there is no id at the end */
export function parseSlugId(segment: unknown): { slug: string; id: string } | null {
  const m = SLUG_ID.exec(String(segment || ""));
  return m ? { slug: m[1] || "", id: m[2] } : null;
}

/* `topic` keeps "Up next" inside that topic's timeline when the story was
 * opened from it; it is not part of the canonical URL. */
export function storyPath(item: { headline: string; id: string }, { topic }: { topic?: string | null } = {}): string {
  const path = `${BASE}/${slugify(item.headline)}-${item.id}`;
  return topic ? `${path}?topic=${encodeURIComponent(topic)}` : path;
}

export function topicPath(topic: { title: string; id: string }): string {
  return `${BASE}/topic/${slugify(topic.title)}-${topic.id}`;
}
