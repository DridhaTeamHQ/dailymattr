"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { initHome } from "./choreography";

/* Was this document loaded at the current URL? False when the visitor
 * reached the homepage by an in-app navigation from another page. */
function landedHere(): boolean {
  const [entry] = performance.getEntriesByType("navigation");
  if (!entry) return true;
  try {
    return new URL(entry.name).pathname === location.pathname;
  } catch {
    return true;
  }
}

/* Runs the homepage choreography (choreography.ts) over its children and
 * tears it down when the page unmounts. The wrapper is display:contents, so
 * it adds no box to the layout — it only scopes the element lookups. */
export function HomeScene({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      /* the loading curtain belongs to the first page view of a visit: not
       * after an in-app navigation, and not when coming back home. Marking
       * the visit here (a layout effect, so before paint) hides the curtain
       * through its [.intro-seen_&]:hidden variant without a flash. */
      const html = document.documentElement;
      const intro = !html.classList.contains("intro-seen") && landedHere();
      if (!intro) html.classList.add("intro-seen");
      return initHome(root, { intro });
    },
    { scope },
  );

  return (
    <div ref={scope} className="contents">
      {children}
    </div>
  );
}
