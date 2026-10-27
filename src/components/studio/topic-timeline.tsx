"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBooted } from "@/lib/studio/boot";
import { storyPath } from "@/lib/studio/routes";
import { dayHeading, favicon, istDayKey, localDate, readTime } from "@/lib/studio/time";
import type { Story, TrendingTopic } from "@/lib/studio/types";
import { FactChip } from "./fact-badge";
import { useClock } from "./now";
import { StudioLink } from "./studio-link";

/* "Trending topic → timeline" page body: a frosted sticky bar with back
 * navigation, the topic banner with its metrics and poster, then a vertical
 * timeline spine with a card grid per day. */
const rb = { fontVariationSettings: '"wdth" 100' };

function TimelineSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-[32px] sm:px-8 sm:py-[48px]" aria-hidden="true">
      {/* hero skeleton */}
      <div className="mb-[48px] rounded-[24px] border border-lm-200 bg-lm-50 p-[24px] sm:p-[36px]">
        <div className="flex flex-col gap-[20px] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-[14px]">
            <div className="skeleton-shimmer h-[24px] w-[160px] rounded-full" />
            <div className="skeleton-shimmer-dark h-[36px] w-11/12 rounded-[8px] sm:h-[44px]" />
            <div className="skeleton-shimmer-dark h-[36px] w-3/4 rounded-[8px] sm:h-[44px]" />
            <div className="skeleton-shimmer h-[18px] w-full rounded-[4px]" />
            <div className="skeleton-shimmer h-[18px] w-4/5 rounded-[4px]" />
            <div className="mt-[8px] flex flex-wrap gap-[10px]">
              <div className="skeleton-shimmer h-[28px] w-[100px] rounded-full" />
              <div className="skeleton-shimmer h-[28px] w-[120px] rounded-full" />
            </div>
          </div>
          <div className="skeleton-shimmer aspect-video w-full max-w-[340px] rounded-[16px]" />
        </div>
      </div>

      {/* day groups skeleton */}
      <div className="relative border-l-2 border-lm-200 pl-[24px] sm:pl-[36px]">
        {[0, 1].map((g) => (
          <div key={g} className="mb-[40px]">
            <div className="mb-[18px] flex items-center gap-[12px]">
              <div className="skeleton-shimmer-dark h-[24px] w-[200px] rounded-[6px]" />
            </div>
            <div className="grid gap-[16px] md:grid-cols-2">
              {[0, 1].map((c) => (
                <div key={c} className="flex flex-col gap-[12px] rounded-[18px] border border-lm-200 bg-white p-[20px]">
                  <div className="skeleton-shimmer aspect-video w-full rounded-[10px]" />
                  <div className="skeleton-shimmer-dark h-[22px] w-full rounded-[5px]" />
                  <div className="skeleton-shimmer-dark h-[22px] w-3/4 rounded-[5px]" />
                  <div className="skeleton-shimmer h-[14px] w-full rounded-[4px]" />
                  <div className="skeleton-shimmer h-[14px] w-5/6 rounded-[4px]" />
                  <div className="mt-[8px] flex items-center justify-between">
                    <div className="skeleton-shimmer h-[14px] w-[90px] rounded-[4px]" />
                    <div className="skeleton-shimmer h-[20px] w-[60px] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* `members` is the topic's stories newest first, or null while loading */
export function TopicTimeline({ topic, members, onClose }: { topic: TrendingTopic; members: Story[] | null; onClose: () => void }) {
  const router = useRouter();
  const booted = useBooted();
  const clock = useClock();
  const list = useMemo(() => members || [], [members]);

  /* the members grouped by IST day */
  const groups = useMemo(() => {
    const now = clock();
    const byDay = new Map<string, Story[]>();
    for (const it of list) {
      if (!it.publishedAt) continue;
      const k = istDayKey(it.publishedAt);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k)!.push(it);
    }
    return [...byDay.entries()].map(([k, arr]) => ({ key: k, ...dayHeading(arr[0].publishedAt, now), items: arr }));
  }, [list, clock]);

  const uniqueOutlets = useMemo(() => {
    const set = new Set(list.map((m) => m.source).filter(Boolean));
    return set.size || topic.sourceCount || 1;
  }, [list, topic]);

  /* "Jul 14 – Jul 16" in the reader's own time zone */
  const dateRange = useMemo(() => {
    if (!list.length) return "";
    const newest = new Date(list[0].publishedAt);
    const oldest = new Date(list[list.length - 1].publishedAt);
    const fmt = (d: Date) => localDate(d, { month: "short", day: "numeric" }, booted);
    if (istDayKey(newest.toISOString()) === istDayKey(oldest.toISOString())) return fmt(newest);
    return `${fmt(oldest)} – ${fmt(newest)}`;
  }, [list, booted]);

  return (
    <div className="flex flex-col bg-[#FAFBFD] pt-[70px]">
      {/* sticky frosted bar — sits under the fixed site nav */}
      <div className="sticky top-[70px] z-30 flex items-center justify-between border-b border-lm-200/80 bg-white/90 px-4 py-[12px] backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-[12px]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to News"
            className="group flex items-center gap-[8px] rounded-full border border-lm-300 bg-white px-[14px] py-[6px] font-roboto text-[13px] font-semibold text-lm-800 transition-all hover:border-lm-800 hover:bg-lm-800 hover:text-white"
            style={rb}
          >
            <span className="text-[16px] transition-transform duration-200 group-hover:-translate-x-[2px]">←</span>
            <span>Back to News</span>
          </button>
        </div>

        {/* centre title */}
        <div className="hidden max-w-[50%] items-center gap-[8px] truncate md:flex">
          <span className="size-[6px] shrink-0 rounded-full bg-[#E33B3B]" />
          <span className="truncate font-roboto text-[13px] font-bold uppercase tracking-[0.08em] text-lm-700" style={rb}>
            {topic.title}
          </span>
          <span className="font-roboto text-[12px] text-lm-400" style={rb}>
            · Timeline
          </span>
        </div>

        {/* balances the Back pill so the title stays centred */}
        <span className="w-[130px]" aria-hidden="true" />
      </div>

      <main className="flex-1 px-4 pb-[100px] pt-[24px] sm:px-8 sm:pt-[36px]">
        <div className="mx-auto w-full max-w-[1120px]">
          {members === null ? (
            <TimelineSkeleton />
          ) : list.length === 0 ? (
            <div className="py-[100px] text-center font-roboto text-[18px] text-lm-500" style={rb}>
              No stories found in this timeline.
            </div>
          ) : (
            <>
              {/* topic banner */}
              <div className="relative mb-[40px] overflow-hidden rounded-[24px] border border-[rgba(28,28,30,0.1)] bg-white p-[24px] shadow-[0px_10px_30px_rgba(0,0,0,0.04)] sm:p-[36px] lg:p-[40px]">
                <div className="flex flex-col-reverse gap-[28px] lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-[16px]">
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <span
                        className="inline-flex items-center gap-[6px] rounded-full bg-[#E33B3B]/10 px-[12px] py-[4px] font-roboto text-[11px] font-bold uppercase tracking-[0.08em] text-[#E33B3B]"
                        style={rb}
                      >
                        <span className="size-[5px] rounded-full bg-[#E33B3B]" />
                        Trending Story Tracker
                      </span>
                      {dateRange && (
                        <span className="rounded-full border border-lm-200 bg-lm-50 px-[12px] py-[4px] font-roboto text-[11px] font-semibold text-lm-600" style={rb}>
                          {dateRange}
                        </span>
                      )}
                    </div>

                    <h1 className="font-roboto text-[28px] font-bold leading-[1.18] tracking-[-0.02em] text-[#0F0F11] sm:text-[36px] lg:text-[40px]" style={rb}>
                      {topic.title}
                    </h1>

                    {topic.description && (
                      <p className="font-roboto text-[16px] leading-[1.6] text-lm-600 sm:text-[18px]" style={rb}>
                        {topic.description}
                      </p>
                    )}

                    <div className="mt-[6px] flex flex-wrap items-center gap-[10px]">
                      <span className="inline-flex items-center gap-[6px] rounded-full bg-black/5 px-[14px] py-[6px] font-roboto text-[12px] font-semibold text-lm-800" style={rb}>
                        <span className="size-[6px] rounded-full bg-lm-800" />
                        {list.length} {list.length === 1 ? "Report" : "Chronological Reports"}
                      </span>
                      <span className="inline-flex items-center gap-[6px] rounded-full bg-black/5 px-[14px] py-[6px] font-roboto text-[12px] font-semibold text-lm-800" style={rb}>
                        <span>📰</span>
                        {uniqueOutlets} {uniqueOutlets === 1 ? "Verified Outlet" : "Verified Outlets"}
                      </span>
                    </div>
                  </div>

                  {/* topic poster */}
                  {topic.image && (
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[18px] bg-lm-100 sm:aspect-[16/10] lg:w-[360px]">
                      <img
                        src={topic.image}
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => {
                          const box = e.currentTarget.parentElement;
                          if (box) box.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t/srgb from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-[12px] left-[14px] font-roboto text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90" style={rb}>
                        Story Timeline Archive
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* timeline */}
              <div className="relative">
                {/* vertical spine */}
                <div className="absolute bottom-0 left-[16px] top-4 w-[2px] bg-linear-to-b/srgb from-lm-800 via-lm-300 to-lm-200 sm:left-[20px]" aria-hidden="true" />

                <div className="flex flex-col gap-[36px] pl-[40px] sm:pl-[56px]">
                  {groups.map((g) => (
                    <section key={g.key} className="relative">
                      {/* day milestone node */}
                      <div className="absolute -left-[40px] top-[4px] flex items-center justify-center sm:-left-[56px]">
                        {g.today ? (
                          <div className="relative flex size-[32px] items-center justify-center rounded-full border-2 border-white bg-lm-800 shadow-md sm:size-[40px]">
                            <span className="absolute size-[8px] animate-ping rounded-full bg-[#f87171] opacity-75" />
                            <span className="size-[8px] rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="flex size-[32px] items-center justify-center rounded-full border-2 border-white bg-white shadow-xs ring-1 ring-lm-300 sm:size-[40px]">
                            <span className="size-[8px] rounded-full bg-lm-600" />
                          </div>
                        )}
                      </div>

                      {/* day header */}
                      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[8px] pt-[6px]">
                        <div className="flex items-center gap-[10px]">
                          <h2 className={`font-roboto text-[16px] font-bold tracking-tight sm:text-[18px] ${g.today ? "text-[#0F0F11]" : "text-lm-600"}`} style={rb}>
                            {g.label}
                          </h2>
                          {g.today && (
                            <span className="rounded-full bg-[#E33B3B] px-[8px] py-[2px] font-roboto text-[10px] font-bold uppercase tracking-[0.08em] text-white" style={rb}>
                              Latest
                            </span>
                          )}
                        </div>
                        <span className="font-roboto text-[12px] font-semibold text-lm-400" style={rb}>
                          {g.items.length} {g.items.length === 1 ? "update" : "updates"}
                        </span>
                      </div>

                      {/* the day's cards */}
                      <div className={`grid gap-[16px] ${g.items.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}>
                        {g.items.map((it) => {
                          const mins = readTime(it.headline, it.body);
                          const ico = favicon(it.sourceUrl);
                          const href = storyPath(it, { topic: topic.id });
                          return (
                            <motion.article
                              key={it.id}
                              onClick={() => router.push(href, { scroll: false })}
                              whileHover={{ y: -3 }}
                              transition={{ duration: 0.2 }}
                              className="group flex cursor-pointer flex-col justify-between rounded-[20px] border border-[rgba(28,28,30,0.1)] bg-white p-[20px] transition-all duration-300 hover:border-lm-800/60 hover:shadow-[0px_12px_32px_rgba(0,0,0,0.08)] sm:p-[24px]"
                            >
                              <div className="flex flex-col gap-[12px]">
                                {it.image && (
                                  <div className="aspect-video w-full overflow-hidden rounded-[12px] bg-lm-100">
                                    <img
                                      src={it.image}
                                      alt=""
                                      loading="lazy"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                )}

                                {/* the headline is a real link too, so every report is reachable without script */}
                                <h3 className="font-roboto text-[19px] font-bold leading-[1.32] text-black transition-colors group-hover:text-lm-800 sm:text-[21px]" style={rb}>
                                  <StudioLink href={href} onClick={(e) => e.stopPropagation()}>
                                    {it.headline}
                                  </StudioLink>
                                </h3>

                                {(it.summary || it.body) && (
                                  <p className="line-clamp-3 font-roboto text-[14px] leading-[22px] text-lm-500 sm:text-[15px] sm:leading-[24px]" style={rb}>
                                    {it.body || it.summary}
                                  </p>
                                )}
                              </div>

                              {/* footer: source, read time, fact badge, read link */}
                              <div className="mt-[20px] flex flex-wrap items-center justify-between gap-[10px] border-t border-lm-100 pt-[14px]">
                                <div className="flex flex-wrap items-center gap-[8px]">
                                  {it.source && (
                                    <div className="flex items-center gap-[6px]">
                                      {ico && <img alt="" src={ico} className="size-[14px] rounded-full" loading="lazy" />}
                                      <span className="font-roboto text-[12px] font-medium text-lm-600" style={rb}>
                                        {it.source}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-[10px] text-lm-300">·</span>
                                  <span className="font-roboto text-[11px] text-lm-400" style={rb}>
                                    {mins} min read
                                  </span>
                                  <FactChip item={it} />
                                </div>

                                <span
                                  className="inline-flex items-center gap-[4px] font-roboto text-[12px] font-semibold text-lm-800 opacity-80 transition-all group-hover:translate-x-[2px] group-hover:opacity-100"
                                  style={rb}
                                >
                                  Read story <span className="text-[14px]">→</span>
                                </span>
                              </div>
                            </motion.article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
