"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DOWNLOAD_URL, NAV } from "@/lib/site";
import { pill } from "./pill";

/* the legal pages carry the account button instead of the tagline */
const ACCOUNT_PAGES = new Set(["/privacypolicy", "/termsandconditions", "/editorialguidelines"]);
const ACTIVE: Record<string, string> = { "/": "/", "/newsletter": "/newsletter/", "/support": "/support/", "/news": "/news/" };

const strip = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/* The fixed top bar of the marketing pages and /news. On the homepage the
 * links are in-page anchors (smooth-scrolled by the homepage's Lenis), and
 * its scroll choreography adds `nav-dark` to the header once the black
 * panel fills the screen — every dark style below hangs off that class. */
export function SiteNav() {
  const path = strip(usePathname() || "/");
  const home = path === "/";
  const account = ACCOUNT_PAGES.has(path);
  const active = ACTIVE[path.startsWith("/news/") ? "/news" : path];

  return (
    <header
      data-site-nav
      className={cn(
        /* right-scroll-bar-position: keeps the bar from widening while a Radix
         * menu (support topic) locks page scroll */
        "right-scroll-bar-position group/nav fixed inset-x-0 top-0 z-60 flex h-nav items-center justify-between bg-white/85 px-14 backdrop-blur-[14px] transition-[background] duration-[450ms] ease-in-out will-change-transform",
        "[&.nav-dark]:bg-[rgba(12,12,14,.68)]",
        "mobile:bg-white/94 mobile:px-[clamp(16px,5vw,28px)] mobile:backdrop-blur-none mobile:[&.nav-dark]:bg-[rgba(12,12,14,.92)]",
      )}
    >
      {home ? (
        <a className="flex flex-col items-center justify-center gap-0.5" href="#top">
          <Logo />
          <Tagline />
        </a>
      ) : (
        <Link className="flex flex-col items-center justify-center gap-0.5" href="/">
          <Logo />
          {!account && <Tagline />}
        </Link>
      )}

      <nav className="flex gap-1.5 mobile:hidden">
        {NAV.map((n) => {
          const className = cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium text-ink-soft transition-[color,background] duration-300 ease-in-out hover:bg-[#f1f1f3] hover:text-ink",
            "group-[.nav-dark]/nav:text-white/60 group-[.nav-dark]/nav:hover:bg-white/10 group-[.nav-dark]/nav:hover:text-white",
            /* active: blue-outlined pill (Figma nav) */
            "data-active:bg-white data-active:text-brand data-active:shadow-[inset_0_0_0_1.5px_var(--color-brand)]",
            "group-[.nav-dark]/nav:data-active:bg-transparent group-[.nav-dark]/nav:data-active:text-brand-soft group-[.nav-dark]/nav:data-active:shadow-[inset_0_0_0_1.5px_var(--color-brand-soft)]",
          );
          const isActive = n.href === active ? true : undefined;
          return home && n.home ? (
            <a key={n.href} href={n.home} className={className} data-active={isActive}>
              {n.label}
            </a>
          ) : (
            <Link key={n.href} href={n.href} className={className} data-active={isActive}>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <a className={pill({ variant: "brand", shine: true })} href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
          Download App
        </a>
        {account && (
          <Link className={pill({ variant: "avatar" })} href="/#top" aria-label="Account">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4.5 20c1.6-3.2 4.4-5 7.5-5s5.9 1.8 7.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}

function Logo() {
  return <Image src="/assets/publisher-logo.png" width={156} height={32} alt="dailymattr" priority className="block h-8 w-[156px] flex-none" />;
}

function Tagline() {
  return (
    <span className="block whitespace-nowrap text-center font-sans text-[7.7px] leading-3 font-medium tracking-[1px] text-brand uppercase">
      Stories that mattr
    </span>
  );
}
