"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchApprovedPage, fetchTrendingTopics, freshTopics } from "@/lib/studio/content";
import { browserDb } from "@/lib/studio/supabase";
import type { FeedInitial, Story } from "@/lib/studio/types";
import { usePagedFeed } from "@/lib/studio/use-paged-feed";
import { useScrolledPast } from "@/lib/studio/use-scrolled-past";
import { CategoryBar, type FeedFilter } from "./category-bar";
import { useDrawer } from "./drawer-context";
import { StudioFaq } from "./faq";
import { FrontPage } from "./front-page";
import { StudioNav } from "./nav";
import { NowProvider } from "./now";
import { TopicRail, TopicRailSkeleton } from "./topic-rail";

/* The News Studio feed (/news-studio/): the broadsheet front page, opening
 * straight on the trending rail, the section toolbar and the stories. The
 * server renders the first page and the rail (`initial`); from there the
 * feed stays live — polling the newest page, infinite-scrolling older ones,
 * filtering by section and searching in the database. */

/* section pills: the scraper's feed topics */
const STUDIO_FILTERS: readonly FeedFilter[] = [
  ["all", "All"],
  ["India", "National"],
  ["World", "International"],
  ["Politics", "Politics"],
  ["Business", "Business"],
  ["Sports", "Sports"],
  ["Technology", "Tech"],
  ["Science", "Science"],
  ["Explained", "Explained"],
];

const byNewest = (a: Story, b: Story) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

export function FeedView({
  initial,
  drawer,
  footer,
}: {
  initial: FeedInitial;
  /* the old /subscribe, /login and /profile pages: the feed with that drawer open */
  drawer?: "subscribe" | "auth";
  footer: React.ReactNode;
}) {
  const { openSubscribe, openAuth } = useDrawer();
  useEffect(() => {
    if (drawer === "subscribe") {
      const cat = new URLSearchParams(window.location.search).get("category");
      openSubscribe(cat ? [cat] : []);
    } else if (drawer === "auth") {
      /* lands on Log in when signed out, on the Account panel when signed in */
      openAuth();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  /* the search runs in the database, so wait for a typing pause */
  const [search, setSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const topic = filter !== "all" ? filter : null;
  const fetchPage = (offset: number) => fetchApprovedPage(browserDb(), { slug: "general", topic, query: search, offset });
  const {
    data: articles,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  } = usePagedFeed(fetchPage, [topic, search], { intervalMs: 30000, initial: initial.page });

  /* newest first */
  const items = useMemo(() => (articles ? [...articles].sort(byNewest) : null), [articles]);

  /* trending topics — refreshed once the page is up, as the app always
   * fetched them on load; never breaks the page (errors give []) */
  const [topics, setTopics] = useState(initial.topics);
  useEffect(() => {
    let alive = true;
    fetchTrendingTopics(browserDb()).then((t) => {
      if (alive) setTopics(t);
    });
    return () => {
      alive = false;
    };
  }, []);

  /* a topic is trending only while it has a story on the feed's freshest
   * day — compared against the UNFILTERED feed (remembered from the last
   * load with no section or search), so a section pill never changes which
   * qualify */
  const [headItems, setHeadItems] = useState<Story[] | null>(initial.page?.items ?? null);
  useEffect(() => {
    if (articles && !topic && !search) setHeadItems(articles);
  }, [articles, topic, search]);
  const visibleTopics = useMemo(() => freshTopics(topics, headItems || []), [topics, headItems]);

  /* once the reader scrolls in, the site nav retracts and the section
   * toolbar takes the top slot — one bar of chrome instead of two */
  const navCollapsed = useScrolledPast(90);

  return (
    <NowProvider now={initial.now}>
      <div className="min-h-screen bg-white font-bevietnam text-lm-800">
        <StudioNav collapsed={navCollapsed} />
        {/* clear the fixed 70px nav */}
        <div className="h-[70px] bg-white" aria-hidden="true" />
        {/* trending topics ride above the section toolbar */}
        <div className="pb-[20px] pt-[10px] sm:pb-[28px] sm:pt-[12px]">
          {loading && visibleTopics.length === 0 ? <TopicRailSkeleton /> : visibleTopics.length > 0 ? <TopicRail topics={visibleTopics} /> : null}
        </div>
        <CategoryBar
          filter={filter}
          onFilter={setFilter}
          filters={STUDIO_FILTERS}
          title="News Studio"
          search={query}
          onSearch={setQuery}
          lifted={navCollapsed}
        />
        <div className="h-[24px] sm:h-[32px]" aria-hidden="true" />
        <FrontPage
          items={items || []}
          loading={loading}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          emptyLabel={
            query.trim()
              ? `No stories match “${query.trim()}”.`
              : filter === "all"
                ? "No stories here yet — check back soon."
                : "No stories in this section right now — check back soon."
          }
        />
        <StudioFaq />
        {footer}
      </div>
    </NowProvider>
  );
}
