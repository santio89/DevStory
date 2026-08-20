"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader({ children }: { children?: ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 48 ? true : value < 12 ? false : null;
    if (next === null || next === scrolled) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setScrolled(next);
    });
  });

  return (
    <div
      className={cn(
        "sticky top-0 z-50 h-0 transition-[padding] duration-500 ease-out",
        scrolled ? "pt-3 px-3 sm:px-4" : "pt-0 px-0",
      )}
    >
      <header
        className={cn(
          "relative mx-auto flex items-center justify-between rounded-none transition-all duration-500 ease-out",
          scrolled
            ? "max-w-xl border-2 border-foreground bg-background px-4 py-2 shadow-hard-sm"
            : "max-w-5xl border-2 border-transparent bg-transparent px-6 py-4",
        )}
      >
        <Link href="/" className="shrink-0">
          <Brand />
        </Link>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeToggle />
          {children}
        </div>
      </header>
    </div>
  );
}