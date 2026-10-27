"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* Global controller for the right-side drawers (auth/account + subscribe).
 * Any component can call openAuth() / openSubscribe([...slugs]) — the
 * drawers render once in the studio shell and slide over the current page
 * (no navigation). */
export type DrawerState = { type: "auth" } | { type: "subscribe"; slugs: string[] } | null;

type DrawerValue = {
  drawer: DrawerState;
  openAuth: () => void;
  openSubscribe: (slugs?: string[]) => void;
  close: () => void;
  /* slugs the reader subscribed to this session */
  subscribedSlugs: string[];
  markSubscribed: (slugs: string[]) => void;
};

const Ctx = createContext<DrawerValue | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [subscribedSlugs, setSubscribedSlugs] = useState<string[]>([]);

  const openAuth = useCallback(() => setDrawer({ type: "auth" }), []);
  const openSubscribe = useCallback((slugs: string[] = []) => setDrawer({ type: "subscribe", slugs }), []);
  const close = useCallback(() => setDrawer(null), []);
  const markSubscribed = useCallback((slugs: string[]) => setSubscribedSlugs((prev) => [...new Set([...prev, ...slugs])]), []);

  const value = useMemo(
    () => ({ drawer, openAuth, openSubscribe, close, subscribedSlugs, markSubscribed }),
    [drawer, openAuth, openSubscribe, close, subscribedSlugs, markSubscribed],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const NOOP: DrawerValue = {
  drawer: null,
  openAuth: () => {},
  openSubscribe: () => {},
  close: () => {},
  subscribedSlugs: [],
  markSubscribed: () => {},
};

/* outside the provider (tests etc.) everything degrades to no-ops */
export function useDrawer(): DrawerValue {
  return useContext(Ctx) || NOOP;
}
