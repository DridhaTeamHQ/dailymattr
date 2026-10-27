import Link from "next/link";
import type { ComponentProps } from "react";

/* Links between News Studio pages. Scrolling on navigation is the studio
 * shell's job (it scrolls to the top on every path change, as the app
 * always did), so Next's own scroll is off; and the long story lists don't
 * prefetch, matching the app's network profile — flip PREFETCH to let Next
 * prefetch them. */
const PREFETCH = false;

export function StudioLink(props: ComponentProps<typeof Link>) {
  return <Link prefetch={PREFETCH} scroll={false} {...props} />;
}
