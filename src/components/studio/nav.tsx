"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { NAV } from "@/lib/site";
import { useDrawer } from "./drawer-context";

/* Top nav — the same bar as the main site nav: logo + "Stories that mattr"
 * tagline, the site links, white glass. Only the right side is News
 * Studio's own: the Subscribe (drawer) pill. */
const GLOW = "/news-studio/figma/nav-button-glow.svg";

function Glow() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-[-70px] top-[63px] h-[8px] w-[251px]">
      <img alt="" src={GLOW} className="block size-full max-w-none" />
    </span>
  );
}

/* `collapsed` slides the whole bar out of view once the reader has
 * scrolled — the feed passes it so its sticky toolbar becomes the top-most
 * chrome while reading. Never collapses while the mobile menu is open. */
export function StudioNav({ collapsed = false }: { collapsed?: boolean }) {
  const { openSubscribe } = useDrawer();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* keep the bar put while the mobile sheet is open */
  const hidden = collapsed && !mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white/[.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] min-[901px]:bg-white/[.85] min-[901px]:backdrop-blur-[14px] ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex h-[70px] items-center justify-between px-[clamp(16px,5vw,28px)] min-[901px]:px-[56px]">
        <Link href="/" aria-label="dailymattr home" className="flex flex-col items-center justify-center gap-[2px]">
          <img src="/assets/publisher-logo.png" width="156" height="32" alt="dailymattr" className="block h-[32px] w-[156px] flex-none" />
          <span className="block whitespace-nowrap text-center font-bevietnam text-[7.7px] font-medium uppercase leading-[12px] tracking-[1px] text-[#3979ff]">
            Stories that mattr
          </span>
        </Link>

        {/* Center links — desktop */}
        <nav className="hidden gap-[6px] min-[901px]:flex">
          {NAV.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="inline-flex items-center rounded-full px-[12px] py-[8px] font-bevietnam text-[13px] font-medium text-lm-500 transition-colors duration-300 hover:bg-[#f1f1f3] hover:text-lm-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right pills */}
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={() => openSubscribe()}
            className="relative hidden items-center justify-center overflow-hidden rounded-[50px] bg-[rgba(28,28,17,0.93)] px-[16px] py-[8px] font-bevietnam text-[14px] font-semibold text-white sm:flex"
          >
            <Glow />
            Subscribe
          </button>
          {/* Mobile menu trigger */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-[34px] items-center justify-center rounded-[50px] border border-lm-400 min-[901px]:hidden"
          >
            <span className="flex flex-col gap-[4px]">
              <span className="h-[1.5px] w-[14px] bg-lm-800" />
              <span className="h-[1.5px] w-[14px] bg-lm-800" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu — animated sheet with the nav links */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100dvh-70px)] overflow-y-auto border-t border-lm-200 bg-white min-[901px]:hidden"
          >
            <div className="px-4 pb-8 pt-4">
              {NAV.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-dashed border-lm-200 py-[14px] font-bevietnam text-[17px] font-medium text-lm-800"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
