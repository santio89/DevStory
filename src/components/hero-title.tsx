"use client";

import { motion } from "framer-motion";

export function HeroTitle({
  first,
  second,
}: {
  first: string;
  second: string;
}) {
  const FIRST_LINE = first.split("");

  return (
    <h1 className="relative z-10 mt-8 max-w-3xl font-heading text-5xl leading-[1.02] font-black tracking-tight text-balance uppercase sm:text-7xl">
      <span className="block text-foreground">
        {FIRST_LINE.map((letter, i) => (
          <motion.span
            key={`code-${i}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1 + i * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </span>
      <span className="mt-2 inline-block bg-bauhaus-yellow px-3 py-1 text-bauhaus-ink shadow-hard">
        <motion.span
          className="inline-block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {second}
        </motion.span>
      </span>
    </h1>
  );
}