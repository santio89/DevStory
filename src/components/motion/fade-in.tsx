"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  footerReveal,
  footerSpring,
  heroReveal,
  heroSpring,
  revealViewport,
  strikeReveal,
  strikeSpring,
  subtleReveal,
  subtleSpring,
} from "@/lib/motion/reveal";

export type RevealVariant = "subtle" | "hero" | "strike" | "footer" | "enter";

const PRESETS = {
  subtle: { ...subtleReveal, transition: subtleSpring, mode: "view" as const },
  enter: { ...subtleReveal, transition: subtleSpring, mode: "mount" as const },
  hero: { ...heroReveal, transition: heroSpring, mode: "mount" as const },
  strike: { ...strikeReveal, transition: strikeSpring, mode: "mount" as const },
  footer: { ...footerReveal, transition: footerSpring, mode: "view" as const },
};

export function Reveal({
  children,
  delay = 0,
  className,
  variant = "subtle",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  const preset = PRESETS[variant];

  return (
    <motion.div
      className={className}
      initial={preset.initial}
      {...(preset.mode === "mount"
        ? { animate: preset.visible }
        : { whileInView: preset.visible, viewport: revealViewport })}
      transition={{ ...preset.transition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className,
  variant = "subtle",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <Reveal delay={delay} className={className} variant={variant}>
      {children}
    </Reveal>
  );
}
