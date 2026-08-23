"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/locale/locale-provider";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import { fluidSpring } from "@/lib/motion/reveal";
import { Loader2 } from "lucide-react";

function Bar({ className = "" }: { className?: string }) {
  return <SkeletonBar className={className} />;
}

export function StoryTranslating() {
  const { t } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fluidSpring}
      className="space-y-8"
    >
      <div className="relative rounded-none border-2 border-foreground bg-card px-6 py-10 shadow-hard sm:px-12 sm:py-14">
        <span className="pointer-events-none absolute top-6 right-6 size-8 rounded-full border-2 border-foreground bg-bauhaus-sky/30" />
        <div className="relative">
          <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-bauhaus-deep uppercase">
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
              className={`relative rounded-none border-2 border-foreground bg-card p-6 shadow-hard sm:p-7 ${
                i % 2 === 0 ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bar className="w-24" />
                <span className="h-[2px] flex-1 bg-foreground/70" />
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