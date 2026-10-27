"use client";

import { useInfiniteSentinel } from "@/lib/studio/use-paged-feed";

const rb = { fontVariationSettings: '"wdth" 100' };

/* End of a paged feed: an invisible sentinel that pulls the next page in
 * before the reader reaches it, a quiet loader while it arrives, and a
 * sign-off once everything is loaded. */
export function FeedTail({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  count = 0,
}: {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  count?: number;
}) {
  const ref = useInfiniteSentinel<HTMLDivElement>(onLoadMore, hasMore && !loadingMore, count);
  if (!hasMore && !loadingMore) {
    return (
      <p className="py-[8px] text-center font-roboto text-[13px] text-lm-400" style={rb}>
        You&apos;re all caught up.
      </p>
    );
  }
  return (
    <div ref={ref} className="flex justify-center py-[8px]" role="status" aria-live="polite">
      {loadingMore && (
        <span className="inline-flex items-center gap-[10px] font-roboto text-[13px] text-lm-500" style={rb}>
          <span className="size-[16px] animate-spin rounded-full border-2 border-lm-200 border-t-lm-800" aria-hidden="true" />
          Loading more stories…
        </span>
      )}
    </div>
  );
}
