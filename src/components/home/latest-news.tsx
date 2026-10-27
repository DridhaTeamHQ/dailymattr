"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TIME_ZONE } from "@/lib/site";

/* Homepage "Latest news": the newest stories from /news/latest.json, each
 * with its own Pix artwork and a link to its article page. The section stays
 * hidden until stories arrive (and for good if the request fails), so the
 * page never shows an empty strip. Every field comes from the database and
 * is rendered as text only. */

const PIX_STORAGE = "https://coggfnbqqyiqfsxvtaym.supabase.co/storage/v1/";
const ARTICLE_PATH = /^\/news\/[a-z0-9-]+-\d{1,12}$/;
const dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, day: "numeric", month: "short" });

interface Card {
  href: string;
  title: string;
  section: string;
  image: { src: string; srcSet?: string } | null;
  publishedAt: string;
  date: string;
}

const str = (v: unknown) => (v == null ? "" : String(v));

function toCard(raw: unknown): Card {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const path = typeof s.path === "string" ? s.path : "";
  const img = s.image && typeof s.image === "object" ? (s.image as Record<string, unknown>) : null;
  const publishedAt = s.publishedAt ? str(s.publishedAt) : "";
  return {
    // only our own article pages are ever linked
    href: ARTICLE_PATH.test(path) ? path : "/news/",
    title: str(s.title),
    section: s.section ? str(s.section) : "",
    // our own Pix artwork only — the server checks the host too
    image:
      img && typeof img.src === "string" && img.src.startsWith(PIX_STORAGE)
        ? { src: img.src, srcSet: typeof img.srcset === "string" ? img.srcset : undefined }
        : null,
    publishedAt,
    // an unparseable date throws here, which keeps the whole row hidden
    date: publishedAt ? dateFmt.format(new Date(publishedAt)) : "",
  };
}

export function LatestNews() {
  const [cards, setCards] = useState<Card[]>([]);
  const [arrows, setArrows] = useState({ hidden: true, atStart: true, atEnd: false });
  const rowRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let live = true;
    fetch("/news/latest.json", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        const stories = data && typeof data === "object" ? (data as { stories?: unknown }).stories : null;
        if (!live || !Array.isArray(stories) || !stories.length) return;
        setCards(stories.map(toCard));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const sync = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const next = { hidden: max <= 4, atStart: row.scrollLeft <= 4, atEnd: row.scrollLeft >= max - 4 };
    // scroll fires every frame: only re-render when a button actually changes
    setArrows((prev) =>
      prev.hidden === next.hidden && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,
    );
  }, []);

  useEffect(() => {
    if (!cards.length) return;
    sync();
    window.addEventListener("resize", sync);
    // the pinned features section above measures the page; let it re-measure
    window.dispatchEvent(new Event("resize"));
    return () => window.removeEventListener("resize", sync);
  }, [cards, sync]);

  const step = (dir: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    const first = row.querySelector("li");
    const by = first ? first.getBoundingClientRect().width + 16 : row.clientWidth * 0.8;
    row.scrollBy({ left: by * dir, behavior: "smooth" });
  };

  const arrow =
    "size-[38px] cursor-pointer rounded-full border border-solid border-mist bg-white font-[family-name:system-ui] text-[20px] leading-none text-ink [transition:border-color_.2s_ease,opacity_.2s_ease] enabled:hover:border-ink disabled:cursor-default disabled:opacity-[.35]";

  return (
    /* a white sheet between the features and the FAQ */
    <section
      id="latest"
      hidden={!cards.length}
      className="relative z-5 -mt-[32px] rounded-t-[32px] bg-paper px-[8vw] pt-[90px] pb-[40px]"
    >
      <div aria-labelledby="latest-title" className="mx-auto max-w-[1280px]">
        <div className="mb-[18px] flex items-center gap-[18px] after:order-1 after:h-[1px] after:flex-1 after:bg-mist after:content-['']">
          <h2 id="latest-title" className="text-[clamp(20px,2.4vw,26px)] font-bold tracking-[-0.02em] whitespace-nowrap text-ink">
            Latest news
          </h2>
          <div hidden={arrows.hidden} className="order-2 flex gap-[8px]">
            {/* buttons keep the browser's own control font, as before */}
            <button type="button" aria-label="Scroll latest news left" disabled={arrows.atStart} onClick={() => step(-1)} className={arrow}>
              ‹
            </button>
            <button type="button" aria-label="Scroll latest news right" disabled={arrows.atEnd} onClick={() => step(1)} className={arrow}>
              ›
            </button>
          </div>
        </div>
        <ol
          ref={rowRef}
          onScroll={sync}
          className="-mx-[2px] -mt-[6px] -mb-[16px] grid list-none auto-cols-[max(250px,calc((100%_-_48px)/4))] grid-flow-col gap-[16px] snap-x snap-mandatory overflow-x-auto px-[2px] pt-[6px] pb-[22px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden phone:auto-cols-[78%]"
        >
          {cards.map((c, i) => (
            <li key={i} className="snap-start">
              {/* picture on top (never covered), section chip on the picture,
                  headline and date on white below — one link */}
              <Link
                href={c.href}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-solid border-[#ececf0] bg-white text-ink shadow-[0_1px_2px_rgba(10,10,11,.04)] [transition:transform_.25s_ease,box-shadow_.25s_ease,border-color_.25s_ease] hover:border-[#e2e2e8] hover:shadow-[0_18px_36px_-12px_rgba(10,10,11,.18)] hover:[transform:translateY(-4px)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-[radial-gradient(120%_120%_at_100%_0%,rgba(57,121,255,.32)_0%,transparent_60%),linear-gradient(160deg,#1c1c21,var(--color-coal))]">
                  {c.image && (
                    /* CMS artwork on Supabase with its own srcset from the
                     * server — a plain <img>, not next/image */
                    <img
                      src={c.image.src}
                      srcSet={c.image.srcSet}
                      sizes="(max-width: 640px) 78vw, 280px"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full object-cover object-[center_25%] [transition:transform_.5s_ease] group-hover:[transform:scale(1.05)]"
                    />
                  )}
                  {c.section && (
                    <span className="absolute top-[12px] left-[12px] rounded-full bg-[rgba(255,255,255,.92)] px-[10px] py-[5px] text-[11px] font-bold tracking-[.08em] text-ink uppercase shadow-[0_2px_8px_rgba(10,10,11,.12)] backdrop-blur-[6px]">
                      {c.section}
                    </span>
                  )}
                </span>
                <span className="flex flex-1 flex-col gap-[14px] px-[18px] pt-[16px] pb-[18px]">
                  <span className="line-clamp-3 text-[16.5px] leading-[1.38] font-semibold tracking-[-0.01em] text-ink group-hover:text-brand phone:text-[16px]">
                    {c.title}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-[10px] text-[12.5px] font-semibold text-ink-soft">
                    <time dateTime={c.publishedAt || undefined}>{c.date}</time>
                    <span className="whitespace-nowrap text-brand group-hover:underline">Read story →</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-[18px] text-[14px] font-semibold">
          <Link href="/news/" className="text-brand hover:underline">
            See all of today&apos;s news →
          </Link>
        </p>
      </div>
    </section>
  );
}
