import Image from "next/image";

/* The three formats. Desktop: a pinned 100vh stage — giant word + colour
 * glow per scene, a masonry wall of app cards (built by choreography.ts),
 * and a liquid-glass copy panel per scene riding up past the locked phone.
 * Phones (≤900px): a sticky stage where three blocks crossfade. */

type Icon = { src: string; width: number; height: number };
const PIX: Icon = { src: "/assets/icon-pix-lightning.png", width: 337, height: 448 };
const QIX: Icon = { src: "/assets/icon-qix.svg", width: 56, height: 56 };
const TRAX: Icon = { src: "/assets/icon-trax.svg", width: 49, height: 44 };

/* each scene glows in its own accent; the first carries the brand blue */
const SCENES = [
  { word: "Articles", glow: "bg-[radial-gradient(circle,rgba(57,121,255,.18)_0%,transparent_62%)]" },
  { word: "Qix", glow: "bg-[radial-gradient(circle,rgba(225,29,72,.14)_0%,transparent_62%)]" },
  { word: "Trax", glow: "bg-[radial-gradient(circle,rgba(139,92,246,.15)_0%,transparent_62%)]" },
];

const COPIES = [
  {
    /* the first panel is visible before the choreography takes over */
    place: "left-[7%]",
    index: "01 — READ",
    icon: PIX,
    title: "Pix",
    body: "100 stories a day, filtered from hundreds of sources — fact-checked and free of bias. Start with an image and just swipe for the full story. Get the context and key details at a glance - without digging through long articles.",
    chips: ["Visual", "Quick", "Swipeable"],
  },
  {
    place: "right-[7%] opacity-0",
    index: "02 — WATCH",
    icon: QIX,
    title: "Qix",
    body: "Our video library has short video explainers on everything worth understanding — history to current affairs, politics to finance. Each one breaks a big topic down with real facts, clear figures, and visuals that make it stick.",
    chips: ["Video", "Explainers", "Simplified"],
  },
  {
    place: "left-[7%] opacity-0",
    index: "03 — LISTEN",
    icon: TRAX,
    title: "Trax",
    body: "Our Audio library has audio explainers that unpack the hard, interesting stuff — a landmark management case study, a dense research paper — step by step, podcast-style. Press play and learn on the move.",
    chips: ["Deep-dive", "Insights", "On the go"],
  },
];

const BLOCKS = [
  {
    screens: [
      { src: "/assets/screen-pix.jpg", alt: "Pix screen" },
      { src: "/assets/screen-pix-2.jpg", alt: "Pix summary screen" },
    ],
    index: "01 — READ",
    icon: PIX,
    title: "Pix",
    body: "Get the full story in just 60 words. Understand what happened, why it matters, and what comes next—without spending hours scrolling through long articles.",
    chips: ["60-word briefs", "Ask AI", "Why it matters"],
  },
  {
    screens: [{ src: "/assets/screen-qix.jpg", alt: "Qix screen" }],
    index: "02 — WATCH",
    icon: QIX,
    title: "Qix",
    body: "Watch the story unfold. Swipeable visual episodes that explain the news in under a minute — from mythology to markets, made to be seen.",
    chips: ["Visual stories", "1-min episodes", "Swipe to explore"],
  },
  {
    screens: [{ src: "/assets/screen-trax.jpg", alt: "Trax screen" }],
    index: "03 — LISTEN",
    icon: TRAX,
    title: "Trax",
    body: "Listen on the move. Audio stories and daily wraps built for commutes, workouts, and everything in between — your news, hands-free.",
    chips: ["Audio stories", "Daily wraps", "Background play"],
  },
];


/* liquid-glass panel — the blur+saturate here is the Safari/Firefox
 * fallback; on Chromium the choreography swaps the backdrop filter for an
 * SVG displacement-map lens. ::before is the specular rim, ::after the
 * sheen from the top-left with a faint blue counter-glow. */
