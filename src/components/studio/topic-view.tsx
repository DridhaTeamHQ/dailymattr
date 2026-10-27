"use client";

import { useEffect, useState } from "react";
import { fetchArticlesByIds, fetchTopicById, newestFirst } from "@/lib/studio/content";
import { FEED_PATH } from "@/lib/studio/routes";
import { browserDb } from "@/lib/studio/supabase";
import type { Story, TopicInitial, TrendingTopic } from "@/lib/studio/types";
import { StudioNav } from "./nav";
import { NotFoundView } from "./not-found-view";
import { NowProvider } from "./now";
import { useStudioBack } from "./shell";
import { TopicTimeline } from "./topic-timeline";

/* /news-studio/topic/<title-slug>-<id> — one page per trending topic's
 * timeline. The server renders the topic and its stories; once the page is
 * up they are fetched again, as the app always did, so a cached page picks
 * up reports filed since it was rendered. */
export function TopicView({ id, initial, footer }: { id: string; initial: TopicInitial; footer: React.ReactNode }) {
  const back = useStudioBack();
  /* undefined = loading, null = no such (approved) topic */
  const [topic, setTopic] = useState<TrendingTopic | null | undefined>(initial.topic ?? undefined);
  const [members, setMembers] = useState<Story[] | null>(initial.topic ? initial.members : null);

  useEffect(() => {
    let alive = true;
    const db = browserDb();
    fetchTopicById(db, id)
      .then(async (found) => {
        if (!alive) return;
        if (!found) {
          setTopic(null);
          return;
        }
        setTopic((prev) => (prev && JSON.stringify(prev) === JSON.stringify(found) ? prev : found));
        const rows = (await fetchArticlesByIds(db, found.memberIds)).sort(newestFirst);
        if (alive) setMembers((prev) => (prev && JSON.stringify(prev) === JSON.stringify(rows) ? prev : rows));
      })
      .catch(() => {
        /* keep what the server rendered; with nothing to show, end the skeleton */
        if (alive) setMembers((prev) => prev ?? []);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (topic === null) return <NotFoundView footer={footer} />;

  return (
    <NowProvider now={initial.now}>
      <div className="min-h-screen bg-[#FAFBFD] font-bevietnam text-lm-800">
        <StudioNav />
        {topic ? <TopicTimeline topic={topic} members={members} onClose={() => back(FEED_PATH)} /> : <div className="min-h-screen pt-[70px]" aria-hidden="true" />}
        {footer}
      </div>
    </NowProvider>
  );
}
