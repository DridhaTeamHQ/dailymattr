"use client";

import { useCallback, useRef, useSyncExternalStore, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/* Gentle scroll reveal for the long-form pages (was [data-reveal] / .in).
 *
 * The hidden state is stamped from JS (data-reveal="out"), so readers without
 * scripts see everything. Blocks that were server-rendered and are already on
 * screen when the page hydrates are left alone: they have been painted, and
 * hiding them only to fade them back in would read as a flicker. After a
 * client-side navigation every block starts hidden, as on a fresh page load. */
export const revealClass =
  "motion-safe:data-reveal:[transition:opacity_.7s_ease,transform_.7s_cubic-bezier(.22,.7,.25,1)] motion-safe:data-[reveal=out]:opacity-0 motion-safe:data-[reveal=out]:[transform:translateY(20px)]";

const noop = () => () => {};

/** Callback ref that hides an element until it scrolls into view. */
export function useReveal() {
  /* false while hydrating server HTML, true for a client-side render */
  const clientRender = useSyncExternalStore(noop, () => true, () => false);
  const hydrating = useRef(!clientRender);

  return useCallback((el: HTMLElement | null) => {
    if (!el) return;
    if (hydrating.current) {
      const { top, bottom } = el.getBoundingClientRect();
      if (top < innerHeight * 0.92 && bottom > 0) return;
    }
    el.dataset.reveal = "out";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          el.dataset.reveal = "in";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
}

type RevealProps = ComponentPropsWithoutRef<"div"> & { as?: "div" | "section" };

/** A <div> or <section> that fades up the first time it scrolls into view. */
export function Reveal({ as: Tag = "div", className, ...props }: RevealProps) {
  const ref = useReveal();
  return <Tag ref={ref} className={cn(revealClass, className)} {...props} />;
}
