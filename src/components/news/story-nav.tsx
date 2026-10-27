"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AppGate } from "./app-gate";

/* Story-to-story navigation: the arrows on every device, the previous/next
 * cards and the left and right keys. Every destination is a real link in the
 * markup, so without JavaScript the links still work — this only adds the
 * keys and the app prompt.
 *
 * The prompt appears after a run of stories, and its close button (or "Keep
 * reading") continues to the story that was pending, so nobody loses the
 * swipe they just made. It gives up after a few appearances per visit rather
 * than standing in front of someone reading a long run. */

type Dir = "prev" | "next";

const RUN = 3; // stories between prompts
const MAX_PROMPTS = 3; // per visit, then never again
const KEY_RUN = "dm.run";
const KEY_SEEN = "dm.prompts";

const store = {
  get(k: string) {
    try {
      return Number(sessionStorage.getItem(k)) || 0;
    } catch {
      return 0;
    }
  },
  set(k: string, v: number) {
    try {
      sessionStorage.setItem(k, String(v));
    } catch {
      /* storage blocked: the prompt simply never shows */
    }
  },
};

const StepContext = createContext<(dir: Dir) => void>(() => {});

export function StoryNav({ prev, next, children }: { prev: string | null; next: string | null; children: ReactNode }) {
  const router = useRouter();
  /* the story the prompt is holding back; the prompt is open while set */
  const [pending, setPending] = useState<string | null>(null);

  const go = useCallback(
    (dir: Dir) => {
      const url = dir === "next" ? next : prev;
      if (!url) return;
      const run = store.get(KEY_RUN) + 1;
      const seen = store.get(KEY_SEEN);
      if (run >= RUN && seen < MAX_PROMPTS) {
        store.set(KEY_RUN, 0);
        store.set(KEY_SEEN, seen + 1);
        setPending(url);
        return;
      }
      store.set(KEY_RUN, run);
      router.push(url);
    },
    [prev, next, router],
  );

  const close = useCallback(() => {
    const url = pending;
    setPending(null);
    if (url) router.push(url);
  }, [pending, router]);

  /* left and right keys, while the prompt is closed and nobody is typing */
  useEffect(() => {
    if (pending !== null) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof Element && (t.closest("input, textarea, select") || (t instanceof HTMLElement && t.isContentEditable))) return;
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, pending]);

  return (
    <StepContext.Provider value={go}>
      {children}
      <AppGate open={pending !== null} onClose={close} />
    </StepContext.Provider>
  );
}

/* A previous/next link. A plain click counts towards the run (and may open
 * the prompt); a modified click (new tab, new window) is left alone. */
export function StoryStepLink({
  dir,
  href,
  className,
  label,
  children,
}: {
  dir: Dir;
  href: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const go = useContext(StepContext);
  return (
    <Link
      href={href}
      rel={dir}
      prefetch={false}
      className={className}
      aria-label={label}
      data-story-step={dir}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(dir);
      }}
    >
      {children}
    </Link>
  );
}
