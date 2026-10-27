import { FeedPage, feedMetadata } from "@/components/news/feed-page";
import { feedQuery } from "@/lib/news/loaders";

/* /news/page/N/ — the "Latest" feed, page 2 onwards (the proxy redirects
 * page 1, zero-padded numbers and a missing trailing slash). A page past the
 * end is a 404. Rendered on first request, then every two minutes. */
export const revalidate = 120;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props) {
  return feedMetadata(feedQuery(await params));
}

export default async function LatestNewsPage({ params }: Props) {
  return <FeedPage query={feedQuery(await params)} />;
}
