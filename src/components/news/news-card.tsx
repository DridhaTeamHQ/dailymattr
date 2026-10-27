import Link from "next/link";
import { categoryById, hubPath } from "@/lib/categories";
import { artworkFor, thumbAttrs, THUMB_SIZES } from "@/lib/news/media";
import type { PixPost } from "@/lib/news/types";
import { articlePath, cleanHeadline } from "@/lib/slug";
import { formatDate } from "@/lib/text";

/* One story in a hub grid: artwork, headline, date and section.
 *
 * The artwork is a plain <img> on purpose: the Supabase render endpoint does
 * the resizing, and these src/srcset pairs are the exact files the pages have
 * always requested (next/image would swap in its own widths and URLs).
 * Article links don't prefetch: thirty per page, each a proxy lookup. */
export function NewsCard({ post, eager = false }: { post: PixPost; eager?: boolean }) {
  const title = cleanHeadline(post.headline);
  const artwork = artworkFor(post);
  const cat = categoryById(post.category_id);
  const href = articlePath(post);
  const img = artwork ? thumbAttrs(artwork) : null;

  return (
    <li className="flex flex-col gap-2.5">
      {img && (
        <Link
          className="group block aspect-[3/4] overflow-hidden rounded-[16px] bg-mist"
          href={href}
          prefetch={false}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            className="block h-full w-full object-cover object-top transition-transform duration-[350ms] ease-[ease] group-hover:scale-[1.03]"
            src={img.src}
            srcSet={img.srcset}
            sizes={THUMB_SIZES}
            alt=""
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            decoding="async"
          />
        </Link>
      )}
      <h2 className="text-[15.5px] leading-[1.35] font-semibold tracking-[-0.01em]">
        <Link href={href} prefetch={false} className="text-ink no-underline hover:text-brand">
          {title}
        </Link>
      </h2>
      <p className="flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
        <time dateTime={new Date(post.published_at).toISOString()}>{formatDate(post.published_at)}</time>
        {cat && (
          <Link href={hubPath(cat)} className="font-semibold text-brand no-underline">
            {cat.label}
          </Link>
        )}
      </p>
    </li>
  );
}
