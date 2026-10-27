"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApprovedPage, fetchArticlesByIds, fetchTopicById, newestFirst } from "@/lib/studio/content";
import { dedupeStories } from "@/lib/studio/dedupe";
import { BASE, FEED_PATH, storyPath } from "@/lib/studio/routes";
import { browserDb } from "@/lib/studio/supabase";
import type { Story, StoryInitial } from "@/lib/studio/types";
import { StudioNav } from "./nav";
import { NotFoundView } from "./not-found-view";
import { NowProvider } from "./now";
import { Reader } from "./reader";
import { useStudioBack } from "./shell";

/* /news-studio/<headline-slug>-<id> — one page per story.
 *
 * The reader steps through a SEQUENCE around the story: the topic's
 * timeline when the story was opened from it (?topic=<id>), otherwise the
 * newest page of the feed in front-page order. The server renders the
 * default sequence (`initial.list`); a topic sequence loads in the browser.
 * Sequences are remembered for a few minutes, so stepping from story to
 * story keeps one consistent order (and costs no request). */

type Sequence = { topicId: string | null; forId: string; list: Story[] };

const SEQUENCE_TTL = 10 * 60e3;
const sequences = new Map<string, { list: Story[]; until: number }>();
const cacheKey = (topicId: string | null) => topicId || "";

function remembered(topicId: string | null, id: string): Story[] | null {
  const hit = sequences.get(cacheKey(topicId));
  return hit && hit.until > Date.now() && hit.list.some((x) => x.id === id) ? hit.list : null;
}
function remember(topicId: string | null, list: Story[]) {
  sequences.set(cacheKey(topicId), { list, until: Date.now() + SEQUENCE_TTL });
}

async function loadSequence(topicId: string | null): Promise<Story[]> {
  const db = browserDb();
  if (topicId) {
    const topic = await fetchTopicById(db, topicId).catch(() => null);
    if (topic) return (await fetchArticlesByIds(db, topic.memberIds)).sort(newestFirst);
  }
  const { items } = await fetchApprovedPage(db, { slug: "general", limit: 60 });
  return dedupeStories(items.sort(newestFirst));
}

/* ?topic= read with useSearchParams inside its own Suspense boundary, so
 * the (statically rendered) story page around it still prerenders; reported
 * before paint on in-app navigations */
function TopicParam({ onChange }: { onChange: (topic: string | null) => void }) {
  const topic = useSearchParams().get("topic");
  useLayoutEffect(() => onChange(topic), [topic, onChange]);
  return null;
}

export function StoryView({ initial, footer }: { initial: StoryInitial; footer: React.ReactNode }) {
  const { id } = initial;
  const router = useRouter();
  const back = useStudioBack();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Sequence | null>(() => {
    const list = remembered(null, id) || initial.list;
    return list ? { topicId: null, forId: id, list } : null;
  });

  /* the sequence for the current ?topic=, once it is known; until then the
   * one already on screen keeps the story up (a ?topic= the server could not
   * see loads in the browser) rather than flashing the skeleton */
  const current = loaded && loaded.topicId === topicId ? loaded : null;
  const shown = current || (loaded && loaded.list.some((x) => String(x.id) === id) ? loaded : null);
  const items = shown?.list || null;
  const index = useMemo(() => (items || []).findIndex((x) => String(x.id) === id), [items, id]);

  useEffect(() => {
    if (current && index >= 0) {
      if (!remembered(topicId, id)) remember(topicId, current.list);
      return;
    }
    const cached = remembered(topicId, id);
    if (cached) {
      setLoaded({ topicId, forId: id, list: cached });
      return;
    }
    let alive = true;
    loadSequence(topicId)
      .then(async (list) => {
        /* older stories (outside that page) still get a page */
        if (!list.some((x) => String(x.id) === id)) {
          const [own] = await fetchArticlesByIds(browserDb(), [id]).catch(() => []);
          if (own) list = [own, ...list];
        }
        if (!alive) return;
        remember(topicId, list);
        setLoaded({ topicId, forId: id, list });
      })
      .catch(() => {
        if (alive) setLoaded({ topicId, forId: id, list: [] });
      });
    return () => {
      alive = false;
    };
  }, [topicId, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pathFor = useCallback((story: Story) => storyPath(story, { topic: topicId }), [topicId]);
  /* back returns to wherever the reader came from inside News Studio; a
   * story opened straight from a link goes to the feed (or its topic) */
  const onClose = () => back(topicId ? `${BASE}/topic/${encodeURIComponent(topicId)}` : FEED_PATH);

  const param = (
    <Suspense fallback={null}>
      <TopicParam onChange={setTopicId} />
    </Suspense>
  );

  /* loaded for this id and still not there: unknown or not public */
  if (current && current.forId === id && index < 0) {
    return (
      <>
        {param}
        <NotFoundView footer={footer} />
      </>
    );
  }

  const item = items && index >= 0 ? items[index] : null;
  return (
    <NowProvider now={initial.now}>
      {param}
      <div className="min-h-screen bg-white font-bevietnam text-lm-800">
        <StudioNav />
        {item && items ? (
          <Reader
            items={items}
            index={index}
            onIndex={(next) => router.push(pathFor(items[next]), { scroll: false })}
            onClose={onClose}
            pathFor={pathFor}
          />
        ) : (
          <StorySkeleton />
        )}
        {footer}
      </div>
    </NowProvider>
  );
}

function StorySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 pb-[80px] pt-[120px] sm:px-8 lg:px-12" aria-hidden="true">
      <div className="flex max-w-[860px] flex-col gap-[14px]">
        <div className="skeleton-shimmer h-[14px] w-[120px] rounded-[4px]" />
        <div className="skeleton-shimmer h-[40px] w-full rounded-[8px]" />
        <div className="skeleton-shimmer h-[40px] w-3/4 rounded-[8px]" />
        <div className="skeleton-shimmer h-[14px] w-[260px] rounded-[4px]" />
        <div className="skeleton-shimmer mt-[16px] aspect-video w-full rounded-[16px]" />
      </div>
    </div>
  );
}
