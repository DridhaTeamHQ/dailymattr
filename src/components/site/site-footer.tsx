import Image from "next/image";
import Link from "next/link";
import { APP_STORE_URL, PLAY_URL, SUPPORT_EMAIL } from "@/lib/site";
import { CATEGORIES, hubPath } from "@/lib/categories";
import { cn } from "@/lib/utils";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dailymattr?stkn=MTF1bzNiZ25kNHJ6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@dailymattr?si=NUS1I012ywyA1c4u",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/dailymattr_news",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.3-8.5L1 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.6 3.9H4.8L17.8 20Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/dailymattr/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.53 2.79-1.53 2.98 0 3.58 1.96 3.58 4.51v5.27Z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61595620943543",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 8.5V6.6c0-.8.2-1.3 1.4-1.3H17V2.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.2H7.5V12h2.8v10h3.7V12h2.8l.4-3.5H14Z" />
      </svg>
    ),
  },
];

const colHeading = "mb-[18px] text-[12px] font-semibold tracking-[1.5px] text-[#97979e]";
const colLink = "mb-[13px] block text-[14px] font-medium text-ink hover:underline";

/* The site footer. `home` turns the homepage-section links into in-page
 * anchors; `parentLine` is the "part of Dridha Technologies" line, which
 * the legal pages never carried; About's logo was never a link. */
export function SiteFooter({
  home = false,
  parentLine = true,
  logoLink = true,
}: {
  home?: boolean;
  parentLine?: boolean;
  logoLink?: boolean;
}) {
  const logo = <Image src="/assets/publisher-logo.png" width={156} height={32} alt="dailymattr" className="h-[34px] w-auto" />;
  const section = (hash: string, label: string) =>
    home ? (
      <a href={hash} className={colLink}>{label}</a>
    ) : (
      <Link href={`/${hash}`} className={colLink}>{label}</Link>
    );

  return (
    <footer id="footer" className="overflow-hidden bg-mist pt-[90px] pb-[1vw] mobile:pt-[clamp(60px,9vh,90px)] mobile:pb-[clamp(10px,1vw,20px)]">
      <div className="flex flex-nowrap items-start justify-between gap-[clamp(32px,4vw,80px)] px-[6.5vw] mobile:flex-col mobile:gap-10 mobile:px-[clamp(20px,6vw,34px)]">
        {/* shrinks faster than the link columns, so the four columns keep a
            single row for as long as they can */}
        <div className="min-w-[230px] flex-[0_4_380px] mobile:min-w-0 mobile:flex-[0_1_auto]">
          <p className="flex flex-wrap items-center gap-3 text-[24px] font-bold tracking-[-.5px]">
            {logoLink ? <Link className="inline-flex" href="/">{logo}</Link> : logo}
            <span>your deeper read.</span>
          </p>
          <p className="mt-[22px] max-w-[360px] text-[15px] leading-[1.7] text-ink-soft">
            dailymattr brings you the story behind the headline - with context, clarity, and perspective that help you understand what really matters.
          </p>
          {parentLine && (
            <p className="mt-[14px] text-[clamp(11px,.85vw,13px)] font-medium tracking-[.2px] whitespace-nowrap text-ink-soft">
              <span className="text-brand">dailymattr</span> is a part of{" "}
              <span className="text-[10px] font-bold whitespace-nowrap text-brand-deep">DRIDHA TECHNOLOGIES PRIVATE LIMITED</span>
            </p>
          )}
          <nav className="mt-[22px] flex flex-wrap gap-2.5" aria-label="Social media">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} (opens in a new tab)`}
                title={s.label}
                className="inline-flex size-11 items-center justify-center rounded-full border border-solid border-current text-ink transition-[color,background-color] duration-200 hover:bg-white hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                {s.icon}
              </a>
            ))}
          </nav>
        </div>

        {/* last column sizes to the support email so it never wraps */}
        <div className="grid min-w-0 flex-[1_1_auto] grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-x-[clamp(18px,2.2vw,48px)] gap-y-[30px] mobile:flex mobile:flex-[0_1_auto] mobile:flex-wrap mobile:justify-start mobile:gap-[clamp(32px,10vw,90px)]">
          <div className="min-w-0">
            <h4 className={colHeading}>PRODUCT</h4>
            {home ? <a href="#top" className={colLink}>Home</a> : <Link href="/" className={colLink}>Home</Link>}
            <Link href="/about/" className={colLink}>About Us</Link>
            <Link href="/author/dailymattr-editorial-team/" className={colLink}>Editorial Team</Link>
            {section("#showcase", "What we do")}
            {section("#features", "Our features")}
            <Link href="/newsletter/" className={colLink}>Newsletter</Link>
            <Link href="/support/" className={colLink}>Support</Link>
            <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className={cn(colLink, "text-[12.5px] tracking-[-.15px] whitespace-nowrap")}>
              Android App (Google Play)
            </a>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className={cn(colLink, "text-[12.5px] tracking-[-.15px] whitespace-nowrap")}>
              iOS App (App Store)
            </a>
          </div>
          <div className="min-w-0">
            <h4 className={colHeading}>NEWS</h4>
            <Link href="/news/" className={colLink}>Latest</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={hubPath(c)} className={colLink}>{c.label}</Link>
            ))}
          </div>
          <div className="min-w-0">
            <h4 className={colHeading}>LEGAL</h4>
            <Link href="/editorialguidelines/" className={colLink}>Editorial Guidelines</Link>
            <Link href="/privacypolicy/" className={colLink}>Privacy Policy</Link>
            <Link href="/termsandconditions/" className={colLink}>Terms &amp; Conditions</Link>
          </div>
          <div className="min-w-0">
            <h4 className={colHeading}>SUPPORT</h4>
            <Link href="/support/" className={colLink}>Get help</Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={cn(colLink, "text-[13px] whitespace-nowrap")}>{SUPPORT_EMAIL}</a>
          </div>
        </div>
      </div>

      <p className="mt-10 px-[6.5vw] text-right text-[17px] font-medium text-ink-soft mobile:px-[clamp(20px,6vw,34px)] mobile:text-left">
        © 2026 <span className="text-[19px] font-extrabold tracking-[-.3px] text-brand">DRIDHA TECHNOLOGIES PRIVATE LIMITED</span>. All rights reserved.
      </p>
      {/* the main brand logo (same asset as the navbar), scaled to a giant
          footer signature */}
      <div data-footer-wordmark className="mt-[70px] -mb-[1vw] flex w-full justify-center" aria-hidden="true">
        <Image src="/assets/publisher-logo.png" width={1560} height={320} alt="" sizes="min(92vw, 1400px)" className="h-auto w-[min(92vw,1400px)]" />
      </div>
    </footer>
  );
}
