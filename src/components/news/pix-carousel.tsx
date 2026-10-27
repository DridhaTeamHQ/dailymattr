"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CarouselSlide = { src: string; srcSet: string; alt: string; artwork: boolean };

/* The Pix card carousel. The slides are plain <img> elements in a
 * scroll-snap row, so before hydration (or with JS off) the reader still
 * gets a horizontal scroller and a crawler still sees every image. Hydrated,
 * a row of two or more cards gains the arrows, the dots, the counter and
 * arrow-key support on the focusable row. The first card loads eagerly at
 * high priority (React preloads it in the <head>). */
export function PixCarousel({ slides, sizes }: { slides: CarouselSlide[]; sizes: string }) {
  const rail = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState(0);
  const [ready, setReady] = useState(false);
  const many = slides.length > 1;

  const go = useCallback(
    (i: number) => {
      const items = rail.current?.children;
      if (!items) return;
      const to = Math.max(0, Math.min(slides.length - 1, i));
      setAt(to);
      items[to]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    },
    [slides.length],
  );

  useEffect(() => {
    const el = rail.current;
    if (!many || !el) return;
    /* nearest slide to the rail's centre wins */
    const sync = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const s = child as HTMLElement;
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setAt(best);
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    setReady(true);
    sync();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [many]);

  return (
    <div className="relative mb-2 [@media(max-width:860px)]:m-0 [@media(max-width:860px)]:h-full" data-ready={ready ? "1" : undefined}>
      <ol
        ref={rail}
        className="flex list-none snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(max-width:860px)]:h-full [@media(max-width:860px)]:justify-start [@media(max-width:860px)]:gap-0 [@media(max-width:860px)]:p-0"
        tabIndex={0}
        aria-label="Story cards"
        onKeyDown={
          many
            ? (e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  go(at + 1);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  go(at - 1);
                }
              }
            : undefined
        }
      >
        {slides.map((s, i) => (
          <li
            key={i}
            className="aspect-[923/1704] flex-[0_0_100%] snap-center [@media(max-width:860px)]:aspect-auto [@media(max-width:860px)]:h-full"
          >
            <img
              className={cn(
                "block h-full w-full rounded-[18px] bg-coal [@media(max-width:860px)]:rounded-none",
                /* a plain photograph is cropped to the box rather than
                   letterboxed — only a designed card needs to be shown whole */
                s.artwork ? "object-cover" : "object-contain",
              )}
              src={s.src}
              srcSet={s.srcSet}
              sizes={sizes}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          </li>
        ))}
      </ol>
      {many && (
        <>
          <button className={cn(navButton, ready ? "grid" : "hidden", "left-1.5")} type="button" aria-label="Previous card" disabled={at === 0} onClick={() => go(at - 1)}>
            ‹
          </button>
          <button
            className={cn(navButton, ready ? "grid" : "hidden", "right-1.5")}
            type="button"
            aria-label="Next card"
            disabled={at === slides.length - 1}
            onClick={() => go(at + 1)}
          >
            ›
          </button>
          <div
            className={cn(
              ready ? "flex" : "hidden",
              "mt-3.5 justify-center gap-[7px] [@media(max-width:860px)]:absolute [@media(max-width:860px)]:inset-x-0 [@media(max-width:860px)]:bottom-11 [@media(max-width:860px)]:z-[1] [@media(max-width:860px)]:m-0",
            )}
            role="tablist"
            aria-label="Story cards"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-label={`Card ${i + 1}`}
                aria-current={i === at ? "true" : "false"}
                className={cn(
                  "h-[7px] cursor-pointer border-0 p-0 transition-[background,width] duration-200 ease-[ease]",
                  i === at
                    ? "w-[22px] rounded-[4px] bg-brand [@media(max-width:860px)]:bg-white"
                    : "w-[7px] rounded-full bg-mist [@media(max-width:860px)]:bg-[rgba(255,255,255,.45)]",
                )}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <p className="mt-2.5 text-center text-[12.5px] text-ink-soft [@media(max-width:860px)]:hidden">
            Card <b>{at + 1}</b>
            {` of ${slides.length}`}
          </p>
        </>
      )}
    </div>
  );
}

const navButton =
  "absolute top-1/2 size-[42px] cursor-pointer place-items-center rounded-full border-0 bg-[rgba(10,10,11,.72)] text-[19px] leading-none text-white [transform:translateY(-50%)] transition-[background,opacity] duration-200 ease-[ease] hover:bg-coal disabled:cursor-default disabled:opacity-25 [@media(max-width:860px)]:hidden";
