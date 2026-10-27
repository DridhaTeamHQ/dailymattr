"use client";

import type { KeyboardEvent, Ref } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TOPICS } from "@/lib/support/validation";
import { cn } from "@/lib/utils";
import { fieldBox, fieldLabel, fieldLabelText } from "./classes";

/* the trigger keeps the focused look while its menu is open (was
 * `.support-topic-field:focus-within .support-topic-trigger`) */
const trigger = cn(
  fieldBox,
  "w-full cursor-pointer gap-0 text-left whitespace-normal data-placeholder:text-white data-[size=default]:h-auto",
  /* the value reads like the field labels (block, small caps). Set from
   * here: Radix's SelectValue drops its own className. */
  "*:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:block *:data-[slot=select-value]:mb-2 *:data-[slot=select-value]:ml-0.5",
  "*:data-[slot=select-value]:text-[12px] *:data-[slot=select-value]:font-semibold *:data-[slot=select-value]:tracking-[.8px] *:data-[slot=select-value]:text-white/55 *:data-[slot=select-value]:uppercase",
  "hover:not-focus:not-data-[state=open]:[--field-border:rgba(255,255,255,.27)]",
  "focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(60,123,255,.11)] focus:[--field-border:var(--color-brand-soft)]",
  "data-[state=open]:bg-white/10 data-[state=open]:shadow-[0_0_0_4px_rgba(60,123,255,.11)] data-[state=open]:[--field-border:var(--color-brand-soft)]",
  "[&_svg]:text-white/70 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-[ease] data-[state=open]:[&_svg]:rotate-180",
);

/* opens 10px up over the trigger's bottom edge, full trigger width, never
 * flips (was `top: calc(100% - 10px); left: 0; right: 0`) */
const menu = cn(
  "z-50 w-(--radix-select-trigger-width) min-w-0 rounded-[12px] border border-solid border-white/16 bg-[#202023] p-2 shadow-[0_18px_45px_rgba(0,0,0,.34)] ring-0",
  "[&_[data-radix-select-viewport]]:grid [&_[data-radix-select-viewport]]:gap-1",
  "data-[side=bottom]:translate-y-0",
  /* data-[state=…] outranks shadcn's :where()-based data-open/closed
   * animations, which stay inert */
  "data-[state=open]:animate-[support-topic-in_.18s_ease] data-[state=closed]:animate-[support-topic-out_.18s_ease_forwards]",
);

const option = cn(
  "cursor-pointer gap-0 rounded-[8px] px-3 py-[11px] text-[14px] text-white/78",
  "transition-[background,color] duration-[180ms] ease-[ease]",
  "hover:bg-[rgba(60,123,255,.18)] hover:text-white focus:bg-[rgba(60,123,255,.18)] focus:text-white not-data-[variant=destructive]:focus:**:text-white",
  "data-[state=checked]:bg-[rgba(60,123,255,.18)] data-[state=checked]:text-white",
  /* no check mark: the selected option is shown by its tint alone */
  "[&_svg]:hidden",
);

/* the arrow keys wrap around the list, as the original menu did */
function wrapArrowKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const options = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role='option']"));
  const index = options.findIndex((item) => item === document.activeElement);
  const down = event.key === "ArrowDown";
  if (index !== (down ? options.length - 1 : 0)) return;
  event.preventDefault();
  options[down ? 0 : options.length - 1]?.focus();
}

type TopicSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invalid: boolean;
  triggerRef: Ref<HTMLButtonElement>;
};

/* The "Support topic" dropdown (was a hand-made listbox): a shadcn Select
 * dressed as the original trigger and menu. Its hidden native <select
 * name="topic"> carries the value into the form data; it is deliberately
 * not `required`, so an empty topic reaches the form's own check, which
 * names the problem and opens the menu. */
export function TopicSelect({ value, onValueChange, open, onOpenChange, invalid, triggerRef }: TopicSelectProps) {
  return (
    <Label className={cn(fieldLabel, "relative")}>
      <span id="support-topic-label" className={fieldLabelText}>
        Support topic
      </span>
      <Select name="topic" value={value} onValueChange={onValueChange} open={open} onOpenChange={onOpenChange}>
        <SelectTrigger
          ref={triggerRef}
          id="support-topic-trigger"
          aria-labelledby="support-topic-label support-topic-value"
          aria-invalid={invalid || undefined}
          className={trigger}
        >
          <SelectValue id="support-topic-value" placeholder="Select a topic" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          sideOffset={-10}
          avoidCollisions={false}
          aria-label="Support topic"
          onKeyDown={wrapArrowKeys}
          className={menu}
        >
          {TOPICS.map((topic) => (
            <SelectItem key={topic} value={topic} className={option}>
              {topic}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Label>
  );
}