const COPY = [
  "absolute top-1/2 z-6 max-w-[384px] rounded-[22px] border border-solid border-[rgba(255,255,255,.12)] bg-[rgba(14,14,18,.44)] px-[30px] pt-[32px] pb-[30px] text-white shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop-blur-[18px] backdrop-saturate-[1.15] [transform:translateY(-50%)]",
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_rgba(255,255,255,.28),inset_1px_0_0_rgba(255,255,255,.10),inset_-1px_0_0_rgba(255,255,255,.10),inset_0_-1px_0_rgba(255,255,255,.06)] before:content-['']",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(130%_70%_at_18%_-12%,rgba(255,255,255,.15)_0%,transparent_55%),radial-gradient(90%_50%_at_88%_112%,rgba(57,121,255,.16)_0%,transparent_60%)] after:content-['']",
  /* 620–900px: copy centred instead of stretched edge to edge */
  "[@media(min-width:620px)_and_(max-width:900px)]:text-center",
].join(" ");

const CHIP =
  "rounded-full border border-solid border-[rgba(57,121,255,.34)] bg-[rgba(57,121,255,.12)] px-[14px] py-[7px] text-[12px] font-medium text-[rgba(255,255,255,.86)]";

function Chips({ items, className }: { items: string[]; className: string }) {
  return (
    <div className={`flex flex-wrap gap-[8px] ${className}`}>
      {items.map((c) => (
        <span key={c} className={CHIP}>
          {c}
        </span>
      ))}
    </div>
  );
}

function FcIcon({ icon, className }: { icon: Icon; className: string }) {
  return <Image width={icon.width} height={icon.height} src={icon.src} alt="" loading="eager" className={`object-contain ${className}`} />;
}

