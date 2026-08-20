"use client";

import { motion } from "framer-motion";
import { Timeline } from "@/components/timeline/timeline";
import { resolveToken, Sigil } from "@/components/story/sigil";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { TokenId } from "@/lib/devstory/tokens";
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
  const { t } = useLocale();
  const lastEra = story.eras[story.eras.length - 1] ?? story.eras[0];
  const heroToken: TokenId = lastEra ? resolveToken(lastEra) : "sprout";

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/60 to-transparent px-6 py-10 sm:px-12 sm:py-14"
      >
        <div
          className="pointer-events-none absolute -top-14 -right-14 opacity-[0.08]"
          aria-hidden="true"
        >
          <Sigil token={heroToken} className="size-72" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-fuchsia-500/10 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-cyan-400/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-muted/70 px-3 py-1 font-mono text-xs text-muted-foreground">
            <Wand2 className="size-3 text-cyan-400" />
            {mode === "ai" ? t.story.crafted : t.story.previewSample}
          </span>

          <h3 className="mt-6 max-w-3xl font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
            {story.title.split(/\s+/).map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={
                  i > 0 && i >= Math.floor(story.title.split(/\s+/).length / 2)
                    ? "aurora-text title-glow"
                    : undefined
                }
              >
                {word}{" "}
              </span>
            ))}
          </h3>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
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