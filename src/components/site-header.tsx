"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader({ children }: { children?: ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 48) setScrolled(true);
    else if (value < 12) setScrolled(false);
  });

  return (
    <div
      className={cn(
        "sticky top-0 z-50 h-0 transition-[padding] duration-500 ease-out",
        scrolled ? "pt-3 px-3 sm:px-4" : "pt-0 px-0",
      )}
    >
      <motion.header
        layout
        initial={false}
        animate={{ borderRadius: scrolled ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
        className={cn(
          "relative mx-auto flex items-center justify-between transition-all duration-500 ease-out",
          scrolled
            ? "glass-header max-w-xl px-4 py-2"
            : "max-w-5xl border-b-0 bg-transparent px-6 py-5",
        )}
      >
        <Link href="/" className="shrink-0">
          <Brand />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {children}
        </div>
      </motion.header>
    </div>
  );
}