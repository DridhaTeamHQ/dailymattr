import type { Metadata } from "next";
import { ArticleView } from "@/components/news/article-view";
import { JsonLd } from "@/components/seo/json-ld";
import { loadArticle, loadNeighbours } from "@/lib/news/loaders";
import { articleJsonLd, articleMetadata } from "@/lib/news/seo";

/* /news/<slug>-<published_id> — one story. (A section hub's URL has the same
 * shape; the proxy sends those to [slug]/page/[n].) By the time a request
 * gets here the proxy has answered unknown ids (404), withdrawn stories
 * (410) and stale slugs or a trailing slash (301). Rendered on first
 * request and re-rendered at most hourly (the old s-maxage=3600). */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seo } = await loadArticle((await params).slug);
  return articleMetadata(seo);
}

export default async function Article({ params }: Props) {
  const { post, seo } = await loadArticle((await params).slug);
  const neighbours = await loadNeighbours(post);
  return (
    <>
      <JsonLd data={articleJsonLd(seo)} />
      <ArticleView key={post.id} post={post} seo={seo} neighbours={neighbours} />
    </>
  );
}
