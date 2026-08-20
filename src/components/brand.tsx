"use client";

import { motion } from "framer-motion";

export function Brand() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
      <span className="inline-block size-2 rounded-full bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.6)]" />
      <span className="title-glow inline-block">
        <motion.span
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="aurora-text inline-block"
        >
          DevStory
        </motion.span>
      </span>
    </span>
  );
}