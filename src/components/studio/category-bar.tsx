"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

/* Sticky reading toolbar — sits under the fixed nav. Liquid-glass
 * treatment: the strip is translucent with heavy blur + saturation so
 * stories scrolling beneath refract through; the pill row is a frosted
 * capsule with a bright inner top-edge highlight, and the ACTIVE pill is a
 * glossy #3979FF lozenge that GLIDES between labels (framer `layoutId`).
 * News Studio passes its topic sections and its masthead. */
export type FeedFilter = readonly [id: string, label: string];

const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };

/* Expanding search — a frosted glass circle holding a magnifier that
 * springs open into a full glass capsule. Stays open while it holds text;
 * Escape or × clears and collapses. */
const searchSpring = { type: "spring", stiffness: 420, damping: 36 } as const;

function StudioSearch({ value = "", onSearch }: { value?: string; onSearch?: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = focused || value.trim().length > 0;
  return (
    <motion.div
      role="search"
      initial={false}
      animate={{ width: open ? 250 : 41 }}
      transition={searchSpring}
      onClick={() => inputRef.current?.focus()}
      className={`ml-auto flex h-[41px] shrink-0 items-center overflow-hidden rounded-[100px] border backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-200 ${
        open
          ? "border-[#3979FF]/40 bg-white/80 shadow-[0_2px_14px_rgba(57,121,255,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]"
          : "cursor-pointer border-white/50 bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_12px_rgba(15,15,17,0.05)] hover:bg-white/60"
      }`}
    >
      <span className="flex size-[39px] shrink-0 items-center justify-center" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6.8" cy="6.8" r="4.6" stroke={open ? "#3979FF" : "#0F0F11"} strokeWidth="1.8" className="transition-colors duration-200" />
          <path d="M10.4 10.4 14 14" stroke={open ? "#3979FF" : "#0F0F11"} strokeWidth="1.8" strokeLinecap="round" className="transition-colors duration-200" />
        </svg>
      </span>
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder="Search stories…"
        aria-label="Search stories"
        value={value}
        onChange={(e) => onSearch?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onSearch?.("");
            e.currentTarget.blur();
          }
        }}
        className="h-full min-w-0 flex-1 border-0 bg-transparent pr-[6px] font-bevietnam text-[13px] font-medium text-[#0F0F11] outline-hidden placeholder:text-lm-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        style={{ appearance: "none", WebkitAppearance: "none" }}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          /* mousedown (not click) so the input never blurs mid-clear */
          onMouseDown={(e) => {
            e.preventDefault();
            onSearch?.("");
          }}
          className="mr-[8px] flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#3979FF]/10 text-[13px] leading-none text-[#3979FF] transition-colors hover:bg-[#3979FF] hover:text-white"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

export function CategoryBar({
  filter = "all",
  onFilter,
  filters,
  title,
  search,
  onSearch,
  lifted = false,
}: {
  filter?: string;
  onFilter?: (id: string) => void;
  filters: readonly FeedFilter[];
  title?: string;
  search?: string;
  onSearch?: (v: string) => void;
  /* rides up into the space the main nav vacates on scroll */
  lifted?: boolean;
}) {
  return (
    <div
      className={`sticky z-40 border-b border-white/30 bg-white/30 shadow-[0_8px_32px_rgba(15,15,17,0.05)] backdrop-blur-2xl backdrop-saturate-150 transition-[top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        lifted ? "top-0" : "top-[70px]"
      }`}
    >
      {/* top-edge light catch — the "glass lip" */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r/srgb from-transparent via-white/80 to-transparent" aria-hidden="true" />
      {/* scrollable on small screens so the pill row never forces page overflow */}
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-[14px] overflow-x-auto px-4 py-[12px] [scrollbar-width:none] sm:gap-[22px] sm:px-8 sm:py-[14px] lg:px-[32px] [&::-webkit-scrollbar]:hidden">
        {title && (
          /* masthead lockup: quiet first word, confident second, and a blue
             full-stop tying it to the active pill */
          <h1 className="shrink-0 select-none whitespace-nowrap text-[21px] leading-none tracking-[-0.02em] sm:text-[24px]" style={serif}>
            <span className="font-normal text-lm-500">News</span>
            <span className="font-bold text-[#0F0F11]">Studio</span>
            <span className="font-bold text-[#3979FF]">.</span>
          </h1>
        )}
        <div className="relative flex shrink-0 items-center gap-[2px] rounded-[100px] border border-white/50 bg-white/35 p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(15,15,17,0.04),0_2px_12px_rgba(15,15,17,0.05)] backdrop-blur-xl sm:gap-[4px] sm:p-[5px]">
          {filters.map(([id, label]) => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFilter?.(id)}
                className={`relative whitespace-nowrap rounded-[100px] px-[13px] py-[7px] font-bevietnam text-[13px] font-semibold transition-colors duration-200 sm:px-[20px] sm:py-[9px] sm:text-[15px] ${
                  isActive ? "text-white" : "text-lm-600 hover:text-black"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="lm-filter-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    className="absolute inset-0 rounded-[100px] bg-linear-to-b/srgb from-[#5D93FF] to-[#3979FF] shadow-[0_4px_14px_rgba(57,121,255,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-[1]">{label}</span>
              </button>
            );
          })}
        </div>
        {onSearch && <StudioSearch value={search} onSearch={onSearch} />}
      </div>
    </div>
  );
}
