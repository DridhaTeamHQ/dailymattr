import Image from "next/image";

/* The PNG mockup phone: the fallback flying phone, shown only if the baked
 * phone sequence fails to load. The choreography moves it with transforms
 * and swaps its screens by writing opacity/transform on the <img>s. Its
 * natural size is kept LARGE (400×822) so scroll poses only ever scale it
 * down — upscaling a rasterized layer blurs the screens. */

const SCREENS = [
  { name: "home", src: "/assets/screen-home.jpg" },
  { name: "article", src: "/assets/screen-pix.jpg" },
  { name: "pix2", src: "/assets/screen-pix-2.jpg" },
  { name: "qix", src: "/assets/screen-qix.jpg" },
  { name: "trax", src: "/assets/screen-trax.jpg" },
];

export function FlyPhone() {
  return (
    <div
      id="fly-phone"
      aria-hidden="true"
      className="invisible fixed top-0 left-0 z-40 h-phone-h w-phone-w origin-center perspective-[1500px] will-change-transform"
    >
      <div data-fly-3d className="absolute inset-0 transform-3d will-change-transform">
        <Image
          width={642}
          height={1321}
          src="/assets/phone-frame.png"
          alt=""
          loading="eager"
          className="pointer-events-none absolute inset-0 z-2 h-full w-full [filter:drop-shadow(0_50px_80px_rgba(0,0,0,.55))] mobile:[filter:drop-shadow(0_18px_26px_rgba(0,0,0,.5))]"
        />
        {/* screen overlay on top of the frame's baked screen (frame is
            214x440 with the screen at 7,6 200x424) */}
        <div className="absolute top-[1.36%] right-[3.27%] bottom-[2.27%] left-[3.27%] z-3 overflow-hidden rounded-[40px] bg-black">
          {SCREENS.map((s) => (
            <Image
              key={s.name}
              width={900}
              height={2045}
              src={s.src}
              alt=""
              data-screen={s.name}
              className={`absolute inset-0 h-full w-full object-cover object-top ${s.name === "home" ? "" : "opacity-0"}`}
            />
          ))}
          <span className="pointer-events-none absolute inset-0 z-6 bg-[linear-gradient(112deg,transparent_42%,rgba(255,255,255,.10)_47%,rgba(255,255,255,.03)_55%,transparent_60%)]" />
        </div>
      </div>
    </div>
  );
}
