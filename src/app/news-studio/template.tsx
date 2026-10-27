"use client";

import { motion } from "framer-motion";
import { useBooted } from "@/lib/studio/boot";

/* Light cross-page fade: a template remounts on every navigation between
 * studio pages (not on ?query changes), so each page eases in instead of
 * snapping — no exit animation, as across the app. The server-rendered
 * first page is already on screen, so it starts at full opacity. */
export default function NewsStudioTemplate({ children }: { children: React.ReactNode }) {
  const booted = useBooted();
  return (
    <motion.div initial={booted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.28, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
