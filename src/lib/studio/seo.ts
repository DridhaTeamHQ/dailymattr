import { cleanHeadline } from "@/lib/slug";
import { FEED_PATH, storyPath, topicPath } from "./routes";

/* SEO text for News Studio pages, following the /news article rules: the
 * title and H1 are the cleaned headline, the meta description is the story
 * text cut at a word near 155 characters. */

/* brand suffix on the <title> tag only, as on /news — og:title,
 * twitter:title, JSON-LD and the H1 keep the bare headline */
const withBrand = (title: string) => `${title} | dailymattr`;

export type PageSeo = { title: string; pageTitle: string; description: string; path: string };

export const FEED_SEO = {
  title: "dailymattr | News Studio",
  description:
    "The day's biggest stories across India, world, business, sports and tech — summarised, fact-checked and grouped by day on dailymattr News Studio.",
  path: FEED_PATH,
} as const;

/* like src/lib/text.ts truncateAtWord, but whitespace runs collapse first
 * (agent summaries carry line breaks) */
export function truncateAtWord(input: unknown, max: number): string {
  const s = String(input || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return (end > max * 0.6 ? cut.slice(0, end) : cut).replace(/[\s,;:\-–—]+$/, "") + "…";
}

export function storySeo(item: { id: string; headline: string; summary?: string | null; body?: string | null }): PageSeo {
  const title = cleanHeadline(item.headline);
  return {
    title,
    pageTitle: withBrand(title),
    description: truncateAtWord(cleanHeadline(item.summary || item.body), 155),
    path: storyPath({ id: item.id, headline: item.headline }),
  };
}

export function topicSeo(topic: { id: string; title: string; description?: string | null }): PageSeo {
  const title = cleanHeadline(topic.title);
  return {
    title,
    pageTitle: withBrand(title),
    description: truncateAtWord(
      cleanHeadline(topic.description) || `${title}: every report on this story, in order, from the outlets covering it.`,
      155,
    ),
    path: topicPath({ id: topic.id, title: topic.title }),
  };
}
