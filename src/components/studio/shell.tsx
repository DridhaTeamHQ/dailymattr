"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { markBooted } from "@/lib/studio/boot";
import { BASE } from "@/lib/studio/routes";
import { AuthProvider } from "./auth-context";
import { DrawerProvider } from "./drawer-context";
import { DrawerHost } from "./drawer-host";
import { ScrollTopButton } from "./scroll-top-button";

/* What stays mounted across every News Studio page (the news-studio
 * layout): the session, the drawers and their controller, the back-to-top
 * button, scroll-to-top on navigation, and the in-studio history that
 * decides where "back" goes. */

/* In-app navigations inside the studio since it mounted. Back returns to
 * wherever the reader came from inside News Studio; a page opened straight
 * from a link (or entered from another part of the site) goes to its
 * fallback instead. */
const BackContext = createContext<() => boolean>(() => false);

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const steps = useRef(0);
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current !== null && last.current !== pathname) steps.current += 1;
    last.current = pathname;
    /* scroll to top on every page change (but keep in-page #anchors) */
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  /* the server's HTML is hydrated: from here on, entrance animations play
   * and clocks run live (lib/studio/boot.ts) */
  useEffect(markBooted, []);

  const canGoBack = useCallback(() => steps.current > 0, []);

  return (
    <AuthProvider>
      <DrawerProvider>
        <BackContext.Provider value={canGoBack}>
          {children}
          <ScrollTopButton />
          <DrawerHost />
        </BackContext.Provider>
      </DrawerProvider>
    </AuthProvider>
  );
}

/* `back(fallback)`: history back inside the studio, else push `fallback`
 * (a full /news-studio path) */
export function useStudioBack() {
  const canGoBack = useContext(BackContext);
  const router = useRouter();
  return useCallback(
    (fallback: string = `${BASE}/`) => {
      if (canGoBack()) router.back();
      else router.push(fallback, { scroll: false });
    },
    [canGoBack, router],
  );
}
