import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { StoryView } from "@/components/studio/story-view";
import { FEED_PATH, parseSlugId } from "@/lib/studio/routes";
import { fetchStory, NOT_FOUND, storyInitial, storyPage } from "@/lib/studio/server";

/* rendered on first request, then cached for an hour (CACHE.article). The
 * proxy (lib/studio/proxy.ts) has already sent any non-canonical spelling
 * to the canonical, so this only ever renders its canonical URL. */
export const revalidate = 3600;
export function generateStaticParams(): { story: string }[] {
  return [];
}

type Props = { params: Promise<{ story: string }> };

const lookup = cache(async (segment: string) => {
  const parsed = parseSlugId(segment);
  return parsed ? fetchStory(parsed.id) : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await lookup((await params).story);
  return story ? storyPage(story).metadata : NOT_FOUND;
}

export default async function StoryPage({ params }: Props) {
  const segment = (await params).story;
  const parsed = parseSlugId(segment);
  if (!parsed) permanentRedirect(FEED_PATH);
  const [story, initial] = await Promise.all([lookup(segment), storyInitial(parsed.id)]);
  if (!story) notFound();
  const { jsonLd } = storyPage(story);
  return (
    <>
      <JsonLd data={jsonLd} />
      <StoryView initial={initial} footer={<SiteFooter />} />
    </>
  );
}
