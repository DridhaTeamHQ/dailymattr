"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBooted } from "@/lib/studio/boot";
import { breakingScore, FEED_PAGE_SIZE, isBreaking, topicLabel } from "@/lib/studio/content";
import { dedupeStories } from "@/lib/studio/dedupe";
import { storyPath } from "@/lib/studio/routes";
import { dayHeading, istDayKey, timeAgo } from "@/lib/studio/time";
import type { Story } from "@/lib/studio/types";
import { FactChip } from "./fact-badge";
import { FeedTail } from "./feed-tail";
import { availableLenses, ContentSwap, Excerpt, LensPills, type LensId } from "./lenses";
import { useClock, useNow } from "./now";
import { StudioLink } from "./studio-link";

/* News Studio — the image-led front page, styled after a classic
 * broadsheet news front (BBC reference): serif headlines that underline on
 * hover, FLAT borderless cards separated by hairline rules and column
 * gutters, uppercase section kickers under a full-width rule, and "2 hrs
 * ago | Topic" meta lines. Cards without an image degrade to text; broken
 * hotlinks hide themselves. */
const rb = { fontVariationSettings: '"wdth" 100' };
const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = "none";
};

/* meta line: "2 hrs ago | National" + the fact chip as the only colour accent */
function Meta({ item }: { item: Story }) {
  const now = useNow();
  const label = topicLabel(item);
  return (
    <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
      <span className="font-roboto text-[12px] text-lm-500" style={rb}>
        {timeAgo(item.publishedAt, now)}
        {label && <span className="px-[8px] text-lm-300">|</span>}
        {label && <span className="font-medium text-lm-600">{label}</span>}
      </span>
      <FactChip item={item} />
    </div>
  );
}

/* Broadcast lower-third ticker — the day's hottest headlines scroll
 * continuously (the row is rendered twice and translated -50%, so the loop
 * is seamless; keyframes in styles/studio.css); hover pauses. */
function BreakingTicker({ items }: { items: Story[] }) {
  if (!items.length) return null;
  const row = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center">
      {items.map((it) => (
        <StudioLink
          key={`${keyPrefix}-${it.id}`}
          href={storyPath(it)}
          className="flex shrink-0 items-center gap-[10px] px-[22px] font-roboto text-[13px] font-medium text-white/90 transition-colors hover:text-white hover:underline"
          style={rb}
        >
          <span className="size-[4px] shrink-0 rounded-full bg-[#E33B3B]" aria-hidden="true" />
          <span className="whitespace-nowrap">{it.headline}</span>
        </StudioLink>
      ))}
    </div>
  );
  return (
    <div className="relative flex h-[38px] items-stretch overflow-hidden bg-[#0F0F11]">
      {/* fixed BREAKING tab on the left */}
      <span
        className="z-[1] flex shrink-0 items-center gap-[7px] bg-[#E33B3B] px-[14px] font-roboto text-[11px] font-bold uppercase tracking-[0.09em] text-white"
        style={rb}
      >
        <motion.span
          className="size-[6px] rounded-full bg-white"
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        Breaking
      </span>
      {/* marquee: pause on hover */}
      <div className="group flex flex-1 items-center overflow-hidden">
        <div
          className="flex w-max items-center group-hover:[animation-play-state:paused]"
          style={{ animation: `lm-ticker ${Math.max(24, items.length * 9)}s linear infinite` }}
        >
          {row("a")}
          {row("b")}
        </div>
      </div>
      {/* right edge fade so headlines slide out cleanly */}
      <span className="pointer-events-none absolute inset-y-0 right-0 w-[48px] bg-linear-to-l/srgb from-[#0F0F11] to-transparent" aria-hidden="true" />
    </div>
  );
}

/* Shimmer placeholder matching the broadsheet front page (ticker + top
 * stories band + a section front of cards) — shown only while a section or
 * search loads, or if the server could not pre-load the feed. */
