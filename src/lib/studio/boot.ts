import { useSyncExternalStore } from "react";

/* "Booted": false while the server's HTML is being hydrated, true from the
 * moment the studio shell has mounted in the browser — and true at once for
 * anything mounted by an in-app navigation after that.
 *
 * Two things hang off it:
 *  - entrance animations (page fade, top-stories rise, rail cards) start
 *    from their final frame on the server-rendered first paint, which is
 *    already on screen, and play as designed on every in-app navigation;
 *  - clock- and time-zone-dependent text renders against the server's
 *    clock until boot, so hydration matches the HTML, then re-renders live. */

let booted = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* called once by the studio shell after its first commit */
export function markBooted() {
  if (booted) return;
  booted = true;
  for (const l of listeners) l();
}

export function useBooted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => booted,
    () => false,
  );
}
