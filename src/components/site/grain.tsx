/* Film grain: a premium texture drifting over every marketing page. Blend
 * modes over the whole page are costly on mobile GPUs, so phones get a
 * plain, still, fainter layer. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Grain() {
  return (
    <div
      aria-hidden="true"
      style={{ backgroundImage: NOISE }}
      className="pointer-events-none fixed -inset-[3%] z-90 animate-grain-shift opacity-[.045] mix-blend-soft-light will-change-transform motion-reduce:animate-none mobile:animate-none mobile:opacity-[.03] mobile:mix-blend-normal"
    />
  );
}
