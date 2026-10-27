"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBooted } from "@/lib/studio/boot";
import type { Story } from "@/lib/studio/types";

/* Alternate reading lenses on the front-page cards ("✦ Explain like I'm
 * 5", …). Picking one swaps the card's text in place: the brief and every
 * lens share ONE content box that crossfades and glides to the new height,
 * so the card stays put and only its content changes. */
const rb = { fontVariationSettings: '"wdth" 100' };

export type LensId = "eli5" | "tldr" | "key_numbers" | "deep_dive";
export type Lens = readonly [id: LensId, label: string];

const LENSES: Lens[] = [
  ["eli5", "Explain like I'm 5"],
  ["tldr", "60-sec TL;DR"],
  ["key_numbers", "Key numbers"],
  ["deep_dive", "Deep dive"],
];

export function availableLenses(item: Story): Lens[] {
  const v = item.versions || {};
  return LENSES.filter(([id]) => {
    const value = v[id];
    return id === "tldr" || id === "key_numbers"
      ? Array.isArray(value) && value.length > 0
      : typeof value === "string" && value.trim().length > 0;
  });
}

/* the whole brief (55-85 words) — no "Read more" */
export function Excerpt({ item }: { item: Story }) {
  return (
    <p className="font-roboto text-[14px] leading-[22px] text-lm-600" style={rb}>
      {item.body || item.summary || ""}
    </p>
  );
}

/* A tiny confetti of dots + ✦ sparks that bursts out of a lens pill when
 * it's activated. Unmounts via the parent's burst key changing. */
const PARTICLE_COLORS = ["#7900D9", "#141417", "#C49F17", "#0F9D69", "#E33B3B"];
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + (i % 3) * 0.4;
  const dist = 26 + ((i * 7919) % 24);
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    c: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    s: 3 + (i % 3) * 1.5,
    star: i % 5 === 0,
    d: 0.5 + (i % 4) * 0.09,
  };
});

function ParticleBurst() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-10" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.15, rotate: p.star ? 180 : 0 }}
          transition={{ duration: p.d, ease: "easeOut" }}
          style={p.star ? { color: p.c, fontSize: 11, lineHeight: 1 } : { width: p.s, height: p.s, borderRadius: 9999, background: p.c }}
        >
          {p.star ? "✦" : null}
        </motion.span>
      ))}
    </span>
  );
}

export function LensPills({
  lenses,
  active,
  onPick,
  compact = false,
}: {
  lenses: Lens[];
  active: LensId | null;
  onPick: (id: LensId | null) => void;
  compact?: boolean;
}) {
  /* bumps on every activation so the burst re-fires even on the same pill */
  const [burst, setBurst] = useState<{ id: LensId; n: number } | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-[6px]" onClick={(e) => e.stopPropagation()}>
      <span className="font-roboto text-[12px] font-bold uppercase tracking-wide text-lm-400" style={rb}>
        ✦
      </span>
      {lenses.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const next = active === id ? null : id;
            if (next) setBurst({ id, n: (burst?.n || 0) + 1 });
            onPick(next);
          }}
          className={`relative rounded-[100px] border font-bevietnam font-semibold transition-all duration-200 active:scale-95 ${
            compact ? "px-[10px] py-[4px] text-[11px]" : "px-[12px] py-[5px] text-[12px]"
          } ${
            active === id ? "border-lm-800 bg-lm-800 text-white shadow-sm" : "border-lm-300 bg-white text-lm-500 hover:border-lm-500 hover:text-lm-800"
          }`}
        >
          {burst && burst.id === id && active === id && <ParticleBurst key={burst.n} />}
          {label}
        </button>
      ))}
    </div>
  );
}

const swapTransition = { duration: 0.34, ease: [0.22, 1, 0.36, 1] } as const;

function LensBody({ item, lens }: { item: Story; lens: LensId }) {
  const v = item.versions || {};
  const label = (LENSES.find(([id]) => id === lens) || [])[1] || "";
  const bullets = lens === "tldr" ? v.tldr : lens === "key_numbers" ? v.key_numbers : null;
  const text = lens === "eli5" ? v.eli5 : lens === "deep_dive" ? v.deep_dive : "";
  const paragraphs = String(text || "")
    .split(/\n{2,}/)
    .filter(Boolean);
  const tcls = "text-[14px] leading-[22px]";
  return (
    <div className="flex flex-col gap-[8px]" onClick={(e) => e.stopPropagation()}>
      <span
        className="inline-flex w-fit items-center gap-[5px] rounded-full bg-[rgba(121,0,217,0.08)] px-[9px] py-[3px] font-roboto text-[10px] font-bold uppercase tracking-[0.06em] text-[#7900D9]"
        style={rb}
      >
        ✦ {label}
      </span>
      {bullets ? (
        <ul className="flex flex-col gap-[8px]">
          {bullets.map((b, i) => (
            <li key={i} className={`flex items-start gap-[10px] font-roboto ${tcls} text-lm-700`} style={rb}>
              <span className="mt-[8px] size-[6px] shrink-0 rounded-full bg-[#7900D9]" />
              {b}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-[8px]">
          {paragraphs.map((p, i) => (
            <p key={i} className={`font-roboto ${tcls} text-lm-700`} style={rb}>
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* the brief and its lenses share one box; keyed remount crossfades between
 * them (no exit animation, as across the app) while `layout` glides the
 * height */
export function ContentSwap({ item, lens, minH, children }: { item: Story; lens: LensId | null; minH: number; children: React.ReactNode }) {
  const booted = useBooted();
  return (
    <motion.div layout transition={{ layout: swapTransition }} className="relative" style={{ minHeight: minH }}>
      <motion.div key={lens || "original"} initial={booted ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={swapTransition}>
        {lens ? <LensBody item={item} lens={lens} /> : children}
      </motion.div>
    </motion.div>
  );
}