function StudioSkeleton() {
  const block = "skeleton-shimmer rounded-[4px]";
  const blockDark = "skeleton-shimmer-dark rounded-[4px]";
  return (
    <>
      {/* ticker skeleton */}
      <div className="relative flex h-[38px] items-stretch overflow-hidden bg-[#0F0F11]" aria-hidden="true">
        <span
          className="z-[1] flex shrink-0 items-center gap-[7px] bg-[#E33B3B] px-[14px] font-roboto text-[11px] font-bold uppercase tracking-[0.09em] text-white"
          style={rb}
        >
          <span className="size-[6px] rounded-full bg-white opacity-60" />
          Breaking
        </span>
        <div className="flex flex-1 items-center gap-[24px] px-[22px]">
          <div className="h-[12px] w-[240px] rounded-[4px] bg-white/20" />
          <div className="hidden h-[12px] w-[200px] rounded-[4px] bg-white/15 md:block" />
          <div className="hidden h-[12px] w-[220px] rounded-[4px] bg-white/10 xl:block" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[44px] px-4 py-[32px] sm:px-8 sm:py-[48px] lg:px-[32px]" aria-hidden="true">
        {/* top-stories band skeleton */}
        <section>
          <div className="mb-[20px] border-t border-lm-800 pt-[10px]">
            <div className={`h-[13px] w-[110px] ${blockDark}`} />
          </div>
          <div className="grid gap-[28px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)_minmax(0,1fr)]">
            {/* lead: first on mobile, centred on desktop, flanked by hairlines */}
            <div className="order-1 flex flex-col gap-[14px] lg:order-2 lg:border-x lg:border-lm-200 lg:px-[28px]">
              <div className={`aspect-video w-full ${block}`} />
              <div className="flex flex-col gap-[8px]">
                <div className={`h-[28px] w-11/12 sm:h-[34px] ${blockDark}`} />
                <div className={`h-[28px] w-4/5 sm:h-[34px] ${blockDark}`} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <div className={`h-[15px] w-full ${block}`} />
                <div className={`h-[15px] w-11/12 ${block}`} />
                <div className={`h-[15px] w-3/4 ${block}`} />
              </div>
              <div className="flex items-center gap-[10px]">
                <div className={`h-[13px] w-[130px] ${block}`} />
                <div className={`h-[18px] w-[60px] rounded-full ${block}`} />
              </div>
            </div>

            {/* left column: prominent story + thumbnail row */}
            <div className="order-2 flex flex-col gap-[20px] lg:order-1 [&>*+*]:border-t [&>*+*]:border-lm-200 [&>*+*]:pt-[20px]">
              <div className="flex flex-col gap-[10px]">
                <div className={`aspect-video w-full ${block}`} />
                <div className="flex flex-col gap-[6px]">
                  <div className={`h-[20px] w-full sm:h-[24px] ${blockDark}`} />
                  <div className={`h-[20px] w-4/5 sm:h-[24px] ${blockDark}`} />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <div className={`h-[13px] w-full ${block}`} />
                  <div className={`h-[13px] w-2/3 ${block}`} />
                </div>
                <div className={`h-[12px] w-[110px] ${block}`} />
              </div>
              <div className="flex gap-[12px]">
                <div className={`h-[76px] w-[114px] shrink-0 ${block}`} />
                <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                  <div className={`h-[17px] w-full ${blockDark}`} />
                  <div className={`h-[17px] w-3/4 ${blockDark}`} />
                  <div className={`mt-[4px] h-[12px] w-[90px] ${block}`} />
                </div>
              </div>
            </div>

            {/* right column: headline rail */}
            <div className="order-3 flex flex-col [&>*+*]:border-t [&>*+*]:border-lm-200">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-[6px] py-[16px] first:pt-0 last:pb-0">
                  <div className={`h-[17px] w-full ${blockDark}`} />
                  <div className={`h-[17px] w-4/5 ${blockDark}`} />
                  <div className={`h-[13px] w-11/12 ${block}`} />
                  <div className={`mt-[2px] h-[12px] w-[100px] ${block}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* section front skeleton */}
        <section>
          <div className="mb-[20px] border-t border-lm-800 pt-[10px]">
            <div className={`h-[13px] w-[180px] ${blockDark}`} />
          </div>

          <div className="mb-[36px]">
            <div className="mb-[16px] flex items-center gap-[12px]">
              <div className="skeleton-shimmer h-[13px] w-[90px] rounded-[3px]" />
              <div className="h-px flex-1 bg-lm-200" />
            </div>
            <div className="grid gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-[10px] border-b border-lm-200 pb-[16px]">
                  <div className={`aspect-video w-full ${block}`} />
                  <div className="flex flex-col gap-[6px]">
                    <div className={`h-[19px] w-full ${blockDark}`} />
                    <div className={`h-[19px] w-4/5 ${blockDark}`} />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <div className={`h-[13px] w-full ${block}`} />
                    <div className={`h-[13px] w-5/6 ${block}`} />
                  </div>
                  <div className="mt-[2px] flex gap-[6px]">
                    <div className={`h-[22px] w-[80px] rounded-full ${block}`} />
                    <div className={`h-[22px] w-[65px] rounded-full ${block}`} />
                  </div>
                  <div className="mt-[4px] flex items-center justify-between">
                    <div className={`h-[12px] w-[90px] ${block}`} />
                    <div className={`h-[12px] w-[60px] ${block}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* uppercase section kicker under a full-width dark rule */
function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`mb-[20px] border-t ${light ? "border-lm-300" : "border-lm-800"} pt-[10px]`}>
      <h2 className={`font-roboto text-[13px] font-bold uppercase tracking-[0.1em] ${light ? "text-lm-500" : "text-[#0F0F11]"}`} style={rb}>
        {children}
      </h2>
    </div>
  );
}

