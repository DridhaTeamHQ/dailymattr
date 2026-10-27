"use client";

import { createContext, useCallback, useContext } from "react";
import { useBooted } from "@/lib/studio/boot";

/* The clock relative times and the breaking selection read. Until the page
 * has booted it is the server's render time (so the HTML and hydration
 * agree); after that it is the browser's clock, as the app always used. */
const ServerNow = createContext(0);

export function NowProvider({ now, children }: { now: number; children: React.ReactNode }) {
  return <ServerNow.Provider value={now}>{children}</ServerNow.Provider>;
}

/* a reader for the clock — stable until boot, for use inside memos that
 * recompute when their data changes (as they did with Date.now()) */
export function useClock(): () => number {
  const booted = useBooted();
  const serverNow = useContext(ServerNow);
  return useCallback(() => (booted || !serverNow ? Date.now() : serverNow), [booted, serverNow]);
}

/* the clock at this render */
export function useNow(): number {
  return useClock()();
}
