"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { MouseEvent } from "react";

export function HeroScrollCue({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const reduce = useReducedMotion();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.querySelector(href)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={label}
      className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-yellow text-bauhaus-ink shadow-hard-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-bauhaus-yellow/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      <motion.span
        animate={reduce ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex"
      >
        <ArrowDown className="size-5 stroke-[3]" aria-hidden />
      </motion.span>
    </a>
  );
}
