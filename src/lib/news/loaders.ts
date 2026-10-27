import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { categoryBySlug, type Category } from "@/lib/categories";
import { PAGE_SIZE } from "@/lib/site";
import { articlePath, isValidId, slugify } from "@/lib/slug";
import { isValidDateStr } from "@/lib/text";
import { feedView, parsePageParam, type FeedQuery, type FeedView } from "./feed";
import { getNeighbours, getPostByPublishedId, listLive } from "./queries";
import { articleSeo, type ArticleSeo } from "./seo";
import type { Neighbours, PixPost } from "./types";

/* Data for the /news pages. generateMetadata and the page both ask, and
 * React's cache() makes that one query per render. notFound() here renders
 * app/news/not-found.tsx with a 404. */

const listPage = cache((page: number, categoryId: number | null, date: string | null) =>
  listLive({ categoryId, page, size: PAGE_SIZE, date }),
);

/* one page of the feed or a hub; a page past the end is a 404 */
export async function loadFeed(query: FeedQuery): Promise<FeedView> {
  const data = await listPage(query.page, query.cat?.id ?? null, query.date);
  if (!data.posts.length && query.page > 1) notFound();
  return feedView(query, data);
}

/* route params -> a feed query, or 404 */
export function feedQuery({ slug, n, date }: { slug?: string; n?: string; date?: string }): FeedQuery {
  let cat: Category | null = null;
  if (slug !== undefined) {
    cat = categoryBySlug(slug);
    if (!cat || cat.slug !== slug) notFound();
  }
  const page = n === undefined ? 1 : parsePageParam(n);
  if (page === null) notFound();
  if (date !== undefined && !isValidDateStr(date)) notFound();
  return { page, cat, date: date ?? null };
}

const postById = cache((id: string) => getPostByPublishedId(id));

export type ArticleData = { post: PixPost; seo: ArticleSeo };

/* /news/<slug>-<published_id>. The proxy has already answered withdrawn
 * stories (410) and stale slugs (301); these checks only matter if a request
 * reaches the page without it. */
export async function loadArticle(param: string): Promise<ArticleData> {
  const m = /^(?:(.*)-)?(\d{1,12})$/.exec(param);
  if (!m || !isValidId(m[2])) notFound();
  const found = await postById(m[2]);
  if (!found || "gone" in found) notFound();
  const { post } = found;
  if ((m[1] || "") !== slugify(post.headline)) permanentRedirect(articlePath(post));
  return { post, seo: articleSeo(post) };
}

export const loadNeighbours = (post: PixPost): Promise<Neighbours> => getNeighbours(post, 3);
