"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { APP_STORE_URL, PLAY_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/* The app prompt shown after a run of stories (StoryNav decides when).
 * A quiet word from the newsroom, not an ad: the serif wordmark anchors it,
 * the number carries the whole proposition, and the blue appears exactly
 * once — on the thing to press. It stays in the markup, hidden, so opening
 * it never shifts anything.
 *
 * The three app screens cycle while it is open: the one in front steps back
 * and the next comes forward. Paused while the pointer is over the stack so
 * a reader can look at one, and never started at all when the visitor has
 * asked for less motion. */

const SHOTS = [
  { src: "/assets/app-brief.webp", width: 416, height: 741, alt: "60-word summaries — context to impact" },
  { src: "/assets/app-qix.webp", width: 416, height: 742, alt: "Infotainment videos — visually appealing explainers" },
  { src: "/assets/app-pix.webp", width: 418, height: 741, alt: "News Shots — image-based news you swipe through" },
];

/* front, waiting on the right, leaving to the left */
const POSITIONS = [
  "z-[3] opacity-100 [transform:translateX(0)_scale(1)]",
  "z-[1] opacity-0 [transform:translateX(46px)_scale(.94)]",
  "z-[1] opacity-0 [transform:translateX(-46px)_scale(.94)]",
];

/* the panel settles first, then its contents arrive in order */
const ARRIVE = {
  stage: "motion-safe:animate-[gate-in_.6s_cubic-bezier(.16,1,.3,1)_.1s_both]",
  dots: "motion-safe:animate-[gate-in_.5s_cubic-bezier(.16,1,.3,1)_.26s_both]",
  mark: "motion-safe:animate-[gate-in_.5s_cubic-bezier(.16,1,.3,1)_.3s_both]",
  title: "motion-safe:animate-[gate-in_.5s_cubic-bezier(.16,1,.3,1)_.36s_both]",
  copy: "motion-safe:animate-[gate-in_.5s_cubic-bezier(.16,1,.3,1)_.42s_both]",
  buttons: "motion-safe:animate-[gate-in_.5s_cubic-bezier(.16,1,.3,1)_.48s_both]",
  skip: "motion-safe:animate-[gate-in_.5s_cubic-bezier(.16,1,.3,1)_.54s_both]",
};

const cta =
  "m-0 flex flex-[1_1_145px] items-center justify-center gap-2 rounded-full px-4 py-[11px] text-[13.5px] font-bold text-white no-underline transition-[background,transform,box-shadow] duration-200 ease-[ease] motion-safe:hover:[transform:translateY(-2px)] [&_svg]:-mt-px";

