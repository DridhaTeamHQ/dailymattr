import Image from "next/image";

/* The loading curtain (desktop, first page view of a visit only). It is in
 * the server HTML so it covers the page from the first paint; the
 * choreography lifts it once the hero assets are decoded.
 *  - html.intro-seen (set when the visit is under way) hides it;
 *  - phones never get it, not even as a flash before JS runs;
 *  - failsafe: if the script never runs (html never gets .intro-live), the
 *    curtain hides itself after 15s.
 * It is pre-promoted (will-change) so the lift never waits on
 * rasterization. */
export function IntroCurtain() {
  return (
    <div
      id="intro"
      aria-hidden="true"
      className="fixed inset-0 z-100 flex items-center justify-center bg-coal will-change-transform [html:not(.intro-live)_&]:animate-[intro-failsafe_0s_linear_15s_forwards] [.intro-seen_&]:hidden mobile:hidden!"
    >
      <div data-intro-mark className="overflow-hidden text-center will-change-[transform,opacity]">
        <span data-intro-logo className="block will-change-transform [transform:translateY(110%)]">
          <Image
            src="/assets/publisher-logo.png"
            width={156}
            height={32}
            alt="dailymattr"
            sizes="470px"
            loading="eager"
            className="block h-auto w-[clamp(260px,34vw,470px)]"
          />
        </span>
        <span data-intro-tag className="mt-[10px] block font-sans text-[12px] font-semibold tracking-[3px] text-brand uppercase [transform:translateY(160%)]">
          STORIES THAT MATTR
        </span>
      </div>
    </div>
  );
}
