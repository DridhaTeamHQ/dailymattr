import { useEffect, useState } from "react";

/* True once the page has scrolled past `threshold`px, false again only after
 * it comes back above `release`px. The gap is deliberate: without
 * hysteresis a scroll that lands on the boundary flips the flag every frame
 * and the nav flickers. */
export function useScrolledPast(threshold = 90, release = 24): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const read = () => {
      const y = window.scrollY;
      setPast((prev) => (prev ? y > release : y > threshold));
    };
    read(); // honour a restored scroll position on mount
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [threshold, release]);

  return past;
}
