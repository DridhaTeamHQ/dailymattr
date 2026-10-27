/* Homepage choreography: Lenis smooth scrolling, the flying phone's scroll
 * journey (hero fan → showcase → pinned features), the pinned feature
 * scenes, the reveals and the intro curtain.
 *
 * It stays imperative — one GSAP timeline per scroll range, measured from
 * the live layout and rebuilt on resize — and is started by <HomeScene>
 * from useGSAP. initHome() returns the teardown, which undoes everything it
 * did outside React: ScrollTriggers, Lenis, ticker callbacks, window
 * listeners, timers, the phone-sequence canvases on <body>, the liquid-glass
 * <svg>, and the class / inline transform it put on the persistent site
 * header. It never removes React-rendered nodes — it hides them.
 *
 * Elements are found through ids and data-* hooks set by the homepage
 * components (see T below), scoped to the page's root element. */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { applyLiquidGlass, removeLiquidGlass } from "./liquid-glass";
import { createPhoneSeq, createPhoneSeqDesktop, type PhoneRenderer, type Pose } from "./phone-seq";


const PHONE_W = 400;
const PHONE_H = 822; // matches the mockup PNG and the baked sequence aspect

/* hooks in the homepage markup */
const T = {
  intro: "#intro",
  introMark: "[data-intro-mark]",
  introLogo: "[data-intro-logo]",
  introTag: "[data-intro-tag]",
  hero: "#hero",
  heroInner: "[data-hero-inner]",
  /* the hero title, sub line and store buttons (in that order) */
  heroRise: "[data-hero-rise]",
  fanItem: "[data-fan-item]",
  anchorHero: "#anchor-hero",
  anchorShow: "#anchor-showcase",
  anchorBack: "#anchor-showback",
  showcase: "#showcase",
  /* the showcase eyebrow + title */
  showcaseReveal: "[data-showcase-reveal]",
  giantWords: "[data-giant-words]",
  features: "#features",
  featuresPin: "#features-pin",
  rowScene: "[data-row-scene]",
  featureCopy: "[data-feature-copy]",
  masonryTrack: "[data-masonry-track]",
  sceneDot: "[data-scene-dot]",
  featuresMobile: "[data-features-mobile]",
  fmBlock: "[data-fm-block]",
  fmStrip: "[data-fm-strip]",
  faq: "#faq",
  faqLeftItems: "[data-faq-left] > *",
  faqItem: "[data-faq-item]",
  footer: "#footer",
  /* the giant logo signature at the bottom of <SiteFooter> — its only
   * direct aria-hidden child */
  footerWordmark: "[data-footer-wordmark]",
  storePill: "[data-store-pill]",
  flyPhone: "#fly-phone",
  fly3d: "[data-fly-3d]",
  /* the persistent site header (outside the page root) */
  nav: "[data-site-nav]",
} as const;

/* masonry card wall (desktop scenes) */
const M_IMGS = [
  "card-matchcenter.jpg", "card-article.jpg", "card-live.jpg",
  "card-xplaind.jpg", "card-home.jpg", "card-pix.jpg",
  "card-readhistory.jpg", "card-qixreels.jpg",
  "card-ai.jpg", "card-qix.jpg", "card-trax.jpg",
  "card-traxplayer.jpg", "card-pixdetails.jpg", "card-qixmore.jpg",
];
// varied card heights (in px at a 300px column) — the masonry rhythm
const M_HEIGHTS = [320, 200, 400, 250, 180, 360, 230, 300, 210, 340];
/* cards are placed with left/top so transforms stay free for the entrance
 * and hover animations; the screenshots are dimmed so the phone + copy stay
 * the heroes of the scene */
const M_CARD_CLASS =
  "group absolute top-0 left-0 overflow-hidden rounded-[12px] shadow-[0_10px_50px_-10px_rgba(0,0,0,.6)] will-change-[transform,opacity]";
const M_IMG_CLASS =
  "h-full w-full object-cover object-top [filter:brightness(.62)_saturate(.85)] [transition:filter_.3s_ease] group-hover:[filter:brightness(.85)_saturate(1)]";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

interface PartialPose {
  x: number;
  y: number;
  scale: number;
  rotZ: number;
}

export interface HomeOptions {
  /** play the loading curtain (first page of a visit only) */
  intro: boolean;
}