export function Features() {
  return (
    <section id="features" className="bg-coal-2">
      <h2 className="sr-only">Read short news, watch videos and listen to audio explainers</h2>

      <div id="features-pin" className="relative h-screen overflow-hidden mobile:hidden">
        {/* per-scene stages: giant word + colour glow */}
        <div data-rows className="absolute inset-0">
          {SCENES.map((s) => (
            <div key={s.word} data-row-scene className="absolute inset-0 opacity-0 perspective-[1400px]">
              <span
                className={`absolute top-[54%] left-1/2 aspect-square w-[min(72vw,940px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] ${s.glow} mobile:w-[min(86vw,620px)] mobile:filter-none`}
              />
              <div
                aria-hidden="true"
                className="absolute top-[6%] left-1/2 -translate-x-1/2 text-[clamp(110px,15vw,220px)] font-extrabold tracking-[-3px] whitespace-nowrap text-[#1b1b1f] select-none mobile:top-[8%] mobile:text-[26vw]"
              >
                {s.word}
              </div>
            </div>
          ))}
        </div>

        {/* ONE tall edge-to-edge masonry wall of app cards behind the locked
            phone; scroll only moves this wall (cards built by the script) */}
        <div data-masonry aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div data-masonry-track className="absolute top-0 right-0 left-0 will-change-transform" />
        </div>

        <div
          data-stage-veil
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-coal-2)_0%,transparent_14%,transparent_82%,var(--color-coal-2)_100%),radial-gradient(46%_40%_at_50%_44%,rgba(122,122,146,.16)_0%,transparent_68%),radial-gradient(120%_100%_at_50%_52%,transparent_0%,transparent_58%,rgba(13,13,15,.72)_100%)] mobile:bg-[linear-gradient(180deg,var(--color-coal-2)_0%,transparent_12%,transparent_84%,var(--color-coal-2)_100%),radial-gradient(56%_36%_at_50%_38%,rgba(122,122,146,.18)_0%,transparent_70%),radial-gradient(130%_100%_at_50%_46%,transparent_0%,transparent_56%,rgba(13,13,15,.72)_100%)]"
        />

        {/* feature copy panels */}
        {COPIES.map((c) => (
          <div key={c.title} data-feature-copy className={`${COPY} ${c.place}`}>
            {/* the index gets an editorial rule line trailing off */}
            <span className="mb-[16px] flex items-center gap-[14px] text-[12px] font-semibold tracking-[3px] text-[rgba(255,255,255,.42)] after:h-[1px] after:flex-1 after:bg-[linear-gradient(90deg,rgba(255,255,255,.22),transparent)] after:content-[''] mobile:mb-[10px]">
              {c.index}
            </span>
            <h3 className="flex items-center gap-[14px] text-[42px] font-semibold tracking-[-.5px] mobile:text-[clamp(26px,7vw,36px)] [@media(min-width:620px)_and_(max-width:900px)]:justify-center">
              <FcIcon icon={c.icon} className="size-[48px] mobile:size-[clamp(30px,8vw,38px)]" />
              {c.title}
            </h3>
            <p className="mt-[18px] text-[15px] leading-[1.75] text-[rgba(255,255,255,.88)] mobile:text-[14px]">{c.body}</p>
            <Chips items={c.chips} className="mt-[24px] mobile:mt-[16px] [@media(min-width:620px)_and_(max-width:900px)]:justify-center" />
          </div>
        ))}

        <div data-scene-progress className="absolute right-[48px] bottom-[42px] z-7 flex items-center gap-[22px]">
          {COPIES.map((c, i) => (
            <span
              key={c.title}
              data-scene-dot
              data-active={i === 0 ? "" : undefined}
              className="group/dot flex flex-row-reverse items-center gap-[10px] text-[12px] font-semibold tracking-[.8px] text-[rgba(255,255,255,.32)] [transition:color_.35s_ease] data-[active]:text-white"
            >
              <i className="block h-[2px] w-[20px] rounded-[2px] bg-current [transition:width_.35s_ease] group-data-[active]/dot:w-[34px] group-data-[active]/dot:bg-brand" />
              {c.title}
            </span>
          ))}
        </div>
      </div>

      {/* phones: sticky stage (compositor-native) where the three feature
          blocks crossfade as you scroll */}
      <div data-features-mobile className="relative hidden h-[280vh] mobile:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          {BLOCKS.map((b) => (
            <div
              key={b.title}
              data-fm-block
              className="absolute inset-0 flex flex-col items-center justify-center px-[clamp(20px,6vw,40px)] pt-[calc(var(--spacing-nav)+10px)] pb-[34px] text-center text-white opacity-0"
            >
              {/* compact phone so the text always fits on the same screen */}
              <div className="mx-auto mb-[clamp(16px,3vh,26px)] w-[min(178px,44vw)] flex-none overflow-hidden rounded-[24px] border-[5px] border-solid border-[#ececf0] bg-black shadow-[0_14px_30px_rgba(0,0,0,.45)]">
                {b.screens.length > 1 ? (
                  /* Pix: both screens side by side, scrubbed left by the scroll */
                  <div data-fm-strip className="flex w-[200%] will-change-transform">
                    {b.screens.map((s) => (
                      <Image key={s.src} width={900} height={2045} src={s.src} alt={s.alt} className="block h-auto w-1/2" />
                    ))}
                  </div>
                ) : (
                  <Image width={900} height={2045} src={b.screens[0].src} alt={b.screens[0].alt} className="block h-auto w-full" />
                )}
              </div>
              <span className="mb-[16px] block text-[12px] font-semibold tracking-[3px] text-[rgba(255,255,255,.42)] mobile:mb-[10px]">{b.index}</span>
              <h3 className="flex items-center justify-center gap-[10px] text-[clamp(24px,6.6vw,32px)] font-semibold tracking-[-.5px]">
                <FcIcon icon={b.icon} className="size-[44px]" />
                {b.title}
              </h3>
              <p className="mx-auto mt-[12px] max-w-[30rem] text-[14px] leading-[1.7] text-[rgba(255,255,255,.86)]">{b.body}</p>
              <Chips items={b.chips} className="mt-[16px] justify-center" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
