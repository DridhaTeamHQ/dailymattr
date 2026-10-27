import Link from "next/link";
import { hubPath } from "@/lib/categories";
import { slideAttrs, SLIDE_SIZES } from "@/lib/news/media";
import type { ArticleSeo } from "@/lib/news/seo";
import type { Neighbours, PixPost } from "@/lib/news/types";
import { AUTHOR } from "@/lib/site";
import { articlePath, cleanHeadline } from "@/lib/slug";
import { formatDate, hostnameOf, truncateAtWord } from "@/lib/text";
import { AppCta } from "./app-cta";
import { Breadcrumbs } from "./breadcrumbs";
import { PixCarousel } from "./pix-carousel";
import { StoryNav, StoryStepLink } from "./story-nav";

/* The article: cards on the left, words on the right. On phones the card is
 * pinned below the nav and the text slides up over it as a sheet — the way a
 * story reads in the app — and the previous/next arrows sit in a bar along
 * the bottom, within thumb reach (the bar is the article's ::after; the page
 * gets bottom padding in the layout so nothing ends up underneath it). */

const article =
  "mx-auto w-[min(1120px,100%_-_40px)] [@media(max-width:860px)]:w-full [@media(max-width:860px)]:after:fixed [@media(max-width:860px)]:after:inset-x-0 [@media(max-width:860px)]:after:bottom-0 [@media(max-width:860px)]:after:z-[39] [@media(max-width:860px)]:after:h-[calc(74px_+_env(safe-area-inset-bottom))] [@media(max-width:860px)]:after:border-t [@media(max-width:860px)]:after:border-mist [@media(max-width:860px)]:after:bg-paper [@media(max-width:860px)]:after:content-['']";

const layout =
  "grid grid-cols-[minmax(280px,400px)_minmax(0,1fr)] items-start gap-[clamp(28px,4vw,64px)] [@media(max-width:860px)]:block";

/* the cards stay in view while the reader scrolls the text beside them; on
   a phone the box is pinned and darkened at its foot to ground the sheet */
const media =
  "sticky top-[calc(var(--spacing-nav)_+_20px)] [@media(max-width:860px)]:top-nav [@media(max-width:860px)]:z-0 [@media(max-width:860px)]:h-[calc(76svh_-_var(--spacing-nav))] [@media(max-width:860px)]:overflow-hidden [@media(max-width:860px)]:bg-coal [@media(max-width:860px)]:after:pointer-events-none [@media(max-width:860px)]:after:absolute [@media(max-width:860px)]:after:inset-x-0 [@media(max-width:860px)]:after:bottom-0 [@media(max-width:860px)]:after:h-24 [@media(max-width:860px)]:after:bg-[linear-gradient(to_bottom,rgba(10,10,11,0),rgba(10,10,11,.55))] [@media(max-width:860px)]:after:content-['']";

/* on a phone: paints above the pinned card, overlaps it a little so its edge
   shows on first paint, and carries a grab handle */
const text =
  "min-w-0 [@media(max-width:860px)]:relative [@media(max-width:860px)]:z-[1] [@media(max-width:860px)]:-mt-7 [@media(max-width:860px)]:rounded-t-[26px] [@media(max-width:860px)]:bg-paper [@media(max-width:860px)]:px-5 [@media(max-width:860px)]:pt-[30px] [@media(max-width:860px)]:pb-10 [@media(max-width:860px)]:shadow-[0_-14px_34px_rgba(10,10,11,.22)] [@media(max-width:860px)]:before:mx-auto [@media(max-width:860px)]:before:-mt-3 [@media(max-width:860px)]:before:mb-5 [@media(max-width:860px)]:before:block [@media(max-width:860px)]:before:h-1 [@media(max-width:860px)]:before:w-10 [@media(max-width:860px)]:before:rounded-[2px] [@media(max-width:860px)]:before:bg-mist [@media(max-width:860px)]:before:content-['']";

const metaLink = "font-semibold text-brand no-underline";

/* beside the story on a desktop, in the bottom bar on a phone */
const arrow =
  "fixed z-40 grid size-12 place-items-center rounded-full border border-mist bg-paper text-[26px] leading-none text-ink no-underline shadow-[0_6px_22px_rgba(10,10,11,.10)] transition-[transform,border-color] duration-[180ms] ease-[ease] hover:border-ink [@media(min-width:861px)]:top-1/2 [@media(min-width:861px)]:[transform:translateY(-50%)] [@media(min-width:861px)]:hover:[transform:translateY(-50%)_scale(1.06)] [@media(max-width:860px)]:bottom-[calc(15px_+_env(safe-area-inset-bottom))] [@media(max-width:860px)]:size-11 [@media(max-width:860px)]:shadow-none";
const arrowSide = {
  prev: "left-[clamp(8px,2vw,26px)] [@media(max-width:860px)]:left-4",
  next: "right-[clamp(8px,2vw,26px)] [@media(max-width:860px)]:right-4",
};

const stepCard = "rounded-[16px] border border-mist px-4 py-3.5 text-ink no-underline hover:border-ink";

