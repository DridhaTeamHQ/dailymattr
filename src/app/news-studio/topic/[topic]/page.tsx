import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { TopicView } from "@/components/studio/topic-view";
import { FEED_PATH, parseSlugId } from "@/lib/studio/routes";
import { fetchTopic, NOT_FOUND, topicInitial, topicPage } from "@/lib/studio/server";

/* rendered on first request, then cached for an hour (CACHE.article). The
 * proxy has already sent any non-canonical spelling to the canonical. */
export const revalidate = 3600;
export function generateStaticParams(): { topic: string }[] {
  return [];
}

type Props = { params: Promise<{ topic: string }> };

const lookup = cache(async (segment: string) => {
  const parsed = parseSlugId(segment);
  return parsed ? fetchTopic(parsed.id) : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = await lookup((await params).topic);
  return topic ? topicPage(topic).metadata : NOT_FOUND;
}

export default async function TopicPage({ params }: Props) {
  const segment = (await params).topic;
  const parsed = parseSlugId(segment);
  if (!parsed) permanentRedirect(FEED_PATH);
  const [topic, initial] = await Promise.all([lookup(segment), topicInitial(parsed.id)]);
  if (!topic) notFound();
  const { jsonLd } = topicPage(topic);
  return (
    <>
      <JsonLd data={jsonLd} />
      <TopicView id={parsed.id} initial={initial} footer={<SiteFooter />} />
    </>
  );
}
