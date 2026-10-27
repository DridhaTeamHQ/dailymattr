import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* The site's rounded "pill" buttons (was .btn / .btn-dark / .btn-store /
 * .btn-avatar). Apply to <a>, <Link> or <button>:
 *   <a className={pill({ variant: "brand", shine: true })}>Download App</a>
 * The variants override the base padding/size, so the result goes through
 * cn() (tailwind-merge) — cva alone would leave both and let CSS order win. */
const pillVariants = cva(
  "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-none px-[18px] py-[9px] font-sans text-[14px] font-semibold transition-[transform,translate,box-shadow,background] duration-[250ms] ease-[ease] hover:-translate-y-px",
  {
    variants: {
      variant: {
        /* blue CTA */
        brand: "relative overflow-hidden bg-brand text-white hover:bg-[#2f68e6]",
        /* store pills: solid white with dark type (Figma hero) */
        store:
          "border border-solid border-white bg-white px-6 py-3 text-[16px] text-ink hover:bg-[#ececf0] [@media(max-width:380px)]:px-[18px] [@media(max-width:380px)]:py-[11px] [@media(max-width:380px)]:text-[14px] [&.is-flagged]:z-[2] [&.is-flagged]:animate-store-flag motion-reduce:[&.is-flagged]:animate-none motion-reduce:[&.is-flagged]:shadow-[0_0_0_3px_rgba(46,102,230,.9)]",
        avatar: "size-[38px] justify-center bg-brand p-0 text-white hover:bg-[#2f68e6]",
        ghost: "bg-transparent px-2.5 text-ink",
      },
      /* a light sweep across the button (was .shine) */
      shine: {
        /* the start offset is a transform (not `translate`) so the keyframes
         * replace it instead of adding to it */
        true: "after:absolute after:inset-0 after:[transform:translateX(-120%)] after:animate-shine after:bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,.35)_50%,transparent_70%)] after:content-[''] motion-reduce:after:animate-none",
        false: "",
      },
    },
    defaultVariants: { variant: "brand", shine: false },
  },
);

export type PillProps = VariantProps<typeof pillVariants>;

export const pill = (props?: PillProps & { className?: string }) =>
  cn(pillVariants({ variant: props?.variant, shine: props?.shine }), props?.className);
