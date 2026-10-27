import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import type { FeedQuery } from "@/lib/news/feed";
import { loadFeed } from "@/lib/news/loaders";
import { hubJsonLd, hubMetadata } from "@/lib/news/seo";
import { HubView } from "./hub-view";

/* What every feed/hub route renders: the four page files only differ in how
 * they read their params and in how they are cached. */

export async function feedMetadata(query: FeedQuery): Promise<Metadata> {
  return hubMetadata(await loadFeed(query));
}

export async function FeedPage({ query }: { query: FeedQuery }) {
  const view = await loadFeed(query);
  return (
    <>
      <JsonLd data={hubJsonLd(view)} />
      <HubView view={view} />
    </>
  );
}
