/* "More than news." — the dark showcase the flying phone parks in. On
 * phones it becomes a flex column (title → phones → copy) so heights never
 * collide, whatever the title wraps to. */
export function Showcase() {
  return (
    <section
      id="showcase"
      className="relative min-h-[1300px] overflow-hidden bg-coal pt-[140px] pb-[160px] mobile:flex mobile:min-h-0 mobile:flex-col mobile:pt-[clamp(92px,14vh,130px)] mobile:pb-[clamp(56px,9vh,90px)]"
    >
      <p
        data-showcase-reveal
        className="pl-[69px] text-[12px] font-semibold tracking-[3.5px] text-[rgba(255,255,255,.85)] mobile:order-1 mobile:pr-[24px] mobile:pl-[clamp(20px,6vw,40px)]"
      >
        <mark className="bg-white px-[6px] py-[3px] text-coal">ONE APP.</mark> EVERY FORMAT.
      </p>
      <h2
        data-showcase-reveal
        className="mt-[22px] max-w-[900px] pl-[66px] text-[clamp(36px,4vw,58px)] leading-[1.18] font-semibold tracking-[-1px] text-white mobile:order-2 mobile:pr-[24px] mobile:pl-[clamp(20px,6vw,40px)] mobile:text-[clamp(27px,6.4vw,42px)] mobile:leading-[1.14]"
      >
        More than news.{" "}
        <span className="text-[#5c5c62]">
          {" "}Built for all <br /> that mattrs.
        </span>
      </h2>
      {/* decorative, stays absolute on phones too */}
      <div
        data-giant-words
        aria-hidden="true"
        className="pointer-events-none absolute top-[46%] right-0 left-0 overflow-hidden text-center text-[clamp(64px,10vw,150px)] font-extrabold tracking-[-3px] whitespace-nowrap text-[#202025] select-none mobile:text-[22vw] mobile:leading-[.9]"
      >
        <div className="flex w-max gap-0 animate-[giant-words-marquee_22s_linear_infinite] motion-reduce:animate-none mobile:[animation-duration:16s]">
          <span className="block flex-[0_0_auto] whitespace-pre">READ. WATCH. LISTEN. </span>
          <span className="block flex-[0_0_auto] whitespace-pre">READ. WATCH. LISTEN. </span>
        </div>
      </div>
      <p className="relative z-3 mt-[420px] max-w-[460px] pl-[69px] text-[15px] leading-[1.85] text-[rgba(255,255,255,.92)] mobile:static mobile:order-4 mobile:mt-[clamp(14px,3vh,30px)] mobile:max-w-none mobile:px-[clamp(20px,6vw,40px)] mobile:text-[14.5px] [@media(min-width:620px)_and_(max-width:900px)]:max-w-[34rem]">
        No fluff. No clutter. No confusion.
      </p>
      {/* landing spots for the phones: the flying phone parks on the front
          anchor, the baked back phone sits on the back one — a diagonal
          pair, front high-right, back lower-left */}
      <div
        data-showcase-stage
        className="pointer-events-none absolute top-0 right-0 h-full w-[60%] mobile:relative mobile:top-auto mobile:right-auto mobile:left-auto mobile:order-3 mobile:mt-[clamp(18px,4vh,40px)] mobile:h-[clamp(300px,44vh,500px)] mobile:w-full"
      >
        <div
          id="anchor-showcase"
          className="pointer-events-none absolute top-[150px] left-[calc(44%_-_128px)] h-[526px] w-[256px] mobile:top-[3%] mobile:left-[55%] mobile:aspect-[256/526] mobile:h-auto mobile:w-[clamp(150px,42vw,232px)] mobile:-translate-x-1/2"
        />
        <div
          id="anchor-showback"
          className="pointer-events-none absolute top-[320px] left-[calc(22%_-_120px)] h-[493px] w-[240px] mobile:top-[33%] mobile:left-[5vw] mobile:aspect-[240/493] mobile:h-auto mobile:w-[clamp(114px,32vw,184px)]"
        />
      </div>
    </section>
  );
}
