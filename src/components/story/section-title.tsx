"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BiographerMarkIcon,
  BrainMarkIcon,
} from "@/components/story/story-decorations";

const ease = [0.22, 1, 0.36, 1] as const;

export function SectionTitle({
  section,
  title,
  mark,
  className,
}: {
  section: string;
  title: string;
  mark: "brain" | "biographer";
  className?: string;
}) {
  const Mark = mark === "brain" ? BrainMarkIcon : BiographerMarkIcon;

  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <p className="flex items-center gap-1.5 font-mono text-xs font-bold leading-none tracking-[0.2em] text-muted-foreground uppercase">
        <motion.span
          className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground"
          initial={{ opacity: 0, scale: 0.75, rotate: mark === "brain" ? -12 : 12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <Mark className="size-4" />
        </motion.span>
        <span className="leading-none">{section}</span>
      </p>
      <h2 className="mt-1 font-heading text-2xl font-black tracking-normal text-balance uppercase sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
