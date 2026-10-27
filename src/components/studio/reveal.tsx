"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/* Scroll reveal — fades + rises content as it enters the viewport. `delay`
 * (s) staggers siblings; `y` tunes the travel. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  once = true,
  className = "",
  ...rest
}: { delay?: number; y?: number; once?: boolean } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
