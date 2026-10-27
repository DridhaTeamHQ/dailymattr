/* Shared looks of the /support form's fields. Each overrides the shadcn
 * default it lands on (Label / Input / Textarea / SelectTrigger), so the
 * order inside a string matters to cn(): a text-[…] size must come before a
 * leading-[…] or the size drops it. `desktop:[@media(max-height:800px)]:` is
 * the original @media (min-width: 901px) and (max-height: 800px). */

/* was `.support-form label` (the label's own font is inherited by the
 * field inside it, as before) */
export const fieldLabel =
  "mb-[18px] block text-[16px] leading-[normal] font-normal select-auto desktop:[@media(max-height:800px)]:mb-3";

/* was `.support-form label span` — which also styled the topic value inside
 * the trigger, so the trigger shows it in the same small caps */
export const fieldLabelText = "mb-2 ml-0.5 block text-[12px] font-semibold tracking-[.8px] text-white/55 uppercase";

/* was `.support-form input, .support-form textarea, .support-topic-trigger`.
 * The border colour runs through --field-border so hover, focus and the
 * (unstyled) aria-invalid state all resolve it the same way; hover yields
 * to focus whatever order the variants are emitted in. */
export const fieldBox = [
  "h-auto w-full rounded-[12px] border border-solid bg-white/[.065] px-[15px] py-[14px] text-[15px] text-white outline-none md:text-[15px]",
  "[--field-border:rgba(255,255,255,.14)] border-(--field-border)",
  "transition-[border-color,background,box-shadow,transform] duration-200 ease-[ease]",
  "placeholder:text-white/30",
  "focus-visible:border-(--field-border) focus-visible:bg-white/10 focus-visible:shadow-[0_0_0_4px_rgba(60,123,255,.11)] focus-visible:ring-0 focus-visible:[--field-border:var(--color-brand-soft)]",
  "aria-invalid:border-(--field-border) aria-invalid:ring-0",
  "desktop:[@media(max-height:800px)]:px-[14px] desktop:[@media(max-height:800px)]:py-[11px]",
].join(" ");

/* the inputs and the textarea */
export const field = `${fieldBox} hover:not-focus:[--field-border:rgba(255,255,255,.27)]`;