/* big lead story — image, large serif headline, standfirst, meta */
function LeadStory({ item }: { item: Story }) {
  return (
    <StudioLink href={storyPath(item)} className="group flex w-full flex-col gap-[14px] text-left">
      {item.image && (
        <div className="aspect-video w-full overflow-hidden bg-lm-100">
          <img src={item.image} alt="" loading="lazy" onError={hideOnError} className="size-full object-cover" />
        </div>
      )}
      <h2 className="text-[28px] font-bold leading-[1.14] tracking-[-0.01em] text-black group-hover:underline sm:text-[34px]" style={serif}>
        {item.headline}
      </h2>
      <p className="line-clamp-3 font-roboto text-[15px] leading-[24px] text-lm-600" style={rb}>
        {item.body || item.summary}
      </p>
      <Meta item={item} />
    </StudioLink>
  );
}

/* Secondary story — size-stepped so the left column reads 2nd-then-3rd:
 * `prominent` = image-top with a big headline and standfirst; otherwise a
 * compact thumbnail row. Mobile always collapses to the thumbnail row. */
function SideStory({ item, prominent = false }: { item: Story; prominent?: boolean }) {
  if (!prominent) {
    return (
      <StudioLink href={storyPath(item)} className="group flex w-full gap-[12px] text-left">
        {item.image && (
          <div className="h-[76px] w-[114px] shrink-0 overflow-hidden bg-lm-100">
            <img src={item.image} alt="" loading="lazy" onError={hideOnError} className="size-full object-cover" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <h3 className="line-clamp-3 text-[16px] font-bold leading-[1.24] text-black group-hover:underline sm:text-[17px]" style={serif}>
            {item.headline}
          </h3>
          <Meta item={item} />
        </div>
      </StudioLink>
    );
  }
  return (
    <StudioLink href={storyPath(item)} className="group flex w-full gap-[12px] text-left sm:flex-col sm:gap-[10px]">
      {item.image && (
        <div className="h-[82px] w-[124px] shrink-0 overflow-hidden bg-lm-100 sm:aspect-video sm:h-auto sm:w-full">
          <img src={item.image} alt="" loading="lazy" onError={hideOnError} className="size-full object-cover" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[8px] sm:gap-[10px]">
        <h3 className="text-[19px] font-bold leading-[1.2] text-black group-hover:underline sm:text-[24px]" style={serif}>
          {item.headline}
        </h3>
        <p className="hidden font-roboto text-[13px] leading-[20px] text-lm-500 sm:line-clamp-2" style={rb}>
          {item.body || item.summary}
        </p>
        <Meta item={item} />
      </div>
    </StudioLink>
  );
}

/* headline rail entry (right column) — text only */
function RailStory({ item }: { item: Story }) {
  return (
    <StudioLink href={storyPath(item)} className="group flex w-full flex-col gap-[6px] py-[16px] text-left first:pt-0 last:pb-0">
      <h3 className="line-clamp-3 text-[17px] font-bold leading-[1.25] text-black group-hover:underline" style={serif}>
        {item.headline}
      </h3>
      <p className="line-clamp-2 font-roboto text-[13px] leading-[20px] text-lm-500" style={rb}>
        {item.body || item.summary}
      </p>
      <Meta item={item} />
    </StudioLink>
  );
}

/* Flat feed card for the masonry below the band — image, serif headline,
 * full brief, reading lenses, meta. The whole card opens the story; the
 * headline is also a real link, so the story is reachable without script. */
function StudioCard({ item, onOpen }: { item: Story; onOpen: () => void }) {
  const lenses = availableLenses(item);
  const [lens, setLens] = useState<LensId | null>(null);
  const activeLens = lens && lenses.some(([id]) => id === lens) ? lens : null;
  return (
    <article onClick={onOpen} className="group cursor-pointer border-b border-lm-200 pb-[16px] sm:pb-[18px]">
      {/* BBC mobile list row: thumbnail left, headline + meta right; from sm
          up it stacks into the broadsheet column card */}
      <div className="flex gap-[12px] sm:flex-col sm:gap-[10px]">
        {item.image && (
          <div className="h-[78px] w-[116px] shrink-0 overflow-hidden bg-lm-100 sm:aspect-video sm:h-auto sm:w-full">
            <img src={item.image} alt="" loading="lazy" onError={hideOnError} className="size-full object-cover" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-[6px] sm:gap-0">
          <h3 className="text-[17px] font-bold leading-[1.24] text-black group-hover:underline sm:text-[21px] sm:leading-[1.22]" style={serif}>
            <StudioLink href={storyPath(item)} onClick={(e) => e.stopPropagation()}>
              {item.headline}
            </StudioLink>
          </h3>
          <div className="sm:hidden">
            <Meta item={item} />
          </div>
        </div>
      </div>
      {/* brief + reading lenses + full meta — tablet/desktop only */}
      <div className="hidden sm:mt-[10px] sm:flex sm:flex-col sm:gap-[10px]">
        <ContentSwap item={item} lens={activeLens} minH={56}>
          <Excerpt item={item} />
        </ContentSwap>
        {lenses.length > 0 && <LensPills lenses={lenses} active={activeLens} onPick={setLens} compact />}
        <div className="mt-[2px] flex flex-wrap items-center justify-between gap-[8px]">
          <Meta item={item} />
          <span className="font-roboto text-[12px] text-lm-400" style={rb}>
            {item.source}
          </span>
        </div>
      </div>
    </article>
  );
}

type Section = { label: string; items: Story[] };
type DayGroup = { key: string; label: string; today: boolean; sections: Section[]; items: Story[] };

export function FrontPage({
  items: rawItems = [],
  loading = false,
  emptyLabel = "No stories here yet — check back soon.",
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: {
  items?: Story[];
  loading?: boolean;
  emptyLabel?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  const booted = useBooted();
  const clock = useClock();
  const router = useRouter();

  /* collapse the same story from different outlets — everything below,
   * including the reader, works on the deduped feed */
  const items = useMemo(() => dedupeStories(rawItems), [rawItems]);
  /* the ticker and top band pick from the newest page only, so they stay
   * put while older pages stream in below */
  const head = useMemo(() => items.slice(0, FEED_PAGE_SIZE), [items]);

  /* every story opens on its own page */
  const openItem = (it: Story) => router.push(storyPath(it), { scroll: false });

  /* breaking ticker */
  const breaking = useMemo(() => {
    const now = clock();
    const score = (s: Story) => breakingScore(s, now);
    const hot = head
      .filter((s) => isBreaking(s, now))
      .sort((a, b) => score(b) - score(a))
      .slice(0, 6);
    if (hot.length > 0) return hot;
    return [...head.slice(0, 10)].sort((a, b) => score(b) - score(a)).slice(0, 6);
  }, [head, clock]);

  /* top band: hottest stories first; the lead carries an image when any
   * story has one, the left pair prefers images, the rail is text-only */
  const { lead, side, rail, rest } = useMemo(() => {
    const now = clock();
    const ranked = [...head].sort((a, b) => breakingScore(b, now) - breakingScore(a, now));
    const lead = ranked.find((it) => it.image) || ranked[0] || null;
    const used = new Set(lead ? [lead.id] : []);
    const side = ranked.filter((it) => !used.has(it.id) && it.image).slice(0, 2);
    for (const it of ranked) {
      if (side.length >= 2) break;
      if (!used.has(it.id) && !side.some((s) => s.id === it.id)) side.push(it);
    }
    side.forEach((it) => used.add(it.id));
    const rail = ranked.filter((it) => !used.has(it.id)).slice(0, 5);
    rail.forEach((it) => used.add(it.id));
    const rest = items.filter((it) => !used.has(it.id));
    return { lead, side, rail, rest };
  }, [head, items, clock]);

  /* Date groups below the band. Within each day, SECTION FRONTS are derived
   * from the stories present: any topic with 4+ stories that day earns its
   * own band (kicker + its hottest 4), capped at 3; everything else flows
   * into the day's masonry. */
  const groups = useMemo<DayGroup[]>(() => {
    const now = clock();
    const byDay = new Map<string, Story[]>();
    for (const it of rest) {
      if (!it.publishedAt) continue;
      const k = istDayKey(it.publishedAt);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k)!.push(it);
    }
    return [...byDay.entries()]
      .sort((a, b) => new Date(b[1][0].publishedAt).getTime() - new Date(a[1][0].publishedAt).getTime())
      .map(([k, arr]) => {
        const byTopic = new Map<string, Story[]>();
        for (const it of arr) {
          const label = topicLabel(it);
          if (!label) continue;
          if (!byTopic.has(label)) byTopic.set(label, []);
          byTopic.get(label)!.push(it);
        }
        const sections = [...byTopic.entries()]
          .filter(([, list]) => list.length >= 4)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 3)
          .map(([label, list]) => ({
            label,
            items: [...list].sort((a, b) => breakingScore(b, now) - breakingScore(a, now)).slice(0, 4),
          }));
        const sectioned = new Set(sections.flatMap((s) => s.items.map((it) => it.id)));
        return {
          key: k,
          sections,
          items: arr.filter((it) => !sectioned.has(it.id)),
          ...dayHeading(arr[0].publishedAt, now),
        };
      });
  }, [rest, clock]);

  if (loading && items.length === 0) return <StudioSkeleton />;
  if (items.length === 0) {
    return (
      <div className="px-[32px] py-[80px] text-center font-roboto text-[18px] text-lm-500" style={rb}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <>
      {/* broadcast ticker hugs the glass toolbar above (full-bleed) */}
      <BreakingTicker items={breaking} />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[44px] px-4 py-[32px] sm:px-8 sm:py-[48px] lg:px-[32px]">
        {/* top-stories band: [side pair | image lead | headline rail] */}
        {lead && (
          <motion.section
            initial={booted ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Kicker>Top stories</Kicker>
            <div className="grid gap-[28px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)_minmax(0,1fr)]">
              {/* lead first on mobile, centred on desktop, flanked by hairlines */}
              <div className="order-1 lg:order-2 lg:border-x lg:border-lm-200 lg:px-[28px]">
                <LeadStory item={lead} />
              </div>
              {/* size-stepped left column: 2nd story big, 3rd compact */}
              <div className="order-2 flex flex-col gap-[20px] lg:order-1 [&>*+*]:border-t [&>*+*]:border-lm-200 [&>*+*]:pt-[20px]">
                {side.map((it, i) => (
                  <SideStory key={it.id} item={it} prominent={i === 0} />
                ))}
              </div>
              <div className="order-3 flex flex-col [&>*+*]:border-t [&>*+*]:border-lm-200">
                {rail.map((it) => (
                  <RailStory key={it.id} item={it} />
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* the rest of the feed: per-day section fronts, then the day's masonry */}
        {groups.map((g) => (
          <motion.section
            key={g.key}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Kicker light={!g.today}>{g.label}</Kicker>

            {g.sections.map((sec) => (
              <div key={sec.label} className="mb-[36px]">
                <div className="mb-[16px] flex items-center gap-[12px]">
                  <h3 className="font-roboto text-[12px] font-bold uppercase tracking-[0.12em] text-[#3979FF]" style={rb}>
                    {sec.label}
                  </h3>
                  <div className="h-px flex-1 bg-lm-200" />
                </div>
                <div className="grid gap-[20px] sm:grid-cols-2 lg:grid-cols-4">
                  {sec.items.map((it) => (
                    <StudioCard key={it.id} item={it} onOpen={() => openItem(it)} />
                  ))}
                </div>
              </div>
            ))}

            {g.sections.length > 0 && g.items.length > 0 && (
              <div className="mb-[16px] flex items-center gap-[12px]">
                <h3 className="font-roboto text-[12px] font-bold uppercase tracking-[0.12em] text-lm-500" style={rb}>
                  Also in news
                </h3>
                <div className="h-px flex-1 bg-lm-200" />
              </div>
            )}
            {/* masonry via CSS columns with broadsheet column rules: an
                expanded card (open lens) only pushes down its own column */}
            <div className="columns-1 gap-[32px] [column-rule:1px_solid_#E4E4E7] sm:columns-2 lg:columns-3">
              {g.items.map((it) => (
                <div key={it.id} className="mb-[22px] break-inside-avoid">
                  <StudioCard item={it} onOpen={() => openItem(it)} />
                </div>
              ))}
            </div>
          </motion.section>
        ))}

        <FeedTail hasMore={hasMore} loadingMore={loadingMore} onLoadMore={onLoadMore} count={rawItems.length} />
      </div>
    </>
  );
}
