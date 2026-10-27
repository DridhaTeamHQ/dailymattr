"use client";

import { Accordion as AccordionPrimitive } from "radix-ui";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

/* The FAQ list: one item open at a time (was <details> + a script).
 *
 * shadcn's Accordion/AccordionItem are restyled through className; the
 * header, trigger and content come straight from the Radix primitives,
 * because shadcn's AccordionTrigger wraps the question in an <h3> (the
 * original had no headings here) and its AccordionContent unmounts closed
 * answers and animates the height (the original <details> kept every
 * answer in the HTML and opened instantly). forceMount + hidden-when-closed
 * restores both. */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="0"
      className="block rounded-[18px] border border-solid border-[#ececef] bg-lm-50 px-[26px] py-[6px]"
    >
      {items.map((item, i) => (
        <AccordionItem
          key={item.q}
          value={String(i)}
          data-faq-item
          className="border-b border-dashed border-[#dcdce1] last:border-b-0"
        >
          <AccordionPrimitive.Header asChild>
            <div>
              <AccordionPrimitive.Trigger className="relative block w-full cursor-pointer py-[22px] pr-[34px] pl-0 text-left text-[17px] font-semibold after:absolute after:top-1/2 after:right-[4px] after:text-[22px] after:font-normal after:text-ink after:content-['+'] after:[transform:translateY(-50%)] after:[transition:transform_.25s_ease] data-[state=open]:after:content-['−']">
                {item.q}
              </AccordionPrimitive.Trigger>
            </div>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content forceMount className="data-[state=closed]:hidden">
            <p className="pt-0 pr-[40px] pb-[24px] pl-0 text-[15.5px] leading-[1.65] text-ink-soft">{item.a}</p>
          </AccordionPrimitive.Content>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
