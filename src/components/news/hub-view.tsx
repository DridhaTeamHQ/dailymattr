import Link from "next/link";
import { pill } from "@/components/site/pill";
import { CATEGORIES, hubPath } from "@/lib/categories";
import type { FeedView } from "@/lib/news/feed";
import { todayInTimezone } from "@/lib/text";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { DateFilter } from "./date-filter";
import { NewsCard } from "./news-card";

const tab = "rounded-full px-3.5 py-2 text-[13.5px] font-semibold no-underline transition-[background,color] duration-150 ease-[ease]";
const tabIdle = "bg-[#f3f3f6] text-ink hover:bg-mist";
const tabCurrent = "bg-brand text-white";

/* the section tabs; a date filter carries across them */
function Tabs({ activePath, querySuffix }: { activePath: string; querySuffix: string }) {
  const items = [{ path: "/news/", label: "Latest" }, ...CATEGORIES.map((c) => ({ path: hubPath(c), label: c.label }))];
  return (
    <nav className="m-0 flex flex-wrap gap-2" aria-label="News sections">
      {items.map(({ path, label }) => {
        const current = path === activePath;
        return (
          <Link
            key={path}
            href={`${path}${querySuffix}`}
            className={cn(tab, current ? tabCurrent : tabIdle)}
            aria-current={current ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/* The "Latest" feed and every section hub, page N, optionally one day */
export function HubView({ view }: { view: FeedView }) {
  const { heading, intro, path, trail, posts, page, hasNext, date, formattedDate, querySuffix } = view;
  const day = formattedDate || date;

  return (
    <div className="mx-auto w-[min(1120px,100%_-_40px)]">
      <Breadcrumbs trail={trail} />
      <div className="mb-[26px]">
        <h1 className="text-[length:clamp(26px,4vw,40px)] leading-[1.15] font-bold tracking-[-0.02em]">
          {`${heading}${page > 1 ? ` — page ${page}` : ""}`}
        </h1>
        <p className="mt-2.5 max-w-[62ch] text-[15px] text-ink-soft">{intro}</p>
      </div>

      <div className="mt-[22px] mb-7 flex flex-wrap items-center justify-between gap-x-[18px] gap-y-3.5 phone:flex-col phone:items-stretch phone:gap-3">
        <Tabs activePath={path} querySuffix={querySuffix} />
        <DateFilter path={path} date={date} max={todayInTimezone()} />
      </div>

      {date && (
        <div className="-mt-2.5 mb-6 flex items-center gap-3 rounded-[12px] border border-[rgba(57,121,255,.2)] bg-[rgba(57,121,255,.07)] px-4 py-[9px] text-[13.5px] text-ink">
          <span>
            Filtered by date: <b className="text-brand">{day}</b>
          </span>
          <Link href={path} className="ml-auto text-[12.5px] font-semibold text-brand underline">
            Clear filter
          </Link>
        </div>
      )}

      {posts.length ? (
        <ol className="grid list-none grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-x-[22px] gap-y-[26px]">
          {posts.map((p, i) => (
            <NewsCard key={p.id} post={p} eager={i < 3} />
          ))}
        </ol>
      ) : (
        <div className="mt-4 mb-8 rounded-[16px] border border-dashed border-[#dcdce2] bg-white px-5 py-12 text-center">
          <p className="mb-1 text-[16px] text-ink-soft">{date ? `No stories found for ${day}.` : "Nothing published here yet."}</p>
          {date && (
            <p>
              <Link href={path} className={cn(pill({ variant: "brand" }), "mt-3.5 inline-flex leading-[normal]")}>
                View all latest news
              </Link>
            </p>
          )}
        </div>
      )}

      {(page > 1 || hasNext) && (
        <nav className="mt-12 flex justify-between gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Link href={view.prevHref} rel="prev" className={pagerLink}>
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          {hasNext && (
            <Link href={view.nextHref} rel="next" className={pagerLink}>
              Older →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

const pagerLink = "rounded-full border border-mist px-[18px] py-2.5 text-[14px] font-semibold text-ink no-underline hover:border-ink";
