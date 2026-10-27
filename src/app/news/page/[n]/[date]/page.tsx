import { FeedPage, feedMetadata } from "@/components/news/feed-page";
import { feedQuery } from "@/lib/news/loaders";

/* /news/?date=YYYY-MM-DD and /news/page/N/?date=… — the proxy rewrites a
 * valid date onto this route, so the filter never stops the unfiltered pages
 * from being cached. Filtered pages are noindex and, as before, rendered per
 * request and never cached. Requested directly, this path is a 404. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ n: string; date: string }> };

export async function generateMetadata({ params }: Props) {
  return feedMetadata(feedQuery(await params));
}

export default async function LatestNewsOnDay({ params }: Props) {
  return <FeedPage query={feedQuery(await params)} />;
}
