import { FeedPage, feedMetadata } from "@/components/news/feed-page";
import { feedQuery } from "@/lib/news/loaders";

/* /news/<category>/?date=YYYY-MM-DD and its later pages, rewritten here by
 * the proxy: noindex, rendered per request and never cached, as before.
 * Requested directly, this path is a 404. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; n: string; date: string }> };

export async function generateMetadata({ params }: Props) {
  return feedMetadata(feedQuery(await params));
}

export default async function SectionHubOnDay({ params }: Props) {
  return <FeedPage query={feedQuery(await params)} />;
}
