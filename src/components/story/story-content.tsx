"use client";

import { motion } from "framer-motion";
import { Timeline } from "@/components/timeline/timeline";
import type { DevStory } from "@/lib/devstory/story";
import { Wand2 } from "lucide-react";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function StoryContent({
  story,
  mode,
}: {
  story: DevStory;
  mode: "ai" | "mock";
}) {
  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-10 sm:px-12 sm:py-14"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-amber-400/10 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-blue-500/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/70 px-3 py-1 font-mono text-xs text-zinc-400">
            <Wand2 className="size-3 text-amber-400" />
            {mode === "ai"
              ? "crafted by the biographer"
              : "preview sample · add an AI key for the real story"}
          </span>

          <h3 className="mt-6 max-w-3xl font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
            {story.title.split(/\s+/).map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={
                  i > 0 && i >= Math.floor(story.title.split(/\s+/).length / 2)
                    ? "animate-[shimmer_8s_ease_infinite] bg-[length:200%_auto] bg-gradient-to-r from-amber-300 via-orange-400 to-blue-400 bg-clip-text text-transparent"
                    : undefined
                }
              >
                {word}{" "}
              </span>
            ))}
          </h3>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {story.summary}
          </p>
        </div>
      </motion.div>

      <div className="relative">
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-1/2 -z-10 w-72 -translate-x-1/2 bg-violet-500/5 blur-[100px]"
          aria-hidden="true"
        />
        <Timeline eras={story.eras} />
      </div>
    </div>
  );
}