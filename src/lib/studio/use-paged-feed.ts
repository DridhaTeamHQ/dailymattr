import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import type { FeedPage, Story } from "./types";

/* Paged, near-real-time feed.
 *
 * Starts from the server-rendered first page when there is one (otherwise
 * loads it), appends older pages on loadMore(), and keeps the top fresh by
 * re-polling ONLY the first page every `intervalMs` (and on mount and tab
 * focus) — new stories merge in above what's loaded, edited ones update in
 * place. Items merge by id, so a page boundary that shifts as new stories
 * land never shows a story twice.
 *
 * `initial` seeds the first selection only: changing `deps` (section,
 * search) resets to a fresh load, as before. */
export function usePagedFeed(
  fetchPage: (offset: number) => Promise<FeedPage>,
  deps: DependencyList,
  { intervalMs = 30000, initial = null }: { intervalMs?: number; initial?: FeedPage | null } = {},
) {
  const [data, setData] = useState<Story[] | null>(initial ? initial.items : null);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initial ? initial.hasMore : false);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  /* bumped on every reset; responses from an older generation are dropped */
  const genRef = useRef(0);
  const offsetRef = useRef(initial ? initial.items.length : 0);
  const busyRef = useRef(false);
  const headSigRef = useRef<string | null>(initial ? signature(initial.items) : null);
  const loadedRef = useRef(!!initial);
  /* the selection on screen; the server's page counts as the first one */
  const shownRef = useRef<string | null>(initial ? depsKey(deps) : null);

  const refreshHead = useCallback(async () => {
    const gen = genRef.current;
    try {
      const page = await fetchRef.current(0);
      if (gen !== genRef.current) return;
      setError(null);
      const sig = signature(page.items);
      if (sig !== null && sig === headSigRef.current) return;
      headSigRef.current = sig;
      if (!loadedRef.current) {
        loadedRef.current = true;
        offsetRef.current = page.items.length;
        setHasMore(page.hasMore);
        setData(page.items);
        return;
      }
      const fresh = new Set(page.items.map((it) => it.id));
      setData((prev) => [...page.items, ...(prev || []).filter((it) => !fresh.has(it.id))]);
    } catch (e) {
      if (gen !== genRef.current) return;
      setError((e as Error)?.message || "Could not load. Retrying…");
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (busyRef.current || !loadedRef.current) return;
    busyRef.current = true;
    setLoadingMore(true);
    const gen = genRef.current;
    try {
      const page = await fetchRef.current(offsetRef.current);
      if (gen !== genRef.current) return;
      offsetRef.current += page.items.length;
      setHasMore(page.hasMore);
      setData((prev) => {
        const seen = new Set((prev || []).map((it) => it.id));
        return [...(prev || []), ...page.items.filter((it) => !seen.has(it.id))];
      });
    } catch (e) {
      if (gen === genRef.current) setError((e as Error)?.message || "Could not load more.");
    } finally {
      if (gen === genRef.current) {
        busyRef.current = false;
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    const key = depsKey(deps);
    if (key !== shownRef.current) {
      /* a new selection: show a fresh load, not the previous one's stories */
      shownRef.current = key;
      genRef.current += 1;
      offsetRef.current = 0;
      busyRef.current = false;
      headSigRef.current = null;
      loadedRef.current = false;
      setData(null);
      setError(null);
      setHasMore(false);
      setLoadingMore(false);
    }

    refreshHead();
    const timer = setInterval(refreshHead, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshHead();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshHead);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshHead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading: data === null && !error, loadingMore, hasMore, loadMore };
}

const depsKey = (deps: DependencyList) => JSON.stringify(deps);

function signature(items: Story[]): string | null {
  try {
    return JSON.stringify(items);
  } catch {
    return null;
  }
}

/* Infinite-scroll trigger: attach the returned ref to an element at the end
 * of the list; `onMore` fires whenever it comes within ~a screen of the
 * viewport. Rebuilt when `count` changes, so a page that still leaves the
 * sentinel on screen pulls the next one too. */
export function useInfiniteSentinel<T extends Element>(onMore: (() => void) | undefined, enabled: boolean, count: number) {
  const ref = useRef<T | null>(null);
  const onMoreRef = useRef(onMore);
  onMoreRef.current = onMore;
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onMoreRef.current?.();
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, count]);
  return ref;
}
