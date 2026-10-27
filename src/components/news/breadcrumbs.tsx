import Link from "next/link";
import { Fragment } from "react";
import type { Crumb } from "@/lib/schema";
import { cn } from "@/lib/utils";

/* Home › News › Section › Headline — the same trail the BreadcrumbList
 * JSON-LD carries; the last step is the current page, not a link */
export function Breadcrumbs({ trail, className }: { trail: Crumb[]; className?: string }) {
  return (
    <nav className={cn("mb-[18px] flex flex-wrap gap-1.5 text-[13px] text-ink-soft", className)} aria-label="Breadcrumb">
      {trail.map((t, i) =>
        i === trail.length - 1 ? (
          <span key={i} aria-current="page" className="text-ink">
            {t.name}
          </span>
        ) : (
          <Fragment key={i}>
            <Link href={t.path} className="text-ink-soft no-underline hover:text-brand">
              {t.name}
            </Link>
            <span aria-hidden="true">›</span>
          </Fragment>
        ),
      )}
    </nav>
  );
}