/* the rest of the run as plain links: every neighbour is a real anchor, which
   is how a crawler walks from story to story, and how the page still works
   with JavaScript off */
function MoreList({ posts, heading }: { posts: PixPost[]; heading: string }) {
  if (!posts.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-[11.5px] font-semibold tracking-[.1em] text-ink-soft uppercase">{heading}</h2>
      <ul className="grid list-none gap-[11px]">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              href={articlePath(p)}
              prefetch={false}
              className="text-[14.5px] leading-[1.45] font-medium text-ink no-underline hover:text-brand"
            >
              {truncateAtWord(cleanHeadline(p.headline), 90)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleView({ post, seo, neighbours }: { post: PixPost; seo: ArticleSeo; neighbours: Neighbours }) {
  const { title, heroImages, points, cat, source } = seo;
  const { older, newer } = neighbours;
  /* one step back and one step forward — what the arrows and the keys follow */
  const prev = older[0] ?? null;
  const next = newer[0] ?? null;
  const prevPath = prev ? articlePath(prev) : null;
  const nextPath = next ? articlePath(next) : null;

  const slides = heroImages.map((h, i) => {
    const img = slideAttrs(h.url);
    return {
      src: img.src,
      srcSet: img.srcset,
      alt: `${title}${heroImages.length > 1 ? ` — card ${i + 1} of ${heroImages.length}` : ""}`,
      artwork: h.artwork,
    };
  });

  return (
    <StoryNav prev={prevPath} next={nextPath}>
      <article className={article}>
        <Breadcrumbs trail={seo.trail} className="[@media(max-width:860px)]:px-5" />
        <div className={layout}>
          <div className={media}>{slides.length > 0 && <PixCarousel slides={slides} sizes={SLIDE_SIZES} />}</div>

          <div className={text}>
            <h1 className="text-[length:clamp(25px,3.2vw,38px)] leading-[1.18] font-bold tracking-[-0.02em]">{title}</h1>
            <p className="mt-3.5 mb-[26px] flex flex-wrap items-center gap-2 text-[13.5px] text-ink-soft">
              <span>
                By{" "}
                <Link href={AUTHOR.path} rel="author" className={metaLink}>
                  {AUTHOR.name}
                </Link>
              </span>
              <time dateTime={seo.publishedIso}>{formatDate(post.published_at)}</time>
              {cat && (
                <Link href={hubPath(cat)} className={metaLink}>
                  {cat.label}
                </Link>
              )}
            </p>

            {/* the same words the card carries as pixels, as real text: this
                is what search engines and screen readers read */}
            <div>
              <ul className="grid list-none gap-3.5">
                {points.map((p, i) => (
                  <li
                    key={i}
                    className="relative pl-5 text-[16.5px] leading-[1.6] before:absolute before:top-[11px] before:left-0.5 before:size-1.5 before:rounded-full before:bg-brand before:content-['']"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {source && (
              <p className="mt-[26px] text-[13.5px] text-ink-soft">
                Source:{" "}
                <a href={source} target="_blank" rel="noopener nofollow" className="text-brand">
                  {hostnameOf(source)}
                </a>
              </p>
            )}

            <AppCta />

            {(prev || next) && (
              <nav className="mt-[34px] mb-[30px] grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3" aria-label="Previous and next story">
                {prev && prevPath && (
                  <StoryStepLink dir="prev" href={prevPath} className={stepCard}>
                    <small className="mb-1.5 block text-[11.5px] tracking-[.08em] text-ink-soft uppercase">Previous</small>
                    <span className="text-[14.5px] leading-[1.4] font-semibold">{truncateAtWord(cleanHeadline(prev.headline), 85)}</span>
                  </StoryStepLink>
                )}
                {next && nextPath && (
                  <StoryStepLink dir="next" href={nextPath} className={stepCard}>
                    <small className="mb-1.5 block text-[11.5px] tracking-[.08em] text-ink-soft uppercase">Next</small>
                    <span className="text-[14.5px] leading-[1.4] font-semibold">{truncateAtWord(cleanHeadline(next.headline), 85)}</span>
                  </StoryStepLink>
                )}
              </nav>
            )}

            {(older.length > 0 || newer.length > 0) && (
              <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-x-[clamp(24px,4vw,56px)] gap-y-[22px] border-t border-mist pt-6">
                <MoreList posts={newer} heading="Newer" />
                <MoreList posts={older} heading="Older" />
              </div>
            )}
          </div>
        </div>

        {prev && prevPath && (
          <StoryStepLink
            dir="prev"
            href={prevPath}
            className={`${arrow} ${arrowSide.prev}`}
            label={`Previous story: ${truncateAtWord(cleanHeadline(prev.headline), 60)}`}
          >
            <span aria-hidden="true">‹</span>
          </StoryStepLink>
        )}
        {next && nextPath && (
          <StoryStepLink
            dir="next"
            href={nextPath}
            className={`${arrow} ${arrowSide.next}`}
            label={`Next story: ${truncateAtWord(cleanHeadline(next.headline), 60)}`}
          >
            <span aria-hidden="true">›</span>
          </StoryStepLink>
        )}
      </article>
    </StoryNav>
  );
}
