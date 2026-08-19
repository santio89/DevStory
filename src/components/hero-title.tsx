"use client";

import { motion } from "framer-motion";

const FIRST_LINE = "Your Code.".split("");

export function HeroTitle() {
  return (
    <h1 className="mt-8 max-w-3xl font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-7xl">
      <span className="inline-block">
        {FIRST_LINE.map((letter, i) => (
          <motion.span
            key={`code-${i}`}
            initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.6,
              delay: 0.12 + i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </span>{" "}
      <span className="inline-block title-glow">
        <motion.span
          initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="aurora-text inline-block"
        >
          Your Story.
        </motion.span>
      </span>
    </h1>
  );
}