export function initHome(root: HTMLElement, { intro: showIntro }: HomeOptions): () => void {
  let disposed = false;
  let introStarted = false;
  const listeners = new AbortController();
  const { signal } = listeners;
  const html = document.documentElement;
  gsap.registerPlugin(ScrollTrigger); // client-only: keeps the module SSR-safe

  /* every timer this page starts, so the teardown can stop them all */
  const timeouts = new Set<ReturnType<typeof setTimeout>>();
  const intervals = new Set<ReturnType<typeof setInterval>>();
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
    return id;
  };
  const cancel = (id: ReturnType<typeof setTimeout> | undefined) => {
    if (id === undefined) return;
    clearTimeout(id);
    timeouts.delete(id);
  };
  const every = (fn: () => void, ms: number) => {
    const id = setInterval(fn, ms);
    intervals.add(id);
    return id;
  };
  const stopEvery = (id: ReturnType<typeof setInterval>) => {
    clearInterval(id);
    intervals.delete(id);
  };

  const q = <E extends Element = HTMLElement>(sel: string) => root.querySelector<E>(sel);
  const qa = <E extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<E>(sel));
  const need = <E extends Element = HTMLElement>(sel: string): E => {
    const el = q<E>(sel);
    if (!el) throw new Error("homepage markup is missing " + sel);
    return el;
  };

  const nav = document.querySelector<HTMLElement>(T.nav);
  const flyPhone = need(T.flyPhone);
  const fly3d = need(T.fly3d);
  const featuresPin = need(T.featuresPin);
  const dots = qa(T.sceneDot);
  const copies = qa(T.featureCopy);
  const storePills = qa(T.storePill);
  const track = q(T.masonryTrack);
  let lastDotIdx = -1;

  /* tells the curtain's CSS failsafe that the script runs and owns it */
  html.classList.add("intro-live");

  /* ---------------------------------------------------------------
   * Lenis smooth scrolling — the page itself scrolls on an eased curve,
   * so the pinned sections, the DOM and the phone all read ONE smoothed
   * scroll value. Scrubs can then map 1:1 (scrub: true) with no extra lag.
   * Native touch scrolling on phones (Lenis only smooths the mouse wheel).
   * --------------------------------------------------------------- */
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = new Lenis({
    lerp: 0.09,
    // eased wheel scrolling is motion too; reduced-motion readers get native steps
    smoothWheel: !reducedMotion(),
    syncTouch: false,
  });
  const SCRUB = true;
  lenis.on("scroll", ScrollTrigger.update);
  const lenisTick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(lenisTick);
  gsap.ticker.lagSmoothing(0);
  /* Lenis only virtualizes the WHEEL — dragging the scrollbar or keyboard
   * jumps scroll natively behind its back and its position goes stale.
   * Resync Lenis whenever the native scroll moves without it. */
  window.addEventListener(
    "scroll",
    () => {
      if (!lenis.isScrolling && Math.abs(window.scrollY - lenis.animatedScroll) > 2) {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        ScrollTrigger.update();
      }
    },
    { passive: true, signal },
  );
  /* the mobile URL bar showing/hiding fires a resize that made
   * ScrollTrigger recompute the pin every time — ignore that resize class */
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---- device tiering ----
   * Everyone gets the pre-rendered image sequence: desktop the full journey
   * player, phones the shorter flight sheet plus the same back phone. If a
   * sequence fails to load, the PNG mockup phone takes over. */
  const IS_DESKTOP = window.innerWidth >= 900 && !window.matchMedia("(pointer: coarse)").matches;
  const phone: PhoneRenderer = IS_DESKTOP
    ? createPhoneSeqDesktop({
        phoneW: PHONE_W,
        phoneH: PHONE_H,
        meta: {
          frames: 32, cols: 8, rows: 4, fw: 704, fh: 1034, backBox: { w: 800, h: 980 },
          // Pix swipe window in still-C pixels: the screen below the status bar
          swipe: { x: 338, y: 330, w: 920, h: 1847, r: 118 },
        },
        urls: {
          seq1: "/assets/dphone-seq1.webp",
          seq2: "/assets/dphone-seq2.webp?v=3",
          a: "/assets/dphone-a.webp",
          b: "/assets/dphone-b.webp",
          c: "/assets/dphone-c.webp?v=3",
          c2: "/assets/dphone-c2.webp?v=1",
          q: "/assets/dphone-q.webp",
          t: "/assets/dphone-t.webp",
          back: "/assets/dphone-back.webp?v=2",
        },
      })
    : createPhoneSeq({
        phoneW: PHONE_W,
        phoneH: PHONE_H,
        // backBox: the back still's frame in phone-space px, as on desktop
        meta: { frames: 40, cols: 8, rows: 5, fw: 461, fh: 677, backBox: { w: 800, h: 980 } },
        sheetUrl: "/assets/phone-seq.webp",
        poseAUrl: "/assets/phone-pose-a.webp",
        poseBUrl: "/assets/phone-pose-b.webp",
        backUrl: "/assets/dphone-back.webp?v=2",
      });

  /* ---- single pose proxy: every scroll tween writes here, and the
   * ticker mirrors it onto whichever phone representation is live. ---- */
  const P: Pose = {
    x: 0, y: 0, scale: 1,
    rotZ: 0, rotY: 0, rotX: 0,
    alpha: 1,
    mix: 0, sQ: 0, sT: 0, sw: 0,
    prog: 0,
  };

  const flyS = {
    article: need(`${T.flyPhone} [data-screen="article"]`),
    pix2: need(`${T.flyPhone} [data-screen="pix2"]`),
    qix: need(`${T.flyPhone} [data-screen="qix"]`),
    trax: need(`${T.flyPhone} [data-screen="trax"]`),
  };

  /* entrance offset — folded into the pose so the intro can drop the phone
   * in without fighting the per-tick applier. On mobile there is no intro,
   * so the phone is visible from the first frame. */
  const NO_INTRO = window.innerWidth < 900;
  const introOff = NO_INTRO ? { y: 0, a: 1 } : { y: 140, a: 0 };

  let use3d = false;
  const SCRATCH: Pose = { ...P }; // reused every tick — no per-frame allocation
  const poseTick = () => {
    const can3d = phone.ready && !phone.demoted;
    if (can3d && !use3d) {
      use3d = true;
      // soft handoff: fade the PNG phone out as the sequence takes over
      gsap.to(flyPhone, { autoAlpha: 0, duration: 0.35, ease: "power1.out" });
    } else if (!can3d && use3d) {
      use3d = false; // demoted mid-session → hand back to the PNG phone
    }
    const y = P.y + introOff.y;
    const alpha = P.alpha * introOff.a;
    if (use3d) {
      Object.assign(SCRATCH, P);
      SCRATCH.y = y;
      SCRATCH.alpha = alpha;
      phone.apply(SCRATCH, window.scrollY);
    } else {
      gsap.set(flyPhone, { x: P.x, y, scale: P.scale, rotation: P.rotZ, autoAlpha: alpha });
      gsap.set(fly3d, { rotationY: P.rotY, rotationX: P.rotX });
      flyS.article.style.opacity = String(P.mix);
      flyS.pix2.style.opacity = String(P.mix);
      flyS.article.style.transform = "translateX(" + -100 * P.sw + "%)";
      flyS.pix2.style.transform = "translateX(" + 100 * (1 - P.sw) + "%)";
      flyS.qix.style.opacity = String(P.sQ);
      flyS.trax.style.opacity = String(P.sT);
    }
  };
  gsap.ticker.add(poseTick);

  const docRect = (el: Element): Rect => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      w: r.width,
      h: r.height,
      cx: r.left + window.scrollX + r.width / 2,
      cy: r.top + window.scrollY + r.height / 2,
    };
  };

  const poseFromRect = (rect: Pick<Rect, "cx" | "cy" | "w">, rotation = 0): PartialPose => ({
    x: rect.cx - PHONE_W / 2,
    y: rect.cy - PHONE_H / 2,
    scale: rect.w / PHONE_W,
    rotZ: rotation,
  });

  let ctx: gsap.Context | undefined; // the scroll scene, reverted on rebuilds
  /* the intro's tweens, reverted on teardown (restores the site header) */
  const introCtx = gsap.context(() => {}, root);

  /* ---------- masonry card wall (desktop scenes) ----------
   * ONE tall edge-to-edge wall of app cards behind the locked phone:
   * shortest-column layout, staggered blur-to-focus entrance, gentle scale
   * on hover. Rebuilt on every build() so resizes re-flow it. Returns how
   * far the wall rides up across the whole pin. */
  function buildMasonry(el: HTMLElement, vw: number, vh: number): number {
    el.replaceChildren();
    const W = el.clientWidth || vw;
    const cols = W >= 1500 ? 5 : W >= 1050 ? 4 : 3;
    const gap = 14;
    const colW = (W - gap * (cols - 1)) / cols;
    const colH: number[] = new Array<number>(cols).fill(0);
    /* the wall is ~2.8 viewports tall: over the 340vh pin it glides by at
     * a natural background-parallax rate with no bare patches */
    const wallH = vh * 2.8;
    let i = 0;
    while (Math.min(...colH) < wallH && i < 60) {
      const col = colH.indexOf(Math.min(...colH));
      const h = Math.round(M_HEIGHTS[i % M_HEIGHTS.length] * (colW / 300));
      const card = document.createElement("div");
      card.className = M_CARD_CLASS;
      card.style.width = colW + "px";
      card.style.height = h + "px";
      card.style.left = col * (colW + gap) + "px";
      card.style.top = colH[col] + "px";
      /* script-built decoration (alt=""), so a plain <img> */
      const img = document.createElement("img");
      img.className = M_IMG_CLASS;
      img.src = "/assets/" + M_IMGS[i % M_IMGS.length];
      img.decoding = "async";
      if (i >= cols * 3) img.loading = "lazy"; // below the first screen
      img.alt = "";
      card.appendChild(img);
      el.appendChild(card);
      colH[col] += h + gap;
      i++;
      // hover: a gentle scale-down
      card.addEventListener("mouseenter", () => gsap.to(card, { scale: 0.96, duration: 0.3, ease: "power2.out" }));
      card.addEventListener("mouseleave", () => gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" }));
    }
    const trackH = Math.max(...colH) - gap;
    el.style.height = trackH + "px";
    return Math.max(0, trackH - vh);
  }

  function build() {
    ctx?.revert();
    ctx = gsap.context(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      const hero = need(T.hero);
      const showcase = need(T.showcase);
      const faq = need(T.faq);

      /* ---------- measured geometry (document space) ---------- */
      const heroA = docRect(need(T.anchorHero));
      const showA = docRect(need(T.anchorShow));
      const showB = docRect(need(T.anchorBack));
      const featTop = docRect(need(T.features)).y;

      // the showcase back phone (doc coords)
      phone.setBackPhone({ cx: showB.cx, cy: showB.cy, w: showB.w, rotZ: -30, rotY: 20 });

      /* the phone floats free in the pinned features section — centered,
       * large (viewport coords, since the phone layer is fixed). On mobile
       * the phone sits in the UPPER half so the copy below it is never
       * covered. Sized by whichever budget is tighter — width OR height. */
      const isMobile = vw < 900;
      const hBudget = vh * (isMobile ? 0.44 : 0.7);
      const wBudget = vw * (isMobile ? 0.64 : 0.72);
      const floatScale = Math.min(hBudget / PHONE_H, wBudget / PHONE_W);
      const floatPose: PartialPose = {
        x: vw / 2 - PHONE_W / 2,
        // a touch lower on mobile so the phone top clears the scene markers
        y: vh * (isMobile ? 0.4 : 0.54) - PHONE_H / 2,
        scale: floatScale,
        rotZ: 0,
      };
      const hoverPose: PartialPose = {
        x: floatPose.x,
        y: floatPose.y - vh * 0.1,
        scale: floatScale * 0.93,
        rotZ: 5,
      };

      /* ---------- scroll waypoints ---------- */
      const s1 = Math.max(1, showA.cy - vh * 0.52); // showcase pose reached
      const s2 = Math.max(s1 + 1, featTop - vh * 0.75); // begin final descent
      const s3 = featTop; // pin start
      const s4 = s3 + vh * 0.28; // landing completes just inside the pin
      const sA = Math.min(Math.max(1, heroA.y - vh * 0.3), s1 - 1);

      const poseHero = poseFromRect(heroA, 0);
      const poseShow = poseFromRect(showA, 15);

      /* viewport pose at a given scroll position */
      const at = (pose: PartialPose, scroll: number) => ({ ...pose, y: pose.y - scroll });

      gsap.set(P, { ...at(poseHero, 0), rotY: 0, rotX: 0, alpha: 1, mix: 0, sQ: 0, sT: 0, sw: 0, prog: 0 });

      /* ---------- master flight timeline (hero -> showcase -> hover) ----------
       * ONE timeline owns the phone's position for the whole journey. The
       * pinned scene timeline never writes x/y/scale, so nothing fights
       * over the pose. */
      const flight = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: document.body,
          start: 0,
          end: () => s4,
          scrub: SCRUB,
          /* re-capture tween start values on every refresh — otherwise stale
           * captured starts replay when scrubbing backward */
          invalidateOnRefresh: true,
        },
      });

      const dA = sA / s4;
      const dB = (s1 - sA) / s4;
      const dC = (s2 - s1) / s4;
      const dD = (s3 - s2) / s4;
      const dE = (s4 - s3) / s4;

      // A: glued to the hero fan while the hero scrolls
      flight.to(P, { y: poseHero.y - sA, duration: dA }, 0);
      // B: glide down + tilt into the showcase, swinging in real 3D
      flight.to(P, { x: poseShow.x, y: poseShow.y - s1, rotZ: poseShow.rotZ, ease: "power2.inOut", duration: dB }, dA);
      flight
        .to(P, { rotY: 28, rotX: 6, duration: dB * 0.55, ease: "power2.in" }, dA)
        .to(P, { rotY: 16, rotX: 3, duration: dB * 0.45, ease: "power2.out" }, dA + dB * 0.55);
      // linear frame clock for the baked sequence (its easing is pre-rendered)
      flight.to(P, { prog: 1, duration: dB, ease: "none" }, dA);
      flight
        .to(P, { scale: poseShow.scale * 1.07, duration: dB * 0.55, ease: "power1.in" }, dA)
        .to(P, { scale: poseShow.scale, duration: dB * 0.45, ease: "power1.out" }, dA + dB * 0.55);
      // C: parked in the showcase beside the back phone, gliding with it
      flight.to(P, { y: poseShow.y - s2, duration: dC }, dA + dB);

      if (isMobile) {
        /* mobile has no pinned stage: the phone rides away with the
         * showcase and fades before the feature blocks arrive */
        flight.to(P, { y: poseShow.y - s4, ease: "none", duration: dD + dE }, dA + dB + dC);
        flight.to(P, { alpha: 0, ease: "power1.in", duration: (dD + dE) * 0.6 }, dA + dB + dC + (dD + dE) * 0.4);
      } else {
        // D: straighten and descend toward the features stage
        flight.to(
          P,
          { x: hoverPose.x, y: hoverPose.y, scale: hoverPose.scale, rotZ: hoverPose.rotZ, ease: "power2.inOut", duration: dD },
          dA + dB + dC,
        );
        flight
          .to(P, { rotY: 18, rotX: -4, duration: dD * 0.5, ease: "power2.inOut" }, dA + dB + dC)
          .to(P, { rotY: 6, rotX: 0, duration: dD * 0.5, ease: "power2.out" }, dA + dB + dC + dD * 0.5);
        // the screen turns to the article mid-air
        flight.to(P, { mix: 1, duration: dD * 0.35, ease: "none" }, dA + dB + dC + dD * 0.35);
        // E: settle into the floating pose as the pin takes hold
        flight.to(
          P,
          { x: floatPose.x, y: floatPose.y, scale: floatPose.scale, rotZ: 0, rotY: 0, ease: "power2.out", duration: dE },
          dA + dB + dC + dD,
        );
        // linear frame clock for baked swing 2 (legs D+E share one sheet)
        flight.to(P, { prog: 2, duration: dD + dE, ease: "none" }, dA + dB + dC);
      }

      /* ---------- features: pinned scene machine (10 time units) ---------- */
      const rows = qa(T.rowScene);
      if (!isMobile) applyLiquidGlass(copies); // per-panel lens, re-fit on rebuilds

      let mTravel = 0;
      if (!isMobile && track) mTravel = buildMasonry(track, vw, vh);

      /* the pinned story only exists on desktop; on phones the features
       * section is three blocks crossfading in a sticky stage */
      if (!isMobile) {
        const scenes = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: featuresPin,
            start: "top top",
            end: "+=340%",
            pin: true,
            scrub: SCRUB,
            invalidateOnRefresh: true, // same stale-start protection as the flight
            onUpdate(self) {
              const idx = Math.min(2, Math.floor(self.progress * 2.999));
              if (idx !== lastDotIdx) {
                lastDotIdx = idx;
                dots.forEach((d, i) => d.toggleAttribute("data-active", i === idx));
              }
            },
          },
        });

        /* the phone stays dead-still in the middle while each scene's
         * content SCROLLS UP past it. Scenes 1 and 2 start parked below the
         * viewport and ride up through it. */
        gsap.set(rows, { autoAlpha: 1, y: (i: number) => (i === 0 ? 0 : vh) });
        /* yPercent keeps every card vertically centred — GSAP's y transform
         * would otherwise overwrite the card's translateY(-50%) */
        gsap.set(copies, { autoAlpha: 1, yPercent: -50, y: (i: number) => (i === 0 ? 0 : vh) });

        /* the wall's entrance — staggered rise from below, blur resolving to
         * focus — as the pin arrives */
        const mCards = track ? Array.from(track.children) : [];
        if (mCards.length) {
          gsap.from(mCards, {
            scrollTrigger: { trigger: featuresPin, start: "top 60%" },
            y: 120,
            autoAlpha: 0,
            filter: "blur(10px)",
            stagger: 0.035,
            duration: 0.7,
            ease: "power3.out",
            clearProps: "filter",
          });
        }

        /* scroll ONLY moves the background wall, gliding up across the pin */
        if (track && mTravel) scenes.to(track, { y: -mTravel, ease: "none", duration: 10 }, 0);

        const swapScene = (pos: number, from: number, to: number, screenProp: "sQ" | "sT") => {
          const dur = 1.1;
          // outgoing content scrolls up and away
          scenes.to([rows[from], copies[from]], { y: -vh, ease: "none", duration: dur }, pos);
          // incoming content rides up into place
          scenes.to([rows[to], copies[to]], { y: 0, ease: "none", duration: dur }, pos);
          // the phone's screen changes as the new scene passes its middle
          scenes.to(P, { [screenProp]: 1, duration: 0.45, ease: "none" }, pos + dur * 0.35);
        };

        // mid-Pix: the card swipes right → left to its summary
        scenes.to(P, { sw: 1, duration: 0.9, ease: "power2.inOut" }, 1.1);

        swapScene(3.0, 0, 1, "sQ");
        swapScene(6.3, 1, 2, "sT");

        /* exit: the phone glides up and fades before the pin releases, so
         * nothing ever lingers over the FAQ */
        scenes.to(P, { alpha: 0, y: floatPose.y - vh * 0.18, scale: floatPose.scale * 0.92, duration: 0.55, ease: "power2.in" }, 9.4);
        scenes.to({}, { duration: 0.05 }, 9.95); // hold to the end
      } else {
        /* mobile: scroll crossfades the three blocks through the sticky
         * stage — opacity/transform only (fully composited, no repaints) */
        const blocks = qa(T.fmBlock);
        gsap.set(blocks, { autoAlpha: (i: number) => (i === 0 ? 1 : 0), y: 0 });
        const mScenes = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: need(T.featuresMobile), start: "top top", end: "bottom bottom", scrub: SCRUB },
        });
        mScenes.to({}, { duration: 10 }, 0); // 10-unit ruler
        const fadeTo = (pos: number, from: number, to: number) => {
          mScenes.to(blocks[from], { autoAlpha: 0, y: -26, duration: 0.9 }, pos);
          mScenes.fromTo(blocks[to], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, immediateRender: false }, pos + 0.35);
        };
        // the Pix card swipes to its summary before the Qix block arrives
        const fmStrip = blocks[0]?.querySelector(T.fmStrip);
        if (fmStrip) mScenes.fromTo(fmStrip, { xPercent: 0 }, { xPercent: -50, duration: 0.9, ease: "power2.inOut" }, 1.1);
        fadeTo(3.1, 0, 1);
        fadeTo(6.4, 1, 2);
      }

      /* ---------- hero panel goes full-bleed as the dark world takes over.
       * Desktop only: animating background-color/border-radius repaints the
       * whole hero every scrolled frame — a real jank source on phones. ---------- */
      if (!isMobile) {
        const fullBleed = { trigger: showcase, start: "top bottom", end: "top 62%", scrub: true };
        gsap.to(hero, { backgroundColor: "#0a0a0b", scrollTrigger: fullBleed, ease: "none" });
        // top corners only: the bottom edge is already square
        gsap.to(need(T.heroInner), { borderTopLeftRadius: 0, borderTopRightRadius: 0, scrollTrigger: { ...fullBleed }, ease: "none" });
        // hero copy drifts up a touch faster than the scroll — gentle depth
        gsap.to(qa(T.heroRise), {
          y: (i: number) => -(34 + i * 10),
          autoAlpha: 0.25,
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom 45%", scrub: true },
          ease: "none",
        });
      }

      /* ---------- nav melts into the dark world, back to light at the FAQ ---------- */
      if (nav) {
        ScrollTrigger.create({
          trigger: hero,
          start: "top+=90 top",
          endTrigger: faq,
          end: "top 64px",
          toggleClass: { targets: nav, className: "nav-dark" },
        });
      }

      /* ---------- showcase reveals ---------- */
      gsap.from(qa(T.showcaseReveal), {
        scrollTrigger: { trigger: showcase, start: "top 70%" },
        y: 40,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
      });
      if (!isMobile) {
        gsap.from(need(T.giantWords), {
          scrollTrigger: { trigger: showcase, start: "top 80%", end: "bottom top", scrub: 1 },
          xPercent: 6,
          ease: "none",
        });
      }

      /* ---------- FAQ + footer reveals ---------- */
      gsap.from(qa(T.faqLeftItems), {
        scrollTrigger: { trigger: faq, start: "top 72%" },
        y: 34,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(qa(T.faqItem), {
        scrollTrigger: { trigger: faq, start: "top 65%" },
        y: 24,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: "power2.out",
      });
      const footer = q(T.footer);
      const wordmark = q(T.footerWordmark);
      if (footer && wordmark) {
        gsap.from(wordmark, {
          scrollTrigger: { trigger: footer, start: "top 65%" },
          yPercent: 35,
          ease: "power2.out",
          duration: 1.1,
        });
      }
    }, root);
  }

  /* ---------- rebuild on resize (measurements go stale) ---------- */
  let resizeT: ReturnType<typeof setTimeout> | undefined;
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  window.addEventListener(
    "resize",
    () => {
      const wChanged = window.innerWidth !== lastW;
      /* mobile ignores height-only resizes (the URL bar shows/hides every
       * scroll). Desktop MUST rebuild on them: the poses and waypoints are
       * all vh-based. */
      const hChanged = IS_DESKTOP && window.innerHeight !== lastH;
      if (!wChanged && !hChanged) return;
      cancel(resizeT);
      resizeT = later(() => {
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        phone.resize();
        build();
        ScrollTrigger.refresh();
      }, 220);
    },
    { signal },
  );

  /* ---------- in-page anchors ride the smooth scroll ----------
   * delegated, so it also covers the persistent site header's #top /
   * #showcase / #features links */
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!a) return;
      let target: HTMLElement | null = null;
      try {
        target = document.querySelector<HTMLElement>(a.getAttribute("href") ?? "");
      } catch {
        return; // not a valid selector (e.g. a bare "#")
      }
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70, duration: 1.4 });
    },
    { signal },
  );

  /* ---------- "Download App" points the eye at the store pills ---------- */
  let flagTimer: ReturnType<typeof setTimeout> | undefined;
  function flagStorePills() {
    if (!storePills.length) return;
    cancel(flagTimer);
    storePills.forEach((b) => b.classList.remove("is-flagged"));
    // force a reflow so a second flag restarts the pulse instead of being ignored
    void storePills[0].offsetWidth;
    storePills.forEach((b) => b.classList.add("is-flagged"));
    flagTimer = later(() => storePills.forEach((b) => b.classList.remove("is-flagged")), 3400);
  }

  /* subpages link here as /#download — flash once the curtain is up */
  function flagFromHash() {
    if (disposed || location.hash !== "#download") return;
    history.replaceState(history.state, "", location.pathname + location.search);
    flagStorePills();
  }

  /* ---------- site entrance (doubles as the loading screen) ---------- */
  function assetsSettled(maxWait = 3500): Promise<unknown> {
    const model = new Promise<void>((res) => {
      const t0 = performance.now();
      const poll = every(() => {
        if (disposed || phone.ready || phone.failed || performance.now() - t0 > maxWait) {
          stopEvery(poll);
          res();
        }
      }, 100);
    });
    const imgs = Promise.all(qa<HTMLImageElement>(`${T.fanItem} img`).map((i) => i.decode().catch(() => {})));
    const cap = new Promise<void>((res) => later(res, maxWait));
    return Promise.race([Promise.all([model, imgs]), cap]);
  }

  /* hidden, not removed: the curtain is React-rendered markup */
  const dropCurtain = (el: HTMLElement | null) => {
    if (el) el.style.display = "none";
  };
  const markSeen = () => html.classList.add("intro-seen");

  async function playIntro() {
    const intro = q(T.intro);
    if (!intro) return;
    /* mobile: no intro at all — the site is visible from the first frame.
     * Also skipped for reduced-motion, when arriving mid-page, and on any
     * page view after the first of the visit. */
    if (!showIntro || NO_INTRO || reducedMotion() || window.scrollY > 40) {
      dropCurtain(intro);
      gsap.set(introOff, { y: 0, a: 1 });
      markSeen();
      return;
    }
    introStarted = true;
    lenis.stop();
    // logo rises immediately while assets load behind the curtain
    introCtx.add(() => {
      gsap.to(need(T.introLogo), { y: 0, duration: 0.7, ease: "power4.out", delay: 0.15 });
      gsap.to(need(T.introTag), { y: 0, duration: 0.6, ease: "power4.out", delay: 0.38 });
    });

    const minHold = new Promise<void>((res) => later(res, 1500));
    await Promise.all([assetsSettled(), minHold]);
    if (disposed) return;

    // everything heavy is decoded — lift the curtain
    const tl = introCtx.add(() => {
      const t = gsap.timeline({
        onComplete: () => {
          lenis.start();
          dropCurtain(intro);
          markSeen();
        },
      });
      t.to(need(T.introMark), { autoAlpha: 0, y: -26, duration: 0.4, ease: "power2.in" }, 0).to(
        intro,
        { yPercent: -100, duration: 0.85, ease: "power4.inOut" },
        0.22,
      );
      if (nav) t.from(nav, { yPercent: -110, duration: 0.7, ease: "power3.out" }, 0.42);
      t.from(qa(T.heroRise), { y: 46, autoAlpha: 0, stagger: 0.1, duration: 0.85, ease: "power3.out" }, 0.52)
        .from(qa(T.fanItem), { y: 110, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: "power3.out" }, 0.67)
        .to(introOff, { y: 0, a: 1, duration: 1.05, ease: "power3.out" }, 0.77);
      return t;
    });

    await tl; // timelines are thenable — resolves once the hero has settled
  }

  /* build after fonts are ready so measurements are stable */
  const fontsReady: Promise<unknown> = document.fonts ? document.fonts.ready : Promise.resolve();
  fontsReady
    .then(() => {
      if (disposed) return;
      build();
      ScrollTrigger.refresh();
      playIntro().then(flagFromHash);
      // headless/pre-rendered contexts can report a 0-size viewport at
      // load; rebuild once a real viewport shows up
      if (!window.innerWidth || !window.innerHeight) {
        const poll = every(() => {
          if (disposed) stopEvery(poll);
          else if (window.innerWidth && window.innerHeight) {
            stopEvery(poll);
            lastW = window.innerWidth;
            phone.resize();
            build();
            ScrollTrigger.refresh();
          }
        }, 250);
      }
    })
    .catch((err: unknown) => {
      // a failed build must not leave the intro curtain over the page
      console.error(err);
      dropCurtain(q(T.intro));
      lenis.start();
    });

  return () => {
    disposed = true;
    listeners.abort();
    for (const id of timeouts) clearTimeout(id);
    for (const id of intervals) clearInterval(id);
    timeouts.clear();
    intervals.clear();
    gsap.ticker.remove(lenisTick);
    gsap.ticker.remove(poseTick);
    gsap.ticker.lagSmoothing(500, 33); // GSAP's default
    ctx?.revert();
    introCtx.revert();
    gsap.killTweensOf([P, introOff, flyPhone]);
    lenis.destroy();
    phone.dispose();
    removeLiquidGlass(copies);
    track?.replaceChildren();
    storePills.forEach((b) => b.classList.remove("is-flagged"));
    /* the header outlives the page: drop the dark state and whatever the
     * intro left on it */
    if (nav) {
      nav.classList.remove("nav-dark");
      gsap.set(nav, { clearProps: "transform" });
    }
    /* a curtain that already started counts as seen for the rest of the
     * visit, even if the visitor left before it finished */
    if (introStarted) markSeen();
  };
}
