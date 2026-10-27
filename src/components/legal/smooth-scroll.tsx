"use client";

import { useEffect, useLayoutEffect } from "react";

/* The long-form pages scroll smoothly to in-page anchors (the contents rail,
 * "see Section 12" links) — was `html { scroll-behavior: smooth }` in
 * legal.css. Turned on after Next has done its scroll-to-top / scroll-to-hash
 * for this page (passive effect), and off before the next page's (layout
 * cleanup runs in the commit that removes this one), so route changes stay
 * instant; the homepage's Lenis also needs it off. */
export function SmoothScroll() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);
  useLayoutEffect(
    () => () => {
      document.documentElement.style.scrollBehavior = "";
    },
    [],
  );
  return null;
}