export function AppGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [at, setAt] = useState(0);
  /* bumped by a dot click so the cycle restarts from the chosen screen */
  const [cycle, setCycle] = useState(0);
  const held = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  /* opening: lock the page, focus the close button; closing gives focus
     back to whatever had it */
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    setAt(0);
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = "";
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || SHOTS.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (!held.current) setAt((a) => (a + 1) % SHOTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [open, cycle]);

  /* Escape closes; aria-modal: Tab and Shift+Tab cycle inside the panel */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(
        panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"),
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!panel.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const show = useCallback((i: number) => {
    setAt(i);
    setCycle((c) => c + 1);
  }, []);

  return (
    <div
      className="fixed inset-0 z-90 grid place-items-center p-5 [@media(max-width:560px)]:p-0 [@media(max-width:560px)]:[place-items:end_stretch]"
      id="app-gate"
      hidden={!open}
    >
      {/* light enough that the frosted panel above it still reads as bright
          glass rather than grey — backdrop-filter samples this layer too */}
      <div
        className="absolute inset-0 bg-[rgba(10,10,11,.46)] motion-safe:animate-[gate-fade_.3s_ease-out_both] supports-[backdrop-filter:blur(4px)]:backdrop-blur-[5px]"
        onClick={onClose}
      />
      {/* frosted glass: one translucent surface, a top-lit rim and a single
          deep shadow; on a phone it arrives as a sheet from the bottom edge */}
      <div
        ref={panel}
        className="relative max-h-[calc(100vh_-_40px)] w-[min(436px,100%)] overflow-hidden rounded-[30px] border border-[rgba(255,255,255,.9)] bg-[rgba(255,255,255,.82)] px-7 pt-[26px] pb-6 text-center text-ink shadow-[0_40px_90px_rgba(10,10,11,.34),0_2px_6px_rgba(10,10,11,.06),inset_0_1px_0_rgba(255,255,255,.95)] supports-[backdrop-filter:blur(30px)]:bg-[rgba(255,255,255,.7)] supports-[backdrop-filter:blur(30px)]:backdrop-blur-[32px] supports-[backdrop-filter:blur(30px)]:backdrop-saturate-[180%] [@media(min-width:561px)]:motion-safe:animate-[gate-rise_.58s_cubic-bezier(.16,1,.3,1)_both] [@media(max-width:560px)]:max-h-[92vh] [@media(max-width:560px)]:w-full [@media(max-width:560px)]:rounded-t-[28px] [@media(max-width:560px)]:rounded-b-none [@media(max-width:560px)]:border-b-0 [@media(max-width:560px)]:px-5 [@media(max-width:560px)]:pt-5 [@media(max-width:560px)]:pb-[calc(20px_+_env(safe-area-inset-bottom))] [@media(max-width:560px)]:motion-safe:animate-[gate-sheet_.58s_cubic-bezier(.16,1,.3,1)_both]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-gate-title"
      >
        <button
          ref={closeButton}
          className="absolute top-3.5 right-3.5 z-[5] grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(10,10,11,.06)] text-ink-soft transition-[background,color] duration-[180ms] ease-[ease] hover:bg-[rgba(10,10,11,.14)] hover:text-ink"
          type="button"
          aria-label="Close and keep reading"
          onClick={onClose}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* one screen at a time, as large as the panel allows: the headline
            on the screen is the whole pitch */}
        <div
          className={cn(
            "relative grid h-[372px] place-items-center [@media(max-width:560px)]:h-[min(46vh,330px)]",
            ARRIVE.stage,
          )}
          onPointerEnter={() => (held.current = true)}
          onPointerLeave={() => (held.current = false)}
        >
          <span
            className="pointer-events-none absolute size-[260px] rounded-full bg-[radial-gradient(circle,rgba(57,121,255,.2),transparent_68%)] blur-[30px]"
            aria-hidden="true"
          />
          {SHOTS.map((s, i) => (
            <figure
              key={s.src}
              className={cn(
                "absolute m-0 h-full overflow-hidden rounded-[18px] shadow-[0_20px_48px_rgba(10,10,11,.24)] will-change-[transform,opacity] [transition:transform_.62s_cubic-bezier(.22,1,.3,1),opacity_.44s_ease] motion-reduce:[transition:none]",
                POSITIONS[(i - at + SHOTS.length) % SHOTS.length],
              )}
            >
              <Image className="block h-full w-auto" src={s.src} width={s.width} height={s.height} alt={s.alt} loading="lazy" />
            </figure>
          ))}
        </div>

        <div className={cn("mt-4 mb-0.5 flex justify-center gap-1.5", ARRIVE.dots)} role="tablist" aria-label="App features">
          {SHOTS.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-label={s.alt}
              aria-selected={i === at}
              className={cn(
                "h-1.5 cursor-pointer border-0 p-0 transition-[background,width] duration-300 ease-[ease]",
                i === at ? "w-5 rounded-[3px] bg-brand" : "w-1.5 rounded-full bg-[rgba(10,10,11,.18)]",
              )}
              onClick={() => show(i)}
            />
          ))}
        </div>

        <div className="mt-2.5">
          <p className={cn("font-[Georgia,serif] text-[13.5px] text-ink-soft", ARRIVE.mark)}>“dailymattr”</p>
          <h2
            id="app-gate-title"
            className={cn("mt-2 text-[25px] leading-[1.14] font-bold tracking-[-0.025em] [@media(max-width:560px)]:text-[22px]", ARRIVE.title)}
          >
            Read 100 stories a&nbsp;day
          </h2>
          <p className={cn("mx-auto mt-[9px] max-w-[32ch] text-[14px] leading-[1.5] text-ink-soft", ARRIVE.copy)}>
            Image, video and audio explainers — fact-checked, handpicked, free.
          </p>
          <div className={cn("mt-[18px] flex flex-wrap justify-center gap-2.5", ARRIVE.buttons)}>
            <a
              className={cn(
                cta,
                ARRIVE.buttons,
                "bg-brand shadow-[0_8px_22px_rgba(57,121,255,.34)] hover:bg-brand-soft hover:shadow-[0_12px_28px_rgba(57,121,255,.42)]",
              )}
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="17" height="17" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              Google Play
            </a>
            <a
              className={cn(
                cta,
                ARRIVE.buttons,
                "bg-[#0a0a0b] shadow-[0_8px_22px_rgba(10,10,11,.24)] hover:bg-[#1c1d24] hover:shadow-[0_12px_28px_rgba(10,10,11,.35)]",
              )}
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.67-2.82 1.47-.6.69-1.12 1.83-1 2.93 1.12.09 2.17-.56 2.83-1.36z" />
              </svg>
              App Store
            </a>
          </div>
          <button
            className={cn(
              "block w-full cursor-pointer border-0 bg-transparent px-0.5 pt-3 pb-0 text-[13.5px] font-semibold text-ink-soft transition-[color] duration-[180ms] ease-[ease] hover:text-ink",
              ARRIVE.skip,
            )}
            type="button"
            onClick={onClose}
          >
            Keep reading
          </button>
        </div>
      </div>
    </div>
  );
}
