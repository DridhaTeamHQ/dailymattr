"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Shared drawer shell — Figma "Frame 180"/"Frame 251": right-docked panel
 * (564px auth / 589px subscribe) over a black scrim, rounded top-left 12px.
 * Springs in from the right; closes on scrim click or Esc.
 *
 * Kept as its own component rather than the shadcn Sheet: the Sheet's CSS
 * slide/fade keyframes, portal (outside the studio's scoped styles) and
 * Radix scroll lock (scrollbar compensation) would change the look and
 * motion. */
export function StudioDrawer({
  open,
  onClose,
  width = 564,
  scrim = 0.5,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  scrim?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            aria-label="Close"
            type="button"
            onClick={onClose}
            className="absolute inset-0 w-full bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: scrim }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="absolute bottom-0 right-0 top-0 flex w-full flex-col overflow-y-auto rounded-tl-[12px] bg-[#F4F4F6] shadow-2xl"
            style={{ maxWidth: width }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
