"use client";

import { usePathname } from "next/navigation";

/* Once the Google tag has loaded on a marketing page it stays in the
 * document across in-app navigation, and GA4 counts history changes as page
 * views. News Studio never had analytics, and /unsubscribe's URL carries the
 * reader's email and token, so both opt out through GA's own
 * `ga-disable-<id>` flag. It is set during render, before Next pushes the
 * new URL. */
const UNTRACKED = ["/news-studio", "/unsubscribe"];

export function GaGuard({ gaId }: { gaId: string }) {
  const pathname = usePathname() || "";
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = UNTRACKED.some((p) => pathname.startsWith(p));
  }
  return null;
}
