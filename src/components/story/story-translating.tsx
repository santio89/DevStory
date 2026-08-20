"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/locale/locale-provider";
import { Loader2 } from "lucide-react";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-3 animate-pulse rounded-full bg-gradient-to-r from-sky-400/20 via-muted to-cyan-400/20 ${className}`}
    />
  );
}

export function StoryTranslating() {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/60 to-transparent px-6 py-10 sm:px-12 sm:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Loader2 className="size-3.5 animate-spin" />
            {t.story.translating}
          </div>
          <div className="mt-8 max-w-3xl space-y-3">
            <Bar className="w-3/4" />
            <Bar className="w-1/2" />
          </div>
          <div className="mt-8 max-w-2xl space-y-2.5">
            <Bar className="w-full" />
            <Bar className="w-full" />
            <Bar className="w-2/3" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            <article
              className={`relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-7 ${
                i % 2 === 0 ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bar className="w-24" />
                <span className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
                <Bar className="w-16" />
              </div>
              <div className="mt-4 space-y-2">
                <Bar className="w-1/2" />
                <Bar className="w-full" />
                <Bar className="w-3/4" />
              </div>
            </article>
          </div>
        ))}
      </div>
    </motion.div>
  );
